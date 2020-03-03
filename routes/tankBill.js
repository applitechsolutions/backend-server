var express = require('express');
var mongoose = require('mongoose');
var mdAuth = require('../middlewares/auth');
var ObjectId = mongoose.Types.ObjectId;

var app = express();

var TankBill = require('../models/tankBill');
var TankTrip = require('../models/tankTrip');

/**
 * LISTAR FACTURAS CISTERNA SIN PAGAR POR FECHAS
 */

app.get('/', function(req, res) {

    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    TankBill.find({
            state: false,
            status: 'NOPAID',
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
                        mensaje: 'Error al listar facturas cisterna',
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
 * LISTAR FACTURAS CISTERNA PAGADAS POR FECHAS
 */

app.get('/paid', function(req, res) {

    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    TankBill.find({
            state: false,
            status: 'PAID',
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
                        mensaje: 'Error al listar facturas cisterna',
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
 * LISTAR DETALLE FACTURA POR FECHAS
 */

app.get('/detalles', function(req, res) {

    var id = req.query.idD;
    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    TankTrip.aggregate([{
            $lookup: {
                from: "vehicles",
                localField: "_vehicle",
                foreignField: "_id",
                as: "_vehicle"
            }
        }, {
            $unwind: '$_vehicle'
        }, {
            $match: {
                "_destination": ObjectId(id),
                "date": {
                    $gte: startDate,
                    $lte: endDate
                },
                "state": false
            }
        },
        {
            $sort: { "date": -1, "_vehicle.plate": 1 }
        },
        {
            $lookup: {
                from: "desttanks",
                localField: "_destination",
                foreignField: "_id",
                as: "_destination"
            },
        }, {
            $unwind: '$_destination'
        },
        {
            $group: {
                _id: "$date", // El valor por el cual se agrupa
                prod: {
                    $first: "$_destination.name"
                },
                detalles: {
                    $push: {
                        _id: "_vehicle._id",
                        vehicle: "$_vehicle.plate",
                        mts: "$_vehicle.mts",
                        totalmts: {
                            $sum: {
                                $multiply: ["$_vehicle.mts", "$trips"]
                            }
                        },
                        trips: "$trips"
                    }
                },
                totalTrips: {
                    $sum: "$trips"
                },
                totalmts: {
                    $sum: {
                        $multiply: ["$_vehicle.mts", "$trips"]
                    }
                }
            }
        }
    ], function(err, reports) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error listando reportes cisterna',
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
 * ELIMINAR FACTURA REPORTE CISTERNA
 */

app.put('/delete', mdAuth.verificaToken, function(req, res) {
    var id = req.query.id;
    var body = req.body;

    TankBill.findByIdAndUpdate(id, {
            "state": body.state
        }, {
            new: true
        })
        .then(function(billBorrada) {
            res.status(200).json({
                ok: true,
                bill: billBorrada
            });
        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error borrando factura',
                errors: err
            });
        });
});

/**
 * ACTUALIZAR FACTURA REPORTE CUADROS
 */

app.put('/:id', mdAuth.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    TankBill.findByIdAndUpdate(id, {
            "noBill": body.noBill,
            "serie": body.serie,
            "date": body.date,
            "oc": body.oc,
            "ac": body.ac,
            "status": body.status,
            "state": body.state
        }, {
            new: true
        })
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
 * CREAR FACTURA REPORTE CISTERNA
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var tankbill = new TankBill({
        _customer: body._customer,
        noBill: body.noBill,
        serie: body.serie,
        date: body.date,
        oc: body.oc,
        ac: body.ac,
        details: body.details,
        total: body.total,
        status: body.status,
        state: body.state
    });

    tankbill.save()
        .then(function(tbGuardado) {
            res.status(201).json({
                ok: true,
                facturaA: tbGuardado,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear factura reporte cisterna',
                errors: err
            });
        });
});

module.exports = app;