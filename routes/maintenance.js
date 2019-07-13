var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Maintenance = require('../models/maintenance');

app.get('/activos', function(req, res) {


    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correcto PUTOS'
    });
});

module.exports = app;