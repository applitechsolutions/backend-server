var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var MaterialCellar = require('../models/materialCellar');

/* #region  POST cellar */
app.post('/', function(req, res) {
    var body = req.body;

    var materialCellar = new MaterialCellar({
        name: body.name
    });

    materialCellar.save()
        .then(function(materialCellar) {
            res.status(201).json({
                ok: true,
                cellar: materialCellar
            });
        }).catch(function(error) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear bodega :(',
                errors: error
            });
        });
});
/* #endregion */

module.exports = app;