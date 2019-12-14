var express = require('express');
var mdAuth = require('../middlewares/auth');
var app = express();

var WhiteBill = require('../models/whiteBill');

/**
 * LISTAR FACTURAS BLANCAS
 */

app.get('/', function(req, res) {

    WhiteBill.find({
            state: false,
            paid: true,
            "date": {
                $gte: startDate,
                $lte: endDate
            }
        }, 'bill serie date oc ac details total paid')
        .populate('_customer', 'name nit address mobile')
        .exec(
            function(err, bills) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al listar facturas',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    facturas: bills
                });

            });
});

/**
 * LISTAR FACTURAS BLANCAS NO PAGADAS
 */

app.get('/nopaid', function(req, res) {

    GreenBill.find({
            state: false,
            paid: false
        }, 'date details total paid')
        .populate('_customer', 'name nit address mobile')
        .exec(
            function(err, bills) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al listar facturas',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    facturas: bills
                });

            });
});

/**
 * CREAR FACTURA BLANCA
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var whitebill = new WhiteBill({
        _customer: body._customer,
        bill: body.bill,
        serie: body.serie,
        date: body.date,
        oc: body.oc,
        ac: body.ac,
        details: body.details,
        total: body.total
    });

    whitebill.save()
        .then(function(billSave) {
            res.status(201).json({
                ok: true,
                facturaB: billSave,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear factura reporte lineas',
                errors: err
            });
        });

});

module.exports = app;