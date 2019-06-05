var express = require('express');

var app = express();

// MODELOS
var Area = require('../models/area');

/**
 * LISTAR AREAS
 */

app.get('/', function(req, res, next) {

    Area.find({})
        .exec(
            function(err, areas) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando las áreas',
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