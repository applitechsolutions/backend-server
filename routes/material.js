var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();

// MODELOS
var Material = require('../models/material');

/**
 * LISTAR MATERIALES
 */

app.get('/', function(req, res, next) {

    Material.find({})
        .exec(
            function(err, materials) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando materiales',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    materiales: materials
                });

            });
});

/**
 * ACTUALIZAR MATERIAL
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Material.findById(id, function(err, material) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar material',
                errors: err
            });
        }

        if (!material) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El material con el id' + id + ' no existe',
                errors: { message: 'No existe un material con ese ID' }
            });
        }

        material.code = body.code;
        material.name = body.name;
        material.minStock = body.minStock;

        material.save(function(err, materialGuardado) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar material',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                material: materialGuardado
            });
        });

    });
});

/**
 * INSERTAR MATERIAL
 */

app.post('/', mdAuth.verificaToken, function(req, res) {
    var body = req.body;

    var material = new Material({
        code: body.code,
        name: body.name,
        minStock: body.minStock,
    });

    material.save(function(err, materialGuardado) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear material',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            material: materialGuardado
        });
    });

});

module.exports = app;