var express = require('express');
var mongoose = require('mongoose');
var mdAuth = require('../middlewares/auth');
var ObjectId = mongoose.Types.ObjectId;

var app = express();

var whiteTrip = require('../models/whiteTrip');
var Vehicle = require('../models/vehicle');
var Gondola = require('../models/gondola');
var Pull = require('../models/pull');

/**
 * PRE FACTURA DE REPORTE DE LINEAS
 */

app.get('/', function(req, res) {

    var idD = req.query.idD;
    var idM = req.query.idM;
    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    Pull.aggregate([{
            $lookup: {
                from: "orders",
                localField: "_order",
                foreignField: "_id",
                as: "_order"
            },
        }, { $unwind: '$_order' },
        {
            $lookup: {
                from: "whitetrips",
                localField: "_id",
                foreignField: "_pull",
                as: "_wtrips"
            },
        }, { $unwind: '$_wtrips' },
        {
            $match: {
                "_order._destination": ObjectId(idD),
                "_material": ObjectId(idM),
                "_wtrips.date": {
                    $gte: startDate,
                    $lte: endDate
                },
                "state": false
            }
        },
        {
            $match: {
                "_order._destination": ObjectId(idD),
                "_material": ObjectId(idM),
                "_wtrips.date": {
                    $gte: startDate,
                    $lte: endDate
                },
                "state": false
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
            preDetail: reports,
        });
    });

});

/**
 * LISTAR REPORTE LINEAS POR PULL
 */

app.get('/:id', function(req, res) {

    var id = req.params.id;

    whiteTrip.find({
            state: false,
            _pull: id
        }, 'date noTicket noDelivery mts kgB kgT kgN checkIN checkOUT tariff invoiced')
        .populate('_employee', 'name')
        .populate('_vehicle', 'plate type km')
        .populate({
            path: '_pull',
            populate: {
                path: '_order',
                populate: {
                    path: '_destination'
                }
            }
        })
        .sort({
            '_id': 'asc'
        })
        .exec(
            function(err, Wviajes) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando reporte cuadros',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    wviajes: Wviajes
                });
            });
});


/**
 * CREAR REPORTE LINEAS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;
    var km = req.query.km;

    var whitetrip = new whiteTrip({
        _employee: body._employee,
        _vehicle: body._vehicle,
        _pull: body._pull,
        date: body.date,
        noTicket: body.noTicket,
        noDelivery: body.noDelivery,
        mts: body.mts,
        kgB: body.kgB,
        kgT: body.kgT,
        kgN: body.kgN,
        checkIN: body.checkIN,
        checkOUT: body.checkOUT,
        tariff: body.tariff
    });

    whitetrip.save()
        .then(function(wtripsave) {

            Pull.updateOne({
                    _id: body._pull._id
                }, {
                    $inc: {
                        "mts": body.mts,
                        "kg": body.kgN
                    }
                })
                .then(function() {})
                .catch(function(err) {
                    console.log(err);
                });

            Vehicle.updateOne({
                    _id: body._vehicle._id
                }, {
                    $inc: {
                        "km": km,
                        "pits.$[elem].km": km
                    }
                }, {
                    multi: true,
                    arrayFilters: [{
                        "elem.km": {
                            $gte: 0
                        }
                    }]
                })
                .then(function(tripKm) {})
                .catch(function(err) {
                    console.log(err);
                });


            if (body._vehicle.type === 'camionG') {
                Gondola.findByIdAndUpdate(body._vehicle._gondola, {
                        $inc: {
                            "pits.$[elem].km": km
                        }
                    }, {
                        multi: true,
                        arrayFilters: [{
                            "elem.km": {
                                $gte: 0
                            }
                        }]
                    })
                    .then(function(gkm) {})
                    .catch(function(err) {
                        console.log(err);
                    });
            }
            res.status(201).json({
                ok: true,
                viajeB: wtripsave,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear reporte lineas',
                errors: err
            });
            console.log(err);
        });
});

module.exports = app;