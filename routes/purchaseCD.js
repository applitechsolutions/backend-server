var express = require('express');
const mdAuth = require('../middlewares/auth');

var app = express();

var PurchaseCD = require('../models/purchaseCD');
var WhiteTrip = require('../models/whiteTrip');

/**
 * LISTAR COMPRAS
 */

app.get('/', function (req, res) {
    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    PurchaseCD.find(
        {
            date: {
                $gte: startDate,
                $lte: endDate
            },
            state: false
        }
    )
        .populate('_order')
        .populate('details._whiteTrip')
        .sort({
            date: 1
        })
        .exec(function (err, purchasesCD) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error listando historial de compras',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                compras: purchasesCD
            });
        });
});

/**
 * LISTAR COMPRAS PENDIENTES DE PAGO
 */

app.get('/tobePaid/', function (req, res) {

    PurchaseCD.find(
        {
            paid: false,
            state: false
        }
    )
        .populate('_order')
        .populate('details._whiteTrip')
        .sort({
            date: 1
        })
        .exec(function (err, purchasesCD) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error listando historial de compras',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                compras: purchasesCD
            });
        });
});

/**
 * LISTAR COMPRAS ANULADAS
 */

app.get('/null/', function (req, res) {
    PurchaseCD.find(
        {
            state: true
        }
    )
        .populate('_order')
        .populate('details._whiteTrip')
        .sort({
            date: -1
        })
        .exec(function (err, purchasesCD) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error listando compras anuladas',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                compras: purchasesCD
            });
        });
});

/**
 * MARCAR COMO PAGADA
 */

app.put('/pay/:id', mdAuth.verificaToken, function (req, res) {
    var id = req.params.id;

    PurchaseCD.findById(id, function (err, purchaseCD) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar historial de compras',
                errors: err
            });
        }

        if (!purchaseCD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El una compra con el id' + id + ' no existe',
                errors: {
                    message: 'No existe una compra con ese ID'
                }
            });
        }

        purchaseCD.paid = true;

        purchaseCD.save(function (err, purchasePaid) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar compra',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                compra: purchasePaid
            });
        });
    });
});

/**
 * BORRAR COMPRA
 */

app.put('/delete/:id', mdAuth.verificaToken, function (req, res) {
    var id = req.params.id;

    PurchaseCD.findById(id, function (err, purchaseCD) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar historial de compras',
                errors: err
            });
        }

        if (!purchaseCD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El una compra con el id' + id + ' no existe',
                errors: {
                    message: 'No existe una compra con ese ID'
                }
            });
        }

        purchaseCD.state = true;

        purchaseCD.save(function (err, purchaseB) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar compra',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                compra: purchaseB
            });
        });
    });
});

/**
 * CREAR COMPRA
 */

app.post('/', mdAuth.verificaToken, function (req, res) {
    var body = req.body;

    var purchaseCD = new PurchaseCD({
        date: body.date,
        noBill: body.noBill,
        serie: body.document,
        _order: body._order,
        sap: body.sap,
        details: body.details,
        total: body.total,
        payment: body.payment,
        paid: body.paid
    });

    purchaseCD
        .save()
        .then(function (purchaseG) {
            var promises = purchaseG.details.map(function (e) {
                WhiteTrip.updateOne(
                    {
                        _id: e._whiteTrip._id
                    },
                    {
                        invoicedCD: true
                    },
                    function (err, storageAct) {
                        if (err) {
                            res.status(400).json({
                                ok: false,
                                mensaje: 'Error al actualizar estado del reporte',
                                errors: err
                            });
                        }
                    }
                );
            });

            Promise.all(promises)
                .then(function (results) {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Factura creada',
                        viajeBlanco: promises
                    });
                })
                .catch(function (error) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar estado del reporte',
                        errors: error
                    });
                });
        })
        .catch(function (Error) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear compra',
                errors: Error
            });
        });
});

module.exports = app;
