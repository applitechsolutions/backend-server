var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var GreenTrips = require('../models/greenTrips');

/**
 * LISTAR REPORTE CUADROS
 */

app.get('/', function(req, res) {

    GreenTrips.find({ state: false }, 'date checkIN checkOUT trips details')
        .populate('_employee', 'name')
        .populate('_type', 'name')
        .populate('_vehicle', 'plate type')
        .populate('_material', 'code name')
        .sort({ '_id': 'asc' })
        .exec(
            function(err, Gviajes) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando reporte cuadros',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    Gviajes: Gviajes
                });
            });
});

/**
 * CREAR REPORTE CUADROS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var greenTrip = new GreenTrips({

        _employee: body._employee,
        _type: body._type,
        _vehicle: body._vehicle,
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
                .populate('_type', 'name')
                .populate('_vehicle', 'plate type')
                .populate('_material', 'code name')
                .execPopulate()
                .then(function(greenTripP) {

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