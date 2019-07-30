var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Maintenance = require('../models/maintenance');

// BUSCAR MANTENIMIENTO ACTIVO DE UN vehiculo
app.get('/activeV/:id', function(req, res) {
    var id = req.params.id;
    Maintenance.find({ state: false, _vehicle: id }, 'dateStart totalV totalG details')
        .populate('_user', 'name lastName img')
        .populate('_mech', '')
        .populate('detailsV.part', 'code desc')
        .populate('detailsG.part', 'code desc')
        .exec(
            function(err, mant) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al listar mantenimiento del vehículo',
                        mantenimiento: null,
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mantenimiento: mant
                });

            });

});

// BUSCAR MANTENIMIENTO ACTIVO DE UNA gondola
app.get('/activeG/:id', function(req, res) {
    var id = req.params.id;
    Maintenance.find({ state: 0, _gondola: id }, 'dateStart totalV totalG details')
        .populate('_user', 'name lastName img')
        .populate('_mech', '')
        .populate('detailsV.part', 'code desc')
        .populate('detailsG.part', 'code desc')
        .exec(
            function(err, mant) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al listar mantenimiento de la gondola',
                        mantenimiento: null,
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mantenimiento: mant
                });

            });

});

/**
 * CREAR MANTENIMIENTO
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var mantenimiento = new Maintenance({
        _user: body._user._id,
        _vehicle: body._vehicle._id,
        _gondola: body._gondola._id,
        _mech: body._mech,
        dateStart: body.dateStart,
        _typeMaintenance: null
    });

    mantenimiento.save(function(err, mantenimientoG) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear mantenimiento',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mantenimiento: mantenimientoG,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;