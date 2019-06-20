var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Rim = require('../models/rim');

/**
 * LISTAR Llantas
 */

app.get('/', function(req, res) {

    Rim.find({ state: false }, 'code desc')
        .sort({ code: 'asc' })
        .exec(
            function(err, rims) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando Llantas',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    llantas: rims
                });
            });
});

/**
 * CREAR LLANTAS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var rim = new Rim({
        code: body.code,
        desc: body.desc
    });

    rim.save(function(err, rimGuardado) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando llanta',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            llanta: rimGuardado,
            usuarioToken: req.usuario
        });


    });

});

module.exports = app;