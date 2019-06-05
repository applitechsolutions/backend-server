var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var User = require('../models/user');

// GOOGLE
// const { OAuth2Client } = require('google-auth-library');

// const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
// const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

/**
 * LOGIN CON GOOGLE
 */

// app.post('/google', function(req, res) {

//     var token = req.body.token;

//     const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');
//     client.verifyIdToken({
//         idToken: token,
//         audience: GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
//         // Or, if multiple clients access the backend:
//         //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
//         function(e, login) {

//             if (e) {
//                 return res.status(400).json({
//                     ok: false,
//                     mensaje: 'Token no valido',
//                     errors: e
//                 });
//             }

//             const payload = ticket.getPayload();
//             const userid = payload['sub'];
//             // If request specified a G Suite domain:
//             //const domain = payload['hd'];

//             User.findOne({ email: payload.email }, function(err, usuario) {

//                 if (err) {
//                     return res.status(500).json({
//                         ok: false,
//                         mensaje: 'Error al buscar usuario - login',
//                         errors: e
//                     });
//                 }

//                 if (usurio) {
//                     if (usuario.google === false) {
//                         return res.status(400).json({
//                             ok: false,
//                             mensaje: 'Debe usar su autenticación normal',
//                             errors: e
//                         });
//                     } else {
//                         // Crear un TOKEN
//                         usuario.password = ':O';
//                         var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });

//                         res.status(200).json({
//                             ok: true,
//                             usuario: usuario,
//                             token: token,
//                             id: usuario._id
//                         });
//                     }
//                 } else { // SI NO EXISTE USUARIO
//                     var usuarioGoogle = new User();

//                     usuarioGoogle.name = payload.name;
//                     usuarioGoogle.email = payload.email;
//                     usuarioGoogle.password = ':O';
//                     usuarioGoogle.img = payload.img;
//                     usuarioGoogle.role = 'USER_ROLE';
//                     usuarioGoogle.google = true;

//                     usuarioGoogle.save(function(err, usuarioDB) {
//                         if (err) {
//                             return res.status(500).json({
//                                 ok: false,
//                                 mensaje: 'Error al crear usuario con Google',
//                                 errors: e
//                             });
//                         }

//                         var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

//                         res.status(200).json({
//                             ok: true,
//                             usuario: usuarioDB,
//                             token: token,
//                             id: usuarioDB._id
//                         });
//                     });

//                 }

//             });

//         }
//     });

// });


/**
 * LOGIN NORMAL
 */

app.post('/', function(req, res) {

    var body = req.body;

    User.findOne({ email: body.email, state: false }, function(err, usuarioBD) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un TOKEN
        usuarioBD.password = ':O';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });

    });

});


module.exports = app;