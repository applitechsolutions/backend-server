var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var GreenBill = require('../models/greenBill');
var GreenTrip = require('../models/greenTrips');

/**
 * LISTAR DETALLE FACTURA VERDE POR FECHAS
 */

app.get('/', function(req, res) {

    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    GreenBill.find({
            state: false,
            "date": {
                $gte: startDate,
                $lte: endDate
            }
        }, 'noBill serie date oc ac details total paid')
        .populate('_customer', 'name nit address mobile')
        .exec(
            function(err, bills) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al listar facturas',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    facturas: bills
                });

            });
});

/**
 * LISTAR DETALLE FACTURA VERDE POR FECHAS
 */

app.get('/detalles', function(req, res) {

    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    GreenTrip.aggregate([{
            $match: {
                "date": {
                    $gte: startDate,
                    $lte: endDate
                },
                "state": false
            }
        }, {
            $match: {
                "date": {
                    $gte: startDate,
                    $lte: endDate
                },
                "state": false
            }
        }, {
            $lookup: {
                from: "typetrips",
                localField: "_type",
                foreignField: "_id",
                as: "_type"
            },
        }, {
            $unwind: '$_type'
        }, {
            $lookup: {
                from: "vehicles",
                localField: "_vehicle",
                foreignField: "_id",
                as: "_vehicle"
            },
        }, {
            $unwind: '$_vehicle'
        },
        {
            $group: {
                _id: "$_type._id", // El valor por el cual se agrupa
                prod: { $first: "$_type.name" },
                totalmts: { $sum: { $multiply: ["$_vehicle.mts", "$trips"] } },
                trips: { $sum: 1 }
            }
        }
    ], function(err, reports) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error listando reportes verdes',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            preDetail: reports
        });
    });
});

/**
 * ACTUALIZAR FACTURA REPORTE CUADROS
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    GreenBill.findByIdAndUpdate(id, { "oc": body.oc, "ac": body.ac, "paid": body.paid, "state": body.state }, { new: true })
        .then(function(billActualizada) {
            res.status(200).json({
                ok: true,
                bill: billActualizada
            });
        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error actualizando facturas',
                errors: err
            });
        });

});

/**
 * CREAR FACTURA REPORTE CUADROS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var greenbill = new GreenBill({
        _customer: body._customer,
        noBill: body.noBill,
        serie: body.serie,
        date: body.date,
        oc: body.oc,
        ac: body.ac,
        details: body.details,
        total: body.total,
        paid: body.paid,
        state: body.state
    });

    greenbill.save()
        .then(function(gbGuardado) {
            res.status(201).json({
                ok: true,
                facturaV: gbGuardado,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear factura reporte cuadros',
                errors: err
            });
        });
});

module.exports = app;