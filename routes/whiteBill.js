var express = require('express');
var mongoose = require('mongoose');
var mdAuth = require('../middlewares/auth');
var ObjectId = mongoose.Types.ObjectId;
var app = express();

var WhiteBill = require('../models/whiteBill');
var Pull = require('../models/pull');


/**
 * LISTAR FACTURAS BLANCAS
 */

app.get('/', function(req, res) {

    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    WhiteBill.find({
            state: false,
            paid: true,
            "date": {
                $gte: startDate,
                $lte: endDate
            }
        }, 'bill serie date oc ac details total paid')
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
 * LISTAR FACTURAS BLANCAS NO PAGADAS
 */

app.get('/nopaid', function(req, res) {

    GreenBill.find({
            state: false,
            paid: false
        }, 'date details total paid')
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
 * PRE FACTURA DE REPORTE DE LINEAS
 */

app.get('/detalles', function(req, res) {

    var idD = req.query.idD;
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
                as: "_wtrip"
            },
        }, { $unwind: '$_wtrip' },
        {
            $match: {
                "_order._destination": ObjectId(idD),
                "_wtrip.date": {
                    $gte: startDate,
                    $lte: endDate
                },
                "state": false
            }
        },
        {
            $lookup: {
                from: "materials",
                localField: "_material",
                foreignField: "_id",
                as: "_material"
            },
        }, { $unwind: '$_material' },
        {
            $lookup: {
                from: "employees",
                localField: "_wtrip._employee",
                foreignField: "_id",
                as: "_employee"
            },
        }, { $unwind: '$_employee' },
        {
            $lookup: {
                from: "destinations",
                localField: "_order._destination",
                foreignField: "_id",
                as: "_destination"
            },
        }, { $unwind: '$_destination' },
        {
            $group: {
                _id: "$_material._id",
                nameMat: { $first: "$_material.name" },
                details: {
                    $push: {
                        date: "$_wtrip.date",
                        noTicket: "$_wtrip.noTicket",
                        noDelivery: "$_wtrip.noDelivery",
                        plate: "$_vehilce.plate",
                        employee: "$_employee.name",
                        destination: "$_destination.name",
                        km: "$_destination.km",
                        tariff: "$_wtrip.tariff",
                        material: "$_material.name",
                        mts: "$_wtrip.mts",
                        kgB: "$_wtrip.kgB",
                        kgT: "$_wtrip.kgT",
                        kgN: "$_wtrip.kgN"
                    }
                },
                noTrips: { $sum: 1 }
            }
        }
    ], function(err, reports) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error listando reporte cuadros',
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
 * CREAR FACTURA BLANCA
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var whitebill = new WhiteBill({
        _customer: body._customer,
        bill: body.bill,
        serie: body.serie,
        date: body.date,
        oc: body.oc,
        ac: body.ac,
        details: body.details,
        total: body.total
    });

    whitebill.save()
        .then(function(billSave) {
            res.status(201).json({
                ok: true,
                facturaB: billSave,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear factura reporte lineas',
                errors: err
            });
        });

});

module.exports = app;