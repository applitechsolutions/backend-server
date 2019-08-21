var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var CPcustomer = require('../models/CPcustomer.js');

/**
 * LISTAR CPCLIENTES
 */

app.get('/', function(req, res) {

    CPcustomer.find({ state: false }, 'name nit address mobile')
        .sort({ name: 'asc' })
        .exec(
            function(err, CPcustomers) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando clientes',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    clientes: CPcustomers
                });
            });
});

/**
 * BUSCAR CPcliente
 */

app.get('/:id', function(req, res) {

    var id = req.params.id;

    CPcustomer.findById(id, 'name nit address mobile')
        .exec(function(err, CPcustomer) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar cliente',
                    errors: err
                });
            }

            if (!CPcustomer) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El cliente con el id' + id + ' no existe',
                    errors: { message: 'No existe un cliente con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                cliente: CPcustomer
            });

        });
});


/**
 * ACTUALIZAR CPclientes
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    CPcustomer.findById(id, function(err, CPcustomer) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar cliente',
                errors: err
            });
        }

        if (!CPcustomer) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El cliente con el id' + id + ' no existe',
                errors: { message: 'No existe un cliente con ese ID' }
            });
        }

        CPcustomer.name = body.name;
        CPcustomer.nit = body.nit;
        CPcustomer.address = body.address;
        CPcustomer.mobile = body.mobile;

        CPcustomer.save(function(err, CPcustomerA) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar cliente',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                cliente: CPcustomerA
            });

        });

    });
});

/**
 * BORRAR CPCLIENTE
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {
    var id = req.params.id;

    CPcustomer.findById(id, function(err, CPcustomer) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar cliente',
                errors: err
            });
        }

        if (!CPcustomer) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El cliente con el id' + id + ' no existe',
                errors: { message: 'No existe un cliente con ese ID' }
            });
        }

        CPcustomer.state = true;

        CPcustomer.save(function(err, CPcustomerB) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar cliente',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                cliente: CPcustomerB
            });
        });

    });
});

/**
 * CREAR CPCLIENTE
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var CPcustomer = new AutoProvider({
        name: body.name,
        nit: body.nit,
        address: body.address,
        mobile: body.mobile
    });

    CPcustomer.save(function(err, CPcustomerG) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear cliente',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            cliente: CPcustomerG,
            usuarioToken: req.usuario
        });
    });

});


module.exports = app;