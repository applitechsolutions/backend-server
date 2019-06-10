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

    var vehiculo = new Vehicle({
        cp: body.cp,
        type: body.type,
        _make: body.make,
        plate: body.plate,
        no: body.no,
        model: body.model,
        km: body.km,
        mts: body.mts
    });

    vehiculo.save(function(err, vehiculoGuardado) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear vehiculo',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            repuesto: vehiculoGuardado,
            usuarioToken: req.usuario
        });
    });

});

module.exports = app;