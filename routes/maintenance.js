var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Maintenance = require('../models/maintenance');

app.get('/activos', function(req, res) {

    Maintenance.find({ state: 0 }, 'dateStart dateEnd totalV totalG')
        .populate('_vehicle', 'plate')
        .populate('_gondola', 'plate')
        .populate('detailsV.part', 'code desc')
        .populate('detailsG.part', 'code desc')
        .sort({ plate: 'asc' })
        .exec(
            function(err, mants) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al listar mantenimientos activos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mantenimientos: mants
                });

            });

});

module.exports = app;