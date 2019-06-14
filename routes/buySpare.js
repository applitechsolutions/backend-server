var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var BuySpare = require('../models/buySpare.js');

/**
 * LISTAR COMPRAS DE REPUESTOS
 */

app.get('/', function(req, res) {

    BuySpare.find({ state: false }, '_provider date noBill serie noDoc details total')
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
                    buySpares: buySpares
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
                buySpare: buySpareB
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

    buySpare.save(function(err, buySpareG) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear compra',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            buySpare: buySpareG,
            usuarioToken: req.usuario
        });
    });

});


module.exports = app;