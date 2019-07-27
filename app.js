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
var buySpareRoutes = require('./routes/buySpare');
var autoProviderRoutes = require('./routes/autoProvider');
var partRoutes = require('./routes/autoPart');
var vehiclesRoutes = require('./routes/vehicle');
var gondolaRoutes = require('./routes/gondola');
var makeRoutes = require('./routes/make');
var rimRoutes = require('./routes/rim');
var mechRoutes = require('./routes/mechanic');
var pitRoutes = require('./routes/pit');
var maintRoutes = require('./routes/maintenance');
var typeMaintenanceRoutes = require('./routes/typeMaintenance');

// Conexion a la DB
mongoose.set('useCreateIndex', true);

// mongoose.connection.openUri('mongodb://localhost:27017/trucksDB', { useNewUrlParser: true }, function(error, res) {
//     if (error) throw error;

//     console.log('Base de datos: \x1b[32m%s\x1b[0m', 'ONLINE XD');
// });

mongoose.connection.openUri('MONGO_URL', { useNewUrlParser: true }, function(error, res) {
    if (error) throw error;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'ONLINE XD');
});

// Transportes
app.use('/userArea', userAreaRoutes);
app.use('/area', areaRoutes);
app.use('/usuario', userRoutes);
app.use('/login', loginRoutes);
// Taller
app.use('/compraRepuesto', buySpareRoutes);
app.use('/autoProveedor', autoProviderRoutes);
app.use('/repuesto', partRoutes);
app.use('/material', materialRoutes);
app.use('/vehiculo', vehiclesRoutes);
app.use('/gondola', gondolaRoutes);
app.use('/marca', makeRoutes);
app.use('/llanta', rimRoutes);
app.use('/mecanico', mechRoutes);
app.use('/pit', pitRoutes);
app.use('/mantenimiento', maintRoutes);
app.use('/tipoMantenimiento', typeMaintenanceRoutes);

app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagesRoutes);
app.use('/', appRoutes);


// Escuchar Peticiones
app.listen(3000, function() {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE XD');
});