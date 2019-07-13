var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Gondola = require('../models/gondola');

/**
 * LISTAR GONDOLAS
 */

app.get('/', function(req, res) {

    Gondola.find({ state: false })
        .populate('_vehicle', 'plate')
        .populate('pits.rim')
        .sort({ plate: 'asc' })
        .exec(
            function(err, gondolas) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar vehículo',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    gondolas: gondolas
                });

            });

});

/**
 * ACTUALIZAR GONDOLA
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Gondola.findByIdAndUpdate(id, { $set: { state: body.state } }, { new: true })
        .then(function(gondolaDel) {

            if (!gondolaDel) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La gondola con el id' + id + ' no existe',
                    errors: { message: 'No existe una gondola con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                gondola: gondolaDel
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar mecanico',
                errors: err
            });
        });

});

/**
 * ACTUALIZAR GONDOLA
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Gondola.findById(id)
        .then(function(gondola) {
            if (!gondola) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'La gondola con el id' + id + ' no existe',
                    errors: { message: 'No existe una gondola con ese ID' }
                });
            }

            gondola.plate = body.plate;
            gondola._truck = body._truck;
            gondola.basics = body.basics;
            gondola.pits = body.pits;

            gondola.save()
                .then(function(gondolaAct) {
                    gondolaAct
                        .populate('pits.rim', function(err, gondolaP) {
                            res.status(200).json({
                                ok: true,
                                gondola: gondolaP
                            });
                        });
                })
                .catch(function(err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar vehículo',
                        errors: err
                    });
                });
        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar gondola',
                errors: err
            });
        });

});


/**
 * CREAR GONDOLA
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var gondola = new Gondola({
        plate: body.plate,
        _truck: body._truck,
        basics: body.basics,
        pits: body.pits
    });

    gondola.save()
        .then(function(gondolaGuardada) {
            res.status(201).json({
                ok: true,
                vehiculo: gondolaGuardada,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear vehiculo',
                errors: err
            });
        });

});


module.exports = app;