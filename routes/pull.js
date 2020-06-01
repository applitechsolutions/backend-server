var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Pull = require('../models/pull');

/**
 * LISTAR PULLS ACTIVOS
 */

app.get('/', function (req, res) {

    Pull.find({
        state: false
    }, '_order _material mts totalMts kg totalKg')
        .populate({
            path: '_order',
            populate: {
                path: '_destination'
            }
        })
        .populate('_material', '')
        .sort({
            _id: 'desc'
        })
        .exec(
            function (err, pulls) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando ordenes',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    pulls: pulls
                });
            });
});

/**
 * LISTAR pulls FINALIZADOS
 */

app.get('/finisheds', function (req, res) {

    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    Pull.aggregate([{
        $match: {
            "state": true
        }
    }, {
        $lookup: {
            from: "materials",
            localField: "_material",
            foreignField: "_id",
            as: "_material"
        },
    }, {
        $unwind: '$_material'
    }, {
        $lookup: {
            from: "orders",
            localField: "_order",
            foreignField: "_id",
            as: "_order"
        },
    }, {
        $unwind: '$_order'
    }, {
        $match: {
            "_order.date": {
                $gte: startDate,
                $lte: endDate
            },
        }
    },
    {
        $lookup: {
            from: "destinations",
            localField: "_order._destination",
            foreignField: "_id",
            as: "_order._destination"
        },
    }, {
        $unwind: '$_order._destination'
    }, {
        $sort: { "_order.date": 1 }
    },
    {
        $project: {
            _id: '$_id',
            _order: 1,
            _material: 1,
            mts: '$mts',
            totalMts: '$totalMts',
            kg: '$kg',
            totalKg: '$totalKg',
            details: '$details'
        }
    }], function (err, pulls) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error listando ordenes',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            pulls: pulls
        });
    });
});

/**
 * FINALIZAR pull
 */

app.put('/finish/:id/:details', mdAuth.verificaToken, function (req, res) {
    var id = req.params.id;
    var details = req.params.details;

    Pull.findById(id, function (err, pull) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar orden',
                errors: err
            });
        }

        if (!pull) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El orden con el id' + id + ' no existe',
                errors: {
                    message: 'No existe un orden con ese ID'
                }
            });
        }

        pull.state = true;
        pull.details = details;

        pull.save(function (err, pullB) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar orden',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                pull: pullB
            });
        });

    });
});

/**
 * CREAR PULL
 */

app.post('/', mdAuth.verificaToken, function (req, res) {

    var body = req.body;

    var pull = new Pull({
        _order: body._order,
        _material: body._material,
        mts: body.mts,
        totalMts: body.totalMts,
        kg: body.kg,
        totalKg: body.totalKg
    });

    pull.save(function (err, pullG) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear pull',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            pull: pullG,
            usuarioToken: req.usuario
        });
    });

});


module.exports = app;