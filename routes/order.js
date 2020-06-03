var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Order = require('../models/order');

/**
 * BUSCAR SI EXISTE ESA ORDEN
 */

app.get('/uniqueValidator', function (req, res) {

    var date = new Date(req.query.fecha);
    var order = req.query.order;

    Order.find({
        date: date,
        order: order
    }, '')
        .exec(function (err, order) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar orden',
                    errors: err
                });
            }

            if (!order) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La orden con el id no existe',
                    errors: {
                        message: 'No existe un orden con ese ID'
                    }
                });
            }

            res.status(200).json({
                ok: true,
                orden: order
            });

        });
});

/**
 * CREAR ORDEN
 */

app.post('/', mdAuth.verificaToken, function (req, res) {

    var body = req.body;

    var order = new Order({
        date: body.date,
        order: body.order,
        _destination: body._destination
    });

    console.log(order);

    order.save(function (err, orderG) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear orden',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            orden: orderG,
            usuarioToken: req.usuario
        });
    });

});


module.exports = app;