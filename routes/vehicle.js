var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Vehicle = require('../models/vehicle');

/**
 * LISTAR VEHICULOS
 */

app.get('/', function(req, res) {

    Vehicle.find({ state: false }, 'cp type plate no model km mts')
        .populate('_make', 'name')
        .sort({ _id: 'desc' })
        .exec(
            function(err, vehicles) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando vehiculos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    vehiculos: vehicles
                });
            });
});

/**
 * CREAR VEHICULOS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

});

module.exports = app;