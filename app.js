// REQUIRES 
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

// Inicializar Variables XD
var app = express();

app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// BODY PARSER
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importaciones
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var materialRoutes = require('./routes/material');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/images');
var areaRoutes = require('./routes/area');
var userAreaRoutes = require('./routes/userArea');
// Taller
var partRoutes = require('./routes/autoPart');
var vehiclesRoutes = require('./routes/vehicle');
var makeRoutes = require('./routes/make');
var rimRoutes = require('./routes/rim');

// Conexion a la DB
mongoose.set('useCreateIndex', true);

mongoose.connection.openUri('mongodb://localhost:27017/trucksDB', function(error, res) {
    if (error) throw error;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'ONLINE XD');
});

// Rutas
app.use('/userArea', userAreaRoutes);
app.use('/area', areaRoutes);
app.use('/usuario', userRoutes);
app.use('/login', loginRoutes);
// Taller
app.use('/repuesto', partRoutes);
app.use('/material', materialRoutes);
app.use('/vehiculo', vehiclesRoutes);
app.use('/marca', makeRoutes);
app.use('/llanta', rimRoutes);

app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagesRoutes);
app.use('/', appRoutes);


// Escuchar Peticiones
app.listen(3000, function() {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE XD');
});