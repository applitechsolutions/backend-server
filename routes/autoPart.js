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
 * BUSCAR REPUESTO
 */

app.get('/:id', function(req, res) {

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

        res.status(200).json({
            ok: true,
            repuesto: repuesto
        });

    });
});

/**
 * BORRAR REPUESTOS
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {
    var id = req.params.id;
    var body = req.body;
    var storage = [];

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

        repuesto.save()
            .then(function(repuestoBorrado) {

                body.storage.forEach(function(bodega) {
                    storage.push({
                        _autopart: bodega._id,
                        stock: bodega.stock,
                        cost: bodega.cost
                    });
                });

                AutoCellar.findById(body.id)
                    .then(function(cellar) {

                        cellar.storage = storage.slice(0);

                        cellar.save()
                            .then(function(cellarGuardado) {

                                res.status(200).json({
                                    ok: true,
                                    repuesto: repuestoBorrado
                                });
                            })
                            .catch(function(err) {
                                res.status(400).json({
                                    ok: false,
                                    mensaje: 'Error al Guardar storage',
                                    errors: err
                                });
                            });

                    })
                    .catch(function(err) {
                        res.status(500).json({
                            ok: false,
                            mensaje: 'Error al buscar bodega',
                            errors: err
                        });
                    });

            })
            .catch(function(err) {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al borrar repuesto',
                        errors: err
                    });
                }
            });


    });
});

/**
 * ACTUALIZAR REPUESTOS SUMAR STOCK
 */

app.put('/purchase/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    AutoCellar.findOne({ 'storage._autopart': body._part }, { 'storage.$': 1 })
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

            var newStock = cellar.storage[0].stock + body.quantity;

            AutoCellar.updateOne({ 'storage._autopart': body._part }, { 'storage.$.stock': newStock }, function(err, storageAct) {
                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar existencia',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Storage actualizado',
                    storage: storageAct
                });
            });
        });
});


/**
 * ACTUALIZAR REPUESTOS RESTAR STOCK
 */

app.put('/sale/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    AutoCellar.findOne({ 'storage._autopart': body._part }, { 'storage.$': 1 })
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

            var newStock = cellar.storage[0].stock - body.quantity;

            AutoCellar.updateOne({ 'storage._autopart': body._part }, { 'storage.$.stock': newStock }, function(err, storageAct) {
                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar existencia',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Storage actualizado',
                    storage: storageAct
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

app.post('/', mdAuth.verificaToken, function(req, res) {

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
            AutoCellar.findOne({ name: 'Bodega Principal' })
                .then(function(cellar) {
                    var part = { _autopart: repuestoGuardado._id, stock: 0, cost: 0.00 };
                    cellar.storage.push(part);
                    cellar.save()
                        .then(function(cellarGuardado) {
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
                        mensaje: 'La bodega con el id ' + id + ' no existe',
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

app.post('/bodega/:id', function(req, res) {

    var id = req.params.id;
    var body = req.body;


    var cellar = new AutoCellar({
        name: 'Bodega Principal',
        storage: [{
            _autopart: id,
            stock: body.stock,
            cost: body.cost
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