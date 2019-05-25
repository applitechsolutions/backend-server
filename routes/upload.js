var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// Modelos
var User = require('../models/user');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', function(req, res) {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Validar colecciones
    var colValidas = ['users'];

    if (colValidas.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Colección no válida',
            errors: { message: 'Las colecciones válidas son: ' + colValidas.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener la extension del archivo
    var file = req.files.imagen;
    var fileSplit = file.name.split('.');
    var fileExt = fileSplit[fileSplit.length - 1];

    // Validar extension
    var extValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extValidas.indexOf(fileExt) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Estensión no válida',
            errors: { message: 'Las extensiones válidas son: ' + extValidas.join(', ') }
        });
    }

    // Nombre personalizado del archivo
    var fileName = `${ id }-${ new Date().getMilliseconds() }.${ fileExt }`;

    // Mover el archivo a un PATH temporal
    var path = `./uploads/${ tipo }/${ fileName }`;

    file.mv(path, function(err) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, fileName, res);

    });

});

function subirPorTipo(tipo, id, fileName, res) {

    if (tipo === 'users') {

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

            var pathViejo = './uploads/users/' + usuario.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = fileName;

            usuario.save(function(err, usuarioActualizdo) {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen del usuario',
                        errors: err
                    });
                }

                usuarioActualizdo.password = ':O';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada',
                    usuario: usuarioActualizdo
                });

            });

        });

    }

}

module.exports = app;