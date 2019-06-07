var express = require('express');
var bcrypt = require('bcryptjs');

var mdAuth = require('../middlewares/auth');

var app = express();

var User = require('../models/user');
var UserArea = require('../models/userArea');
/**
 * LISTAR USUARIOS
 */

app.get('/', function(req, res, next) {

    var desde = req.query.desde;
    desde = Number(desde);

    User.find({ state: false }, 'name lastName email role img')
        .skip(desde)
        .limit(5)
        .sort({ _id: 'desc' })
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
 * BORRAR USUARIO
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {
    var id = req.params.id;

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

        usuario.email = usuario.email + ' borrado';
        usuario.state = true;

        usuario.save(function(err, usuarioBorrado) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar usuario',
                    errors: err
                });
            }

            usuarioBorrado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioBorrado
            });
        });

    });
});

/**
 * INSERTAR USUARIO
 */

app.post('/', function(req, res) {
    var body = req.body;
    var userMany = [];

    var user = new User({
        name: body.name,
        lastName: body.lastName,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });

    <<
    << << < HEAD
    user.insertMany()

    ===
    === = >>>
    >>> > 74 ff28e696ca2b1a781eb7d490ac57a1315018d6
    user.save(function(err, usuarioGuardado) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        body.userArea.forEach(function(area) {
            userMany.push({
                _user: usuarioGuardado._id,
                _area: area._id
            });
        });

        UserArea.insertMany(userMany, function(erro, UAguardada) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al guardar área',
                    errors: err
                });
            }
        });

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });


});

module.exports = app;