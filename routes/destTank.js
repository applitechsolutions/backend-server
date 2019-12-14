var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var DestTank = require('../models/destTank');

/**
 * LISTAR DESTINOS CISTERNA
 */

app.get('/', function(req, res) {


    DestTank.find({ state: false }, 'name km')
        .sort({
            _id: 'desc'
        })
        .exec(
            function(err, destinations) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando destinos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    destinos: destinations
                });
            });
});

/**
 * CARGAR DESTINO POR ID
 */

app.get('/destino', function(req, res) {

    var id = req.query.id;

    DestTank.findById(id)
        .then(function(dest) {
            if (!dest) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El destino con el id' + id + ' no existe',
                    errors: {
                        message: 'No existe un destino con ese ID'
                    }
                });
            }

            res.status(200).json({
                ok: true,
                destino: dest
            });
        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar destino',
                errors: err
            });
        });
});

/**
 * ACTUALIZAR DESTINOS CISTERNA
 */

app.put('/', mdAuth.verificaToken, function(req, res) {

    var id = req.query.id;
    var body = req.body;

    DestTank.findByIdAndUpdate(id, { $set: { "name": body.name, "km": body.km } }, { new: true })
        .then(function(destUpdate) {
            res.status(200).json({
                ok: true,
                destino: destUpdate
            });
        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error actualizando destino',
                errors: err
            });
        });

});

/**
 * ELIMINAR DESTINOS CISTERNA
 */

app.put('/delete', mdAuth.verificaToken, function(req, res) {

    var id = req.query.id;
    var body = req.body;

    DestTank.findByIdAndUpdate(id, { $set: { "state": body.state } }, { new: true })
        .then(function(destDel) {
            res.status(200).json({
                ok: true,
                destino: destDel
            });
        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error borrando destino cisterna',
                errors: err
            });
        });
});

/**
 * CREAR DESTINOS CISTERNA
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var destTank = new DestTank({

        name: body.name,
        km: body.km

    });

    destTank.save()
        .then(function(destSave) {
            res.status(201).json({
                ok: true,
                destino: destSave,
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