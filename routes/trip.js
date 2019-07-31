var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Trip = require('../models/trip');

/**
 * LISTAR EMPLEADOS
 */

app.get('/', function(req, res) {

    Trip.find({})
        .sort({ _id: 'desc' })
        .exec(
            function(err, viajes) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando viajes',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    viajes: viajes
                });
            });
});

/**
 * CREAR EMPLEADOS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var trip = new Trip({
        name: body.name,
        km: body.km
    });

    trip.save()
        .then(function(tripGuardado) {
            res.status(201).json({
                ok: true,
                viaje: tripGuardado,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear viaje',
                errors: err
            });
        });

});

module.exports = app;