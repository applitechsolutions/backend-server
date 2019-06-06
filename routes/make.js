var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();

var Make = require('../models/make');

/**
 * LISTAR MARCAS
 */

app.get('/', function(req, res, next) {

    Make.find({}, 'name')
        .sort({ name: 'asc' })
        .exec(
            function(err, makes) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando marcas',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    makes: makes
                });

            });
});

/**
 * INSERTAR MARCA
 */

app.post('/', mdAuth.verificaToken, function(req, res) {
    var body = req.body;

    var make = new Make({
        name: body.name,
    });

    make.save(function(err, marcaGuardada) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear marca',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            marca: marcaGuardada,
            usuarioToken: req.usuario
        });

    });

});

module.exports = app;