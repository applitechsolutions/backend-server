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

    UserArea.find({ _user: id }, '_user _area')
        .populate('_area')
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

module.exports = app;