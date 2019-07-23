var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Gondola = require('../models/gondola');
var Vehicle = require('../models/vehicle');

/**
 * LISTAR GONDOLAS
 */

app.get('/', function(req, res) {

    Gondola.find({ state: false })
        .populate('_truck', 'plate')
        .populate('pits.rim')
        .sort({ plate: 'asc' })
        .exec(
            function(err, gondolas) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar gondola',
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
 * LISTAR GONDOLAS DISPONIBLES
 */

app.get('/availables', function(req, res) {

    Gondola.find({ _truck: { $eq: null } })
        .sort({ plate: 'asc' })
        .exec(
            function(err, gondolas) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar gondola',
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
 * ASIGNAR GONDOLA
 */

app.put('/asignar/:id', mdAuth.verificaToken, function(req, res) {

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

            gondola._truck = body._truck._id;

            gondola.save()
                .then(function(gondolaA) {

                    Vehicle.findByIdAndUpdate({ _id: body._truck._id }, { $set: { _gondola: gondolaA._id } })
                        .then(function(vehicleG) {

                            gondolaA.populate('_truck', function(err, gondolaPop) {

                                res.status(200).json({
                                    ok: true,
                                    gondola: gondolaPop
                                });
                            });

                        })
                        .catch(function(err) {
                            res.status(400).json({
                                ok: false,
                                mensaje: 'Error al asignar gondola al vehiculo',
                                errors: err
                            });
                        });
                })
                .catch(function(err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al asignar vehiculo a la gondola',
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
 * DESASIGNAR GONDOLA
 */

app.put('/desasignar/:id', mdAuth.verificaToken, function(req, res) {

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

            Vehicle.findByIdAndUpdate(gondola._truck._id, { $set: { _gondola: body._truck._id } })
                .then(function(vehicleG) {
                    gondola._truck = body._truck._id;

                    gondola.save()
                        .then(function(gondolaV) {
                            res.status(200).json({
                                ok: true,
                                gondola: gondolaV
                            });
                        })
                        .catch(function(err) {
                            res.status(400).json({
                                ok: false,
                                mensaje: 'Error al quitar vehiculo a la gondola',
                                errors: err
                            });
                        });
                })
                .catch(function(err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error al quitar gondola al vehiculo',
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
 * BORRAR GONDOLA
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
                mensaje: 'Error al borrar gondola',
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
    console.log(id);

    Gondola.findById(id)
        .then(function(gondola) {
            if (!gondola) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La gondola con el id' + id + ' no existe',
                    errors: { message: 'No existe una gondola con ese ID' }
                });
            }

            gondola.plate = body.plate;
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
                        mensaje: 'Error al actualizar gondola',
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
        _truck: body._truck._id,
        basics: body.basics,
        pits: body.pits
    });

    gondola.save()
        .then(function(gondolaGuardada) {
            res.status(201).json({
                ok: true,
                gondola: gondolaGuardada,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear gondola',
                errors: err
            });
        });

});


module.exports = app;