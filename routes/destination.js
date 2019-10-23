var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Destination = require('../models/destination');

/**
 * LISTAR DESTINOS
 */

app.get('/', function(req, res) {

    Destination.find({})
        .sort({ _id: 'desc' })
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
 * CARGAR DESTINO
 */

app.get('/:id', function(req, res) {

    var id = req.params.id;

    Destination.findById(id)
        .then(function(destination) {
            if (!destination) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El destino con el id' + id + ' no existe',
                    errors: { message: 'No existe un destino con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                destino: destination
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
 * ACTUALIZAR DESTINO
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Destination.findById(id, function(err, destination) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar destino',
                errors: err
            });
        }

        if (!destination) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El destino con el id' + id + ' no existe',
                errors: { message: 'No existe un destino con ese ID' }
            });
        }

        destination.name = body.name;
        destination.km = body.km;

        destination.save(function(err, destinationG) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar destino',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                destino: destinationG
            });

        });

    });
});

/**
 * BORRAR DESTINO
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {
    var id = req.params.id;

    Destination.findById(id, function(err, destination) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar destino',
                errors: err
            });
        }

        if (!destination) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El destino con el id' + id + ' no existe',
                errors: { message: 'No existe un destino con ese ID' }
            });
        }

        destination.state = true;

        destination.save(function(err, destinationG) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar destino',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                destino: destinationG
            });
        });

    });
});

/**
 * CREAR DESTINO
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var destination = new Destination({
        name: body.name,
        km: body.km
    });

    destination.save()
        .then(function(destinationG) {
            res.status(201).json({
                ok: true,
                destino: destinationG,
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