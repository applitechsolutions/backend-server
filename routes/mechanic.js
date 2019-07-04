var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();

var Mech = require('../models/mech');

/**
 * LISTAR MECANICOS
 */

app.get('/', function(req, res) {


    Mech.find({ state: false })
        .sort({ _id: 'desc' })
        .exec(
            function(err, mechs) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando mecanicos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mecanicos: mechs
                });
            });
});

/**
 * BUSCAR MECANICO
 */

app.get('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;

    Mech.findById(id, function(err, mechDB) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar mecanico',
                errors: err
            });
        }

        if (!mechDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El mecanico con el id' + id + ' no existe',
                errors: { message: 'No existe un mecanico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            mecanico: mechDB
        });

    });

});

/**
 * ELIMINAR MECANICOS
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Mech.findByIdAndUpdate(id, { $set: { state: body.state } }, { new: true })
        .then(function(mechBorrado) {
            if (!mechBorrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El mecanico con el id' + id + ' no existe',
                    errors: { message: 'No existe un mecanico con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                mecanico: mechBorrado
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
 * ACTUALIZAR MECANICOS
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Mech.findByIdAndUpdate(id, { $set: { "code": body.code, "name": body.name } }, { new: true })
        .then(function(mechAct) {

            if (!mechAct) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El mecanico con el id' + id + ' no existe',
                    errors: { message: 'No existe un mecanico con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                mecanico: mechAct
            });

        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar mecanico',
                errors: err
            });
        });

});

/**
 * CREAR MECANICOS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var mech = new Mech({
        code: body.code,
        name: body.name
    });

    mech.save()
        .then(function(mechGuardado) {
            res.status(201).json({
                ok: true,
                mecanico: mechGuardado,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        });

});

module.exports = app;