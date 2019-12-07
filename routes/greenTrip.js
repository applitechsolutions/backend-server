var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var GreenTrip = require('../models/greenTrip');
var Vehicle = require('../models/vehicle');
var Gondola = require('../models/gondola');

/**
 * LISTAR REPORTES CUADROS
 */

app.get('/reports', function(req, res) {

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
            from: "employees",
            localField: "_employee",
            foreignField: "_id",
            as: "_employee"
        },
    }, {
        $unwind: '$_employee'
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
        $project: {
            _id: '$_id',
            _employee: { _id: 1, name: 1 },
            _type: { _id: 1, name: 1, km: 1 },
            _vehicle: { _id: 1, type: 1, plate: 1, mts: 1, km: 1 },
            _material: { _id: 1, code: 1, name: 1 },
            date: '$date',
            checkIN: '$checkIN',
            checkOUT: '$checkOUT',
            trips: '$trips',
            details: '$details'
        }
    }], function(err, reports) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error listando reportes verdes',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            viajesV: reports
        });
    });
});

/**
 * LISTAR REPORTES CUADROS
 */

app.get('/group', function(req, res) {

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
                _id: "$date",
                vehicles: { $push: { _id: "$_vehicle._id", plate: "$_vehicle.plate" } },
                cantidad: { $sum: 1 }
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
 * CARGAR REPORTE CUADROS
 */

app.get('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;

    GreenTrip.findById(id, function(err, gtDB) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar reporte cuadros',
                errors: err
            });
        }

        if (!gtDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El reporte cuadros con el id' + id + ' no existe',
                errors: { message: 'No existe un reporte de cuadros con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            reporte: gtDB
        });
    });
});

/**
 * BORRAR REPORTE CUADROS POR ESTADO
 */

app.put('/borrar', mdAuth.verificaToken, function(req, res) {

    var id = req.query.id;
    var body = req.body;
    var km = req.query.km;

    GreenTrip.findByIdAndUpdate(id, { $set: { state: true } }, { new: true })
        .then(function(deleteT) {
            Vehicle.findByIdAndUpdate(body._vehicle._id, { $inc: { "km": km, "pits.$[elem].km": km } }, {
                    multi: true,
                    arrayFilters: [{ "elem.km": { $gte: 0 } }]
                })
                .then(function(vehicle) {})
                .catch(function(err) {});

            if (body._vehicle.type === 'camionG') {
                Gondola.findByIdAndUpdate(body._vehicle._gondola, { $inc: { "pits.$[elem].km": km } }, {
                        multi: true,
                        arrayFilters: [{ "elem.km": { $gte: 0 } }]
                    })
                    .then(function(gkm) {})
                    .catch(function(err) {});
            }

            res.status(200).json({
                ok: true,
                viajeV: deleteT
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar reporte cuadros',
                errors: err
            });
        });

});

/**
 * BORRAR REPORTE CUADROS
 */

app.delete('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;
    var km = body._type.km * body.trips * -1;
    console.log(body);

    GreenTrip.findByIdAndDelete(id)
        .then(function(tripBorrado) {

            Vehicle.findByIdAndUpdate(body._vehicle._id, { $inc: { "km": km, "pits.$[elem].km": km } }, {
                    multi: true,
                    arrayFilters: [{ "elem.km": { $gte: 0 } }]
                })
                .then(function(tripKm) {})
                .catch(function(err) {});

            if (body._vehicle.type === 'camionG') {
                Gondola.findByIdAndUpdate(body._vehicle._gondola, { $inc: { "pits.$[elem].km": km } }, {
                        multi: true,
                        arrayFilters: [{ "elem.km": { $gte: 0 } }]
                    })
                    .then(function(gkm) {})
                    .catch(function(err) {});
            }

            res.status(200).json({
                ok: true,
                viajeV: tripBorrado,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar reporte cuadros',
                errors: err
            });
        });


});

/**
 * CREAR REPORTE CUADROS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;
    var km = body._type.km * body.trips;

    var greenTrip = new GreenTrip({

        _employee: body._employee,
        _type: body._type._id,
        _vehicle: body._vehicle._id,
        _material: body._material,
        date: body.date,
        checkIN: body.checkIN,
        checkOUT: body.checkOUT,
        trips: body.trips,
        details: body.details

    });



    greenTrip.save()
        .then(function(viajeVGuardado) {

            viajeVGuardado
                .populate('_employee', 'name')
                .populate('_type', 'name km')
                .populate('_vehicle', 'plate type _gondola')
                .populate('_material', 'code name')
                .execPopulate()
                .then(function(greenTripP) {

                    Vehicle.updateOne({ _id: body._vehicle._id }, { $inc: { "km": km, "pits.$[elem].km": km } }, {
                            multi: true,
                            arrayFilters: [{ "elem.km": { $gte: 0 } }]
                        })
                        .then(function(tripKm) {})
                        .catch(function(err) {});

                    if (body._vehicle.type === 'camionG') {
                        Gondola.findByIdAndUpdate(body._vehicle._gondola, { $inc: { "pits.$[elem].km": km } }, {
                                multi: true,
                                arrayFilters: [{ "elem.km": { $gte: 0 } }]
                            })
                            .then(function(gkm) {})
                            .catch(function(err) {});
                    }

                    res.status(201).json({
                        ok: true,
                        viajeV: greenTripP,
                        usuarioToken: req.usuario
                    });

                }).catch(function(err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al popular reporte cuadros',
                        errors: err
                    });
                });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear reporte cuadros',
                errors: err
            });
        });

});

module.exports = app;