var express = require('express');
var bcrypt = require('bcryptjs');

var mdAuth = require('../middlewares/auth');

var app = express();

var User = require('../models/user');

/**
 * LISTAR USUARIOS
 */

app.get('/', function(req, res, next) {

    var desde = req.query.desde;
    desde = Number(desde);

    User.find({ state: false }, 'name lastName email role img')
        .skip(desde)
        .limit(5)
        .exec(
            function(err, users) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando usuarios',
                        errors: err
                    });
                }

                User.countDocuments({ state: false }, function(err, conteo) {
                    res.status(200).json({
                        ok: true,
                        usuarios: users,
                        total: conteo
                    });
                });

            });
});

/**
 * ACTUALIZAR USUARIO
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    User.findById(id, function(err, usuario) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.name = body.name;
        usuario.lastName = body.lastName;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save(function(err, usuarioGuardado) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });
});

/**
 * INSERTAR USUARIO
 */

app.post('/', function(req, res) {
    var body = req.body;

    var user = new User({
        name: body.name,
        lastName: body.lastName,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });

    var userArea = new userArea({

    });

    user.save(function(err, usuarioGuardado) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            userArea: body.userArea,
            usuarioToken: req.usuario
        });
    });


});

module.exports = app;