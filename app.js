// REQUIRES 
var express = require('express');
var mongoose = require('mongoose');


// Inicializar Variables XD
var app = express();


// Conexion a la DB
mongoose.connection.openUri('mongodb://localhost:27017/trucksDB', (error, res) => {
    if (error) throw error;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'ONLINE XD');
});


// Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correcto PUTOS'
    });
});


// Escuchar Peticiones
app.listen(3000, function() {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE XD');
});