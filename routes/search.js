var express = require('express');

var app = express();

var Material = require('../models/material');
var Cellar = require('../models/materialCellar');
var User = require('../models/user');

/**
 * BUSCAR EN UNA COLECCION
 */

app.get('/coleccion/:tabla/:busqueda', function(req, res) {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'users':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'materials':
            promesa = buscarMateriales(busqueda, regex);
            break;
        case 'cellars':
            promesa = buscarBodegas(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, materiales y bodegas',
                errors: { message: 'Tipo de tabla/coleccion no valido' }
            });
    }

    promesa.then(function(data) {
        return res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });


});

/**
 * BUSCAR EN TODAS LAS COLECCIONES
 */

app.get('/todo/:busqueda', function(req, res) {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarMateriales(busqueda, regex),
            buscarBodegas(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(function(respuestas) {
            res.status(200).json({
                ok: true,
                materiales: respuestas[0],
                bodegas: respuestas[1],
                usuarios: respuestas[2]
            });
        })
        .catch(function(error) {
            res.status(400).json({
                ok: true,
                error: error
            });
        });
});


function buscarMateriales(busqueda, regex) {
    return new Promise(function(resolve, reject) {

        Material.find({ name: regex }, function(err, materiales) {
            if (err) {
                reject('Error al cargar materiales', err);
            } else {
                resolve(materiales);
            }
        });

    });
}

function buscarBodegas(busqueda, regex) {
    return new Promise(function(resolve, reject) {

        Cellar.find({ name: regex }, function(err, bodegas) {
            if (err) {
                reject('Error al cargar bodegas', err);
            } else {
                resolve(bodegas);
            }
        });

    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise(function(resolve, reject) {

        User.find({ state: false }, 'name lastName email role, img')
            .or([{ 'name': regex }, { 'email': regex }, { 'lastName': regex }])
            .exec(function(err, usuarios) {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;