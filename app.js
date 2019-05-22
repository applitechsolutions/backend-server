// REQUIRES 
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Inicializar Variables XD
var app = express();

// BODY PARSER
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importaciones
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');


// Conexion a la DB
mongoose.set('useCreateIndex', true);
mongoose.connection.openUri('mongodb://localhost:27017/trucksDB', function(error, res) {
    if (error) throw error;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'ONLINE XD');
});

// Rutas
app.use('/usuario', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar Peticiones
app.listen(3000, function() {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE XD');
});