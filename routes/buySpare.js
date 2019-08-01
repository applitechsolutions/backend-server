var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var BuySpare = require('../models/buySpare.js');
var AutoCellar = require('../models/autoCellar');

/**
 * LISTAR COMPRAS DE REPUESTOS
 */

app.get('/', function(req, res) {

    BuySpare.find({ state: false }, '_provider date noBill serie noDoc details total')
        .populate('_provider', 'name')
        .populate('details._part')
        .sort({ date: 'desc' })
        .exec(
            function(err, buySpares) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando historial de compras',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    compras: buySpares
                });
            });
});

/**
 * BORRAR COMPRA DE REPUESTOS
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {
    var id = req.params.id;

    BuySpare.findById(id, function(err, buySpare) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar historial de compras',
                errors: err
            });
        }

        if (!buySpare) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El una compra con el id' + id + ' no existe',
                errors: { message: 'No existe una compra con ese ID' }
            });
        }

        buySpare.state = true;

        buySpare.save(function(err, buySpareB) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar compra',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                compra: buySpareB
            });
        });

    });
});

/**
 * CREAR COMPRA DE REPUESTOS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var buySpare = new BuySpare({
        _provider: body._provider._id,
        date: body.date,
        noBill: body.noBill,
        serie: body.serie,
        noDoc: body.noDoc,
        details: body.details,
        total: body.total
    });

    buySpare.save()
        .then(function(buySpareG) {

            var promises = buySpareG.details.map(function(e) {
                AutoCellar.findOne({ 'storage._autopart': e._part }, { 'storage.$': 1 })
                    .exec(function(err, cellar) {
                        if (err) {
                            res.status(500).json({
                                ok: false,
                                mensaje: 'Error al buscar repuesto',
                                errors: err
                            });
                        }

                        if (!cellar) {
                            res.status(400).json({
                                ok: false,
                                mensaje: 'El cellar no existe',
                                errors: { message: 'No existe un cellar con ese ID' }
                            });
                        }

                        var newStock = cellar.storage[0].stock + e.quantity;

                        AutoCellar.updateOne({ 'storage._autopart': e._part }, { 'storage.$.stock': newStock, 'storage.$.cost': e.cost }, function(err, storageAct) {
                            if (err) {
                                res.status(400).json({
                                    ok: false,
                                    mensaje: 'Error al actualizar existencia',
                                    errors: err
                                });
                            }
                        });
                    });
            });

            Promise.all(promises).then(function(results) {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Storage actualizado',
                        cellar: promises
                    });
                })
                .catch(function(error) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar existencia',
                        errors: error
                    });
                });

        }).catch(function(Error) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear compra',
                errors: Error
            });
        });

});

module.exports = app;