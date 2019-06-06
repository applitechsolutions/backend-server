var express = require('express');
var bcrypt = require('bcryptjs');

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

app.post('/', function(req, res) {
    var body = req.body;

    var userArea = new UserArea({
        _user: body.user,
        _area: body.area
    });

    userArea.save(function(err, userarea) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al asignar área al usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            userArea: userarea
        });

    });


});

module.exports = app;