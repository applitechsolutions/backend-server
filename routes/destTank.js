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