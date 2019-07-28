var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var TypeMaintenance = require('../models/typeMaintenance.js');

/**
 * LISTAR TIPOS DE MANTENIMIENTOS
 */

app.get('/', function(req, res) {

    TypeMaintenance.find({ state: false }, 'name')
        .sort({ name: 'asc' })
        .exec(
            function(err, typeMaintenances) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando tipos de mantenimiento',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    tipos: typeMaintenances
                });
            });
});

/**
 * BUSCAR TIPO DE MANTENIMIENTO
 */

app.get('/:id', function(req, res) {

    var id = req.params.id;

    TypeMaintenance.findById(id, 'name')
        .exec(function(err, typeMaintenance) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar tipo de mantenimiento',
                    errors: err
                });
            }

            if (!typeMaintenance) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El tipo de mantenimiento con el id' + id + ' no existe',
                    errors: { message: 'No existe un tipo de mantenimiento con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                tipo: typeMaintenance
            });

        });
});


/**
 * ACTUALIZAR TIPO DE MANTENIMIENTO
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    TypeMaintenance.findById(id, function(err, typeMaintenance) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar tipo de mantenimiento',
                errors: err
            });
        }

        if (!typeMaintenance) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El tipo de mantenimiento con el id' + id + ' no existe',
                errors: { message: 'No existe un tipo de mantenimiento con ese ID' }
            });
        }

        typeMaintenance.name = body.name;

        typeMaintenance.save(function(err, typeMaintenanceA) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar tipo de mantenimiento',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                tipo: typeMaintenanceA
            });

        });

    });
});

/**
 * BORRAR TIPO DE MANTENIMIENTO
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {
    var id = req.params.id;

    TypeMaintenance.findById(id, function(err, typeMaintenance) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar tipo de mantenimiento',
                errors: err
            });
        }

        if (!typeMaintenance) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El tipo de mantenimiento con el id' + id + ' no existe',
                errors: { message: 'No existe un tipo de mantenimiento con ese ID' }
            });
        }

        typeMaintenance.state = true;

        typeMaintenance.save(function(err, typeMaintenanceB) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar tipo de mantenimiento',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                tipo: typeMaintenanceB
            });
        });

    });
});

/**
 * CREAR TIPO DE MANTENIMIENTO
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var typeMaintenance = new TypeMaintenance({
        name: body.name
    });

    typeMaintenance.save(function(err, typeMaintenanceG) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear tipo de mantenimiento',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            tipo: typeMaintenanceG,
            usuarioToken: req.usuario
        });
    });

});


module.exports = app;