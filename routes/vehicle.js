var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Vehicle = require('../models/vehicle');

/**
 * LISTAR VEHICULOS
 */

app.get('/', function(req, res) {

    Vehicle.find({ state: false }, 'cp type plate no model km mts basics pits')
        .populate('_make', 'name')
        .sort({ plate: 'asc' })
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
 * ACTUALIZAR VEHICULOS
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Vehicle.findById(id, function(err, vehiculo) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar repuesto',
                errors: err
            });
        }

        if (!vehiculo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El vehiculo con el id' + id + ' no existe',
                errors: { message: 'No existe un vehiculo con ese ID' }
            });
        }

        vehiculo.cp = body.cp;
        vehiculo.type = body.type;
        vehiculo._gondola = body.gondola;
        vehiculo._make = body.make;
        vehiculo.plate = body.plate;
        vehiculo.no = body.no;
        vehiculo.model = body.model;
        vehiculo.km = body.km;
        vehiculo.mts = body.mts;
        vehiculo.basics = body.basics;
        vehiculo.pits = body.rims;

        vehiculo.save(function(err, vehiculoAct) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar vehiculo',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                vehiculo: vehiculoAct
            });

        });

    });
});

/**
 * CREAR VEHICULOS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;
    var cp;

    if (body.cp === null) {
        cp = new Date().getMilliseconds();
    } else {
        cp = body.cp;
    }

    var vehiculo = new Vehicle({
        cp: cp,
        type: body.type,
        _make: body._make._id,
        plate: body.plate,
        no: body.no,
        model: body.model,
        km: body.km.$numberDecimal,
        mts: body.mts.$numberDecimal
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
            vehiculo: vehiculoGuardado,
            usuarioToken: req.usuario
        });
    });

});


module.exports = app;