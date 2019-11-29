var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Order = require('../models/order');

/**
 * LISTAR PROVEEDORES
 */

// app.get('/', function(req, res) {

//     Order.find({ state: false }, 'name address mobile1 mobile2 email account1 account2 details')
//         .sort({ name: 'asc' })
//         .exec(
//             function(err, autoProviders) {

//                 if (err) {
//                     return res.status(500).json({
//                         ok: false,
//                         mensaje: 'Error listando proveedores',
//                         errors: err
//                     });
//                 }

//                 res.status(200).json({
//                     ok: true,
//                     proveedores: autoProviders
//                 });
//             });
// });

/**
 * BUSCAR PROVEEDOR
 */

// app.get('/:id', function(req, res) {

//     var id = req.params.id;

//     Order.findById(id, 'name address mobile1 mobile2 email account1 account2 details')
//         .exec(function(err, autoProvider) {
//             if (err) {
//                 return res.status(500).json({
//                     ok: false,
//                     mensaje: 'Error al buscar proveedor',
//                     errors: err
//                 });
//             }

//             if (!autoProvider) {
//                 return res.status(400).json({
//                     ok: false,
//                     mensaje: 'El proveedor con el id' + id + ' no existe',
//                     errors: { message: 'No existe un proveedor con ese ID' }
//                 });
//             }

//             res.status(200).json({
//                 ok: true,
//                 proveedor: autoProvider
//             });

//         });
// });


/**
 * ACTUALIZAR PROVEEDORES
 */

// app.put('/:id', mdAuth.verificaToken, function(req, res) {

//     var id = req.params.id;
//     var body = req.body;

//     Order.findById(id, function(err, autoProvider) {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 mensaje: 'Error al buscar proveedor',
//                 errors: err
//             });
//         }

//         if (!autoProvider) {
//             return res.status(400).json({
//                 ok: false,
//                 mensaje: 'El proveedor con el id' + id + ' no existe',
//                 errors: { message: 'No existe un proveedor con ese ID' }
//             });
//         }

//         autoProvider.name = body.name;
//         autoProvider.address = body.address;
//         autoProvider.mobile1 = body.mobile1;
//         autoProvider.mobile2 = body.mobile2;
//         autoProvider.email = body.email;
//         autoProvider.account1 = body.account1;
//         autoProvider.account2 = body.account2;
//         autoProvider.details = body.details;

//         autoProvider.save(function(err, autoProviderA) {
//             if (err) {
//                 return res.status(400).json({
//                     ok: false,
//                     mensaje: 'Error al actualizar proveedor',
//                     errors: err
//                 });
//             }

//             res.status(200).json({
//                 ok: true,
//                 proveedor: autoProviderA
//             });

//         });

//     });
// });

/**
 * BORRAR PROVEEDOR
 */

// app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {
//     var id = req.params.id;

//     Order.findById(id, function(err, autoProvider) {

//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 mensaje: 'Error al buscar proveedor',
//                 errors: err
//             });
//         }

//         if (!autoProvider) {
//             return res.status(400).json({
//                 ok: false,
//                 mensaje: 'El proveedor con el id' + id + ' no existe',
//                 errors: { message: 'No existe un proveedor con ese ID' }
//             });
//         }

//         autoProvider.state = true;

//         autoProvider.save(function(err, autoProviderB) {

//             if (err) {
//                 return res.status(400).json({
//                     ok: false,
//                     mensaje: 'Error al borrar proveedor',
//                     errors: err
//                 });
//             }

//             res.status(200).json({
//                 ok: true,
//                 proveedor: autoProviderB
//             });
//         });

//     });
// });

/**
 * CREAR PROVEEDOR
 */

app.post('/', mdAuth.verificaToken, function (req, res) {

    var body = req.body;

    var order = new Order({
        date: body.date,
        order: body.order,
        _destination: body._destination
    });

    order.save(function (err, orderG) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear orden',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            orden: orderG,
            usuarioToken: req.usuario
        });
    });

});


module.exports = app;