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
            function(err, mants) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al listar mantenimientos activos',
                        mantenimientos: null,
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