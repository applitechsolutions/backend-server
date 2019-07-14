var mongoose = require('mongoose');
var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Vehicle = require('../models/vehicle');
var ObjectId = mongoose.Types.ObjectId;

/**
 * LISTAR VEHICULOS
 */

app.get('/', function(req, res) {

    Vehicle.find({ state: false }, 'cp type plate no model km mts basics pits')
        .populate('_make', 'name')
        .populate('_gondola', 'plate')
        .populate('pits.rim')
        .sort({ plate: 'asc' })
        .exec(
            function(err, vehicles) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando vehiculos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    vehiculos: vehicles
                });
            });
});

/**
 * LISTAR CUPONES DE GASOLINA
 */

app.get('/gasolines', function(req, res) {

    console.log(req.query);

    var startDate = new Date(req.query.fecha1);
    var endDate = new Date(req.query.fecha2);
    var id = req.query.id;

    console.log(startDate);

    Vehicle.aggregate([{
        $match: { _id: ObjectId(id) }
    }, {
        $match: {
            "gasoline.date": {
                $gte: startDate,
                $lte: endDate
            }
        }
    }, {
        $unwind: "$gasoline"
    }, {
        $match: {
            "gasoline.date": {
                $gte: startDate,
                $lte: endDate
            }
        }
    }, {
        $project: {
            _id: '$gasoline._id',
            code: '$gasoline.code',
            date: '$gasoline.date',
            gallons: '$gasoline.gallons',
            total: '$gasoline.total'
        }
    }], function(err, gasolines) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error listando historial de cupones',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            gasoline: gasolines
        });
    });
});

/**
 * BUSCAR VEHICULO
 */

app.get('/:id', function(req, res) {

    var id = req.params.id;

    Vehicle.findById(id, 'cp type plate no model km mts')
        .populate('_make')
        .exec(function(err, vehiculo) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar vehículo',
                    errors: err
                });
            }

            if (!vehiculo) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El vehículo con el id' + id + ' no existe',
                    errors: { message: 'No existe un vehículo con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                vehiculo: vehiculo
            });

        });
});

/**
 * ACTUALIZAR GASOLINE
 */

app.put('/gasoline/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Vehicle.findOneAndUpdate({ "_id": id, "gasoline._id": body._id }, {
            "$set": {
                "gasoline.$.code": body.code,
                "gasoline.$.date": body.date,
                "gasoline.$.gallons": body.gallons,
                "gasoline.$.total": body.total
            }
        },
        function(err, vehiculoAct) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar vehículo',
                    errors: err
                });
            }
            Vehicle.findById(vehiculoAct._id, { gasoline: 0 })
                .populate('pits.rim')
                .exec(
                    function(err, vehiculoG) {
                        res.status(200).json({
                            ok: true,
                            vehiculo: vehiculoG
                        });
                    }
                );
        }
    );
});


/**
 * ACTUALIZAR VEHICULOS
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Vehicle.findById(id, function(err, vehiculo) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar vehiculo',
                errors: err
            });
        }

        if (!vehiculo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El vehículo con el id' + id + ' no existe',
                errors: { message: 'No existe un vehículo con ese ID' }
            });
        }

        vehiculo.cp = body.cp;
        vehiculo.type = body.type;
        vehiculo._gondola = body.gondola;
        vehiculo._make = body._make._id;
        vehiculo.plate = body.plate;
        vehiculo.no = body.no;
        vehiculo.model = body.model;
        vehiculo.km = body.km;
        vehiculo.mts = body.mts;
        if (body.basics.length > 0) {
            vehiculo.basics = body.basics;
        }
        if (body.pits.length > 0) {
            vehiculo.pits = body.pits;
        }

        vehiculo.save(function(err, vehiculoAct) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar vehículo',
                    errors: err
                });
            }

            Vehicle.findById(vehiculoAct._id, { gasoline: 0 })
                .populate('pits.rim')
                .exec(
                    function(err, vehiculoG) {
                        res.status(200).json({
                            ok: true,
                            vehiculo: vehiculoG
                        });
                    }
                );
        });

    });
});

/**
 * BORRAR GASOLINE
 */

app.put('/gasoline/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Vehicle.findOneAndDelete({ "_id": id, "gasoline._id": body._id }, {
            "$set": {
                "gasoline.$.code": body.code,
                "gasoline.$.date": body.date,
                "gasoline.$.gallons": body.gallons,
                "gasoline.$.total": body.total
            }
        },
        function(err, vehiculoAct) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar vehículo',
                    errors: err
                });
            }
            Vehicle.findById(vehiculoAct._id, { gasoline: 0 })
                .populate('pits.rim')
                .exec(
                    function(err, vehiculoG) {
                        res.status(200).json({
                            ok: true,
                            vehiculo: vehiculoG
                        });
                    }
                );
        }
    );
});

/**
 * BORRAR VEHICULOS
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {
    var id = req.params.id;

    Vehicle.findById(id, function(err, vehiculo) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar vehículo',
                errors: err
            });
        }

        if (!vehiculo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El vehículo con el id' + id + ' no existe',
                errors: { message: 'No existe un vehículo con ese ID' }
            });
        }

        vehiculo.state = true;

        vehiculo.save(function(err, vehiculoBorrado) {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar vehículo',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                vehiculo: vehiculoBorrado
            });
        });

    });
});

/**
 * INSERTAR GASOLINE
 */

app.post('/gasoline/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Vehicle.findById(id, function(err, vehiculo) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar vehículo',
                errors: err
            });
        }

        if (!vehiculo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El vehículo con el id' + id + ' no existe',
                errors: { message: 'No existe un vehículo con ese ID' }
            });
        }

        var gasoline = {
            code: body.code,
            date: body.date,
            gallons: body.gallons,
            total: body.total
        };

        vehiculo.gasoline.push(gasoline);

        vehiculo.save(function(err, vehiculoAct) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar vehículo',
                    errors: err
                });
            }

            Vehicle.findById(vehiculoAct._id, { gasoline: 0 })
                .populate('pits.rim')
                .exec(
                    function(err, vehiculoG) {
                        res.status(200).json({
                            ok: true,
                            vehiculo: vehiculoG
                        });
                    }
                );
        });

    });
});

/**
 * CREAR VEHICULOS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;
    var cp;

    if (body.cp === null) {
        cp = new Date().getMilliseconds();
    } else {
        cp = body.cp;
    }

    var vehiculo = new Vehicle({
        cp: cp,
        type: body.type,
        _make: body._make._id,
        plate: body.plate,
        no: body.no,
        model: body.model,
        km: body.km,
        mts: body.mts
    });

    vehiculo.save(function(err, vehiculoGuardado) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear vehiculo',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            vehiculo: vehiculoGuardado,
            usuarioToken: req.usuario
        });
    });

});


module.exports = app;