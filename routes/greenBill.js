var express = require('express');

var app = express();

var GreenBill = require('../models/greenBill');
var GreenTrip = require('../models/greenTrips');

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
                _id: "$_type._id",
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

module.exports = app;