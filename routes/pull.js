var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Pull = require('../models/pull');

/**
 * LISTAR PULLS ACTIVOS
 */

app.get('/', function (req, res) {

    Pull.find({
            state: false
        }, '_order _material mts totalMts kg totalKg')
        .populate({
            path: '_order',
            populate: {
                path: '_destination'
            }
        })
        .populate('_material', '')
        .sort({
            _id: 'desc'
        })
        .exec(
            function (err, pulls) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando ordenes',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    pulls: pulls
                });
            });
});

/**
 * LISTAR pulls FINALIZADOS
 */

app.get('/finisheds', function (req, res) {

    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);

    Pull.find({
            state: true
        }, '_order _material mts totalMts kg totalKg')
        .populate({
            path: '_order',
            match: {
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            populate: {
                path: '_destination'
            }
        })
        .populate('_material', '')
        .sort({
            _id: 'desc'
        })
        .exec(
            function (err, pulls) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando ordenes',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    pulls: pulls
                });
            });
});

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
 * FINALIZAR pull
 */

app.put('/finish/:id', mdAuth.verificaToken, function (req, res) {
    var id = req.params.id;

    Pull.findById(id, function (err, pull) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar orden',
                errors: err
            });
        }

        if (!pull) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El orden con el id' + id + ' no existe',
                errors: {
                    message: 'No existe un orden con ese ID'
                }
            });
        }

        pull.state = true;

        pull.save(function (err, pullB) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar orden',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                pull: pullB
            });
        });

    });
});

/**
 * CREAR PROVEEDOR
 */

app.post('/', mdAuth.verificaToken, function (req, res) {

    var body = req.body;

    var pull = new Pull({
        _order: body._order,
        _material: body._material,
        mts: body.mts,
        totalMts: body.totalMts,
        kg: body.kg,
        totalKg: body.totalKg
    });

    pull.save(function (err, pullG) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear pull',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            pull: pullG,
            usuarioToken: req.usuario
        });
    });

});


module.exports = app;