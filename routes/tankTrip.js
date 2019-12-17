var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var TankTrip = require('../models/tankTrip');
var Vehicle = require('../models/vehicle');

/**
 * LISTAR REPORTES CISTERNA
 */

app.get('/', function(req, res) {

    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    TankTrip.aggregate([{
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
            from: "employees",
            localField: "_employee",
            foreignField: "_id",
            as: "_employee"
        },
    }, {
        $unwind: '$_employee'
    }, {
        $lookup: {
            from: "vehicles",
            localField: "_vehicle",
            foreignField: "_id",
            as: "_vehicle"
        },
    }, {
        $unwind: '$_vehicle'
    }, {
        $lookup: {
            from: "desttanks",
            localField: "_destination",
            foreignField: "_id",
            as: "_destination"
        },
    }, {
        $unwind: '$_destination'
    }, {
        $project: {
            _id: '$_id',
            _employee: { _id: 1, name: 1 },
            _vehicle: { _id: 1, type: 1, plate: 1, mts: 1, km: 1 },
            _destination: { _id: 1, name: 1, km: 1 },
            date: '$date',
            checkIN: '$checkIN',
            checkOUT: '$checkOUT',
            trips: '$trips',
            tariff: '$tariff'
        }
    }], function(err, reports) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error listando reportes cisterna',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            viajesA: reports
        });
    });
});

/**
 * BUSCAR REPORTE CISTERNA
 */

app.get('/buscar', mdAuth.verificaToken, function(req, res) {

    var id = req.query.id;

    TankTrip.findById({ "_id": id })
        .populate('_destination', 'km')
        .exec(function(err, tkDB) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar reporte cisterna',
                    errors: err
                });
            }

            if (!tkDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El reporte cisterna con el id' + id + ' no existe',
                    errors: { message: 'No existe un reporte de cisterna con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                reporte: tkDB
            });
        });

});

/**
 * EDITAR REPORTES CISTERNA
 */

app.put('/', mdAuth.verificaToken, function(req, res) {

    var id = req.query.id;
    var body = req.body;
    var km = req.query.km;

    TankTrip.findByIdAndUpdate(id, { $set: { "_employee": body._employee, "_vehicle": body._vehicle, "_destination": body._destination, "date": body.date, "checkIN": body.checkIN, "checkOUT": body.checkOUT, "trips": body.trips, "tariff": body.tariff } }, { new: true })
        .then(function(tankUpdate) {
            Vehicle.findByIdAndUpdate(body._vehicle._id, { $inc: { "km": km, "pits.$[elem].km": km } }, {
                    multi: true,
                    arrayFilters: [{ "elem.km": { $gte: 0 } }]
                })
                .then(function(vehicle) {})
                .catch(function(err) {});

            res.status(200).json({
                ok: true,
                viajeA: tankUpdate
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar reporte cisterna',
                errors: err
            });
        });
});

/**
 * ELIMINAR REPORTES CISTERNA
 */

app.put('/delete', mdAuth.verificaToken, function(req, res) {

    var id = req.query.id;
    var body = req.body;
    var km = req.query.km;

    TankTrip.findByIdAndUpdate(id, { $set: { "state": body.state } }, { new: true })
        .then(function(deleteT) {

            Vehicle.findByIdAndUpdate(body._vehicle._id, { $inc: { "km": km, "pits.$[elem].km": km } }, {
                    multi: true,
                    arrayFilters: [{ "elem.km": { $gte: 0 } }]
                })
                .then(function(vehicle) {})
                .catch(function(err) {});


            res.status(200).json({
                ok: true,
                viajeV: deleteT
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar reporte cisterna',
                errors: err
            });
        });


});

/**
 * INSERTAR REPORTES CISTERNA
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;
    var km = req.query.km;
    console.log(body);

    var tankTrip = new TankTrip({

        _employee: body._employee,
        _vehicle: body._vehicle._id,
        _destination: body._destination,
        date: body.date,
        checkIN: body.checkIN,
        checkOUT: body.checkOUT,
        trips: body.trips,
        tariff: body.tariff

    });

    tankTrip.save()
        .then(function(tankSave) {

            Vehicle.updateOne({ _id: body._vehicle._id }, { $inc: { "km": km, "pits.$[elem].km": km } }, {
                    multi: true,
                    arrayFilters: [{ "elem.km": { $gte: 0 } }]
                })
                .then(function(tripKm) {})
                .catch(function(err) { console.log(err); });

            res.status(201).json({
                ok: true,
                viajeA: tankSave,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear viaje cisterna',
                errors: err
            });
        });
});

module.exports = app;