var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var typeTrip = require('../models/typeTrip');

/**
 * LISTAR TIPOS DE VIAJES
 */

app.get('/', function(req, res) {

    typeTrip.find({})
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
 * CARGAR TIPOS DE VIAJES
 */

app.get('/:id', function(req, res) {

    var id = req.params.id;

    typeTrip.findById(id)
        .then(function(typtrip) {
            if (!typtrip) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El tipo de viaje con el id' + id + ' no existe',
                    errors: { message: 'No existe un tipo de viaje con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                tipoviaje: typtrip
            });
        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar tipo de viaje',
                errors: err
            });
        });

});

/**
 * CREAR TIPOS DE VIAJES
 */

app.put('/', mdAuth.verificaToken, function(req, res) {

    var id = req.query.id;
    var body = req.body;

    typeTrip.findByIdAndUpdate(id, { "code": body.code, "name": body.name, "km": body.km }, { new: true })
        .then(function(typeUpdate) {
            res.status(200).json({
                ok: true,
                tipo: typeUpdate
            });
        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error actualizando tipos',
                errors: err
            });
        });
});

/**
 * CREAR TIPOS DE VIAJES
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var trip = new typeTrip({
        code: body.code,
        name: body.name,
        km: body.km,
        tariff: body.tariff
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