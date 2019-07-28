var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Maintenance = require('../models/maintenance');

app.get('/activeV/:id', function(req, res) {
    var id = req.params.id;
    Maintenance.find({ state: 0, _vehicle: id }, 'dateStart totalV totalG details')
        .populate('_user', 'name lastName')
        .populate('_mech', 'code name')
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

app.get('/activeG/:id', function(req, res) {
    var id = req.params.id;
    Maintenance.find({ state: 0, _gondola: id }, 'dateStart totalV totalG details')
        .populate('_user', 'name lastName')
        .populate('_mech', 'code name')
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

module.exports = app;