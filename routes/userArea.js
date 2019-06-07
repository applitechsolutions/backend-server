var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();

var UserArea = require('../models/userArea');

/**
 * LISTAR
 */

app.get('/:id', function(req, res, next) {

    var id = req.params.id;

    UserArea.find({ _user: id })
        .populate('_area', 'name')
        .exec(
            function(err, areas) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando áreas de usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    areas: areas
                });

            });
});

/**
 * INSERTAR AREA DE USUARIOS
 */

app.post('/:id', mdAuth.verificaToken, function(req, res) {
    var body = req.body;
    var id = req.params.id;
    userAreaMany = [];

    body.forEach(function(area) {
        userAreaMany.push({
            _user: id,
            _area: area._id
        });
    });

    UserArea.deleteMany({ _user: id }, function(err) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar área',
                errors: err
            });
        }

    });

    UserArea.insertMany(userAreaMany, function(err, UAguardada) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar área',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            userArea: UAguardada,
            usuarioToken: req.usuario
        });
    });




});

module.exports = app;