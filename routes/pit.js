var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Pit = require('../models/pit');

/**
 * LISTAR HISTORIAL PITS
 */

app.get('/:id', function(req, res) {

    var id = req.params.id;

    Pit.find({ vehicle: id })
        .populate('vehicle', 'type plate')
        .populate('rim', 'code desc')
        .sort({ date: 'desc' })
        .exec(
            function(err, pits) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando repuestos',
                        errors: err
                    });
                }



                res.status(200).json({
                    ok: true,
                    pits: pits
                });

            });

});

app.get('/gondola/:id', function(req, res) {

    var id = req.params.id;

    Pit.find({ gondola: id })
        .populate('gondola', 'plate')
        .populate('rim', 'code desc')
        .sort({ date: 'desc' })
        .exec(
            function(err, pits) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando repuestos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    pits: pits
                });

            });
});


/**
 * CREAR HISTORIAL DE PITS VEHICULOS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var pit = new Pit({

        vehicle: body.vehicle._id,
        gondola: null,
        rim: body.rim,
        km: body.km,
        counter: body.counter,
        axis: body.axis,
        place: body.place,
        side: body.side,
        date: body.date,
        total: body.total

    });

    pit.save()
        .then(function(pitGuardado) {

            pitGuardado
                .populate('rim', 'code desc')
                .populate('vehicle', 'type plate')
                .execPopulate()
                .then(function(pitP) {

                    res.status(201).json({
                        ok: true,
                        pit: pitP,
                        usuarioToken: req.usuario
                    });

                }).catch(function(err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear historial del pit',
                        errors: err
                    });
                });

        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear historial del pit',
                errors: err
            });
        });

});

/**
 * CREAR HISTORIAL DE PITS GONDOLAS
 */

app.post('/gondola', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var pit = new Pit({

        vehicle: null,
        gondola: body.gondola._id,
        rim: body.rim,
        km: body.km,
        counter: body.counter,
        axis: body.axis,
        place: body.place,
        side: body.side,
        date: body.date,
        total: body.total

    });

    pit.save()
        .then(function(pitGuardado) {

            pitGuardado
                .populate('rim', 'code desc')
                .populate('gondola', 'plate')
                .execPopulate()
                .then(function(pitP) {

                    res.status(201).json({
                        ok: true,
                        pit: pitP,
                        usuarioToken: req.usuario
                    });

                }).catch(function(err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear historial del pit',
                        errors: err
                    });
                });

        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear historial del pit',
                errors: err
            });
        });

});

module.exports = app;