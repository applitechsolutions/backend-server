var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var whiteTrip = require('../models/whiteTrip');

/**
 * LISTAR REPORTE LINEAS
 */

app.get('/', function (req, res) {

    whiteTrip.find({
            state: false
        }, 'date noTicket noDelivery mts kgB kgT kgN checkIN checkOUT invoiced')
        .populate('_employee', 'name')
        .populate('_vehicle', 'plate type km')
        .populate({
            path: '_pull',
            populate: {
                path: '_order',
                populate: {
                    path: '_destination'
                }
            }
        })
        .sort({
            '_id': 'asc'
        })
        .exec(
            function (err, Wviajes) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando reporte cuadros',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    wviaje: Wviajes
                });
            });
});

/**
 * CREAR REPORTE LINEAS
 */

app.post('/', mdAuth.verificaToken, function (req, res) {

    var body = req.body;

    var whitetrip = new whiteTrip({
        _employee: body._employee,
        _vehicle: body._vehicle._id,
        _pull: body._pull,
        date: body.date,
        noTicket: body.noTicket,
        noDelivery: body.noDelivery,
        mts: body.mts,
        kgB: body.kgB,
        kgT: body.kgT,
        kgN: body.kgN,
        checkIN: body.checkIN,
        checkOUT: body.checkOUT
    });

    whitetrip.save()
        .then(function (wtripsave) {
            res.status(201).json({
                ok: true,
                viajeB: wtripsave,
                usuarioToken: req.usuario
            });
        })
        .catch(function (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear reporte cuadros',
                errors: err
            });
        });
});

module.exports = app;