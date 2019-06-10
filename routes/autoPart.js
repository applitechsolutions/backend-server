var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var AutoPart = require('../models/autoPart');
var AutoCellar = require('../models/autoCellar');

/**
 * LISTAR REPUESTOS
 */

app.get('/', function(req, res) {

    AutoCellar.find({ state: false })
        .populate('storage._autopart', 'code desc minStock')
        .sort({ _id: 'desc' })
        .exec(
            function(err, parts) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando repuestos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    repuestos: parts
                });

            });
});

/**
 * BORRAR REPUESTOS
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {
    var id = req.params.id;

    AutoPart.findById(id, function(err, repuesto) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar repuesto',
                errors: err
            });
        }

        if (!repuesto) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El repuesto con el id' + id + ' no existe',
                errors: { message: 'No existe un repuesto con ese ID' }
            });
        }

        repuesto.state = true;

        repuesto.save(function(err, repuestoBorrado) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar repuesto',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuario: repuestoBorrado
            });
        });

    });
});

/**
 * ACTUALIZAR REPUESTOS
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    AutoPart.findById(id, function(err, repuesto) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar repuesto',
                errors: err
            });
        }

        if (!repuesto) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El repuesto con el id' + id + ' no existe',
                errors: { message: 'No existe un repuesto con ese ID' }
            });
        }

        repuesto.code = body.code;
        repuesto.desc = body.desc;
        repuesto.minStock = body.minStock;

        repuesto.save(function(err, repuestoAct) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                repuesto: repuestoAct
            });

        });
    });
});

/**
 * INSERTAR REPUESTOS
 */

app.post('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    var part = new AutoPart({
        code: body.code,
        desc: body.desc,
        minStock: body.minStock,
        cellar: id
    });

    part.save()
        .then(function(repuestoGuardado) {
            AutoCellar.findById(id)
                .then(function(cellar) {
                    var part = { _autopart: repuestoGuardado._id, stock: 0 };
                    cellar.storage.push(part);
                    cellar.save().then(function(cellarGuardado) {
                            res.status(201).json({
                                ok: true,
                                repuesto: repuestoGuardado,
                                usuarioToken: req.usuario
                            });
                        })
                        .catch(function(err) {
                            res.status(400).json({
                                ok: false,
                                mensaje: 'Error al crear bodega',
                                errors: err
                            });
                        });
                })
                .catch(function(err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'La bodega con el id' + id + ' no existe',
                        errors: { message: 'No existe una bodega con ese ID' }
                    });
                });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear repuesto',
                errors: err
            });
        });
});

/**
 * INSERTAR BODEGA
 */

app.post('/bodega/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;


    var cellar = new AutoCellar({
        name: 'Bodega Principal',
        storage: [{
            _autopart: id,
            stock: body.stock
        }]
    });

    cellar.save(function(err, bodegaGuardada) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear bodega',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            repuesto: bodegaGuardada
        });


    });

});

module.exports = app;