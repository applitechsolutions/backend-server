var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Destination = require('../models/destination');

/**
 * LISTAR TIPOS DE VIAJES
 */

app.get('/', function (req, res) {

    Destination.find({})
        .sort({
            _id: 'desc'
        })
        .exec(
            function (err, destinations) {

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
 * CARGAR TIPOS DE VIAJES
 */

app.get('/:id', function (req, res) {

    var id = req.params.id;

    Destination.findById(id)
        .then(function (typtrip) {
            if (!empDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El tipo de viaje con el id' + id + ' no existe',
                    errors: {
                        message: 'No existe un tipo de viaje con ese ID'
                    }
                });
            }

            res.status(200).json({
                ok: true,
                tipoviaje: typtrip
            });
        })
        .catch(function (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar tipo de viaje',
                errors: err
            });
        });

});

/**
 * CREAR DESTINO
 */

app.post('/', mdAuth.verificaToken, function (req, res) {

    var body = req.body;

    var destination = new Destination({
        name: body.name,
        type: body.type,
        km: body.km,
        tariff: body.tariff
    });

    destination.save()
        .then(function (destinationG) {
            res.status(201).json({
                ok: true,
                destino: destinationG,
                usuarioToken: req.usuario
            });
        })
        .catch(function (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear destino',
                errors: err
            });
        });

});

module.exports = app;