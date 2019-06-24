var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

app.get('/', function(req, res, next) {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correcto PUTOS'
    });
});

module.exports = app;