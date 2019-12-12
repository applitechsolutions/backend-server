var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var TankTrip = require('../models/tankTrip');

/**
 * LISTAR REPORTES CISTERNA
 */

app.get('/', function(req, res) {

    TankTrip.find({ state: false }, 'date checkIN checkOUT trips tariff')
        .populate('_employee', 'name')
        .populate('_vehicle', 'plate')
        .populate('_destino', 'name km')
        .sort({ _id: 'desc' })
        .exec(
            function(err, tanks) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando destinos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    viajeA: tanks
                });
            });
});

/**
 * INSERTAR REPORTES CISTERNA
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;
    var km = req.query.km;

    var tankTrip = new TankTrip({

        _employee: body._employee,
        _vehicle: body._vehicle._id,
        _destino: body._destino,
        date: body.date,
        checkIN: body.checkIN,
        checkOUT: body.checkOUT,
        trips: body.trips,
        tariff: body.tariff

    });

    tankTrip.save()
        .then(function(tankSave) {

            Vehicle.updateOne({ _id: body._vehicle._id }, { $inc: { "km": km, "pits.$[elem].km": km } }, {
                    multi: true,
                    arrayFilters: [{ "elem.km": { $gte: 0 } }]
                })
                .then(function(tripKm) {})
                .catch(function(err) {});

            res.status(201).json({
                ok: true,
                viajeV: tankSave,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear destino',
                errors: err
            });
        });
});

module.exports = app;