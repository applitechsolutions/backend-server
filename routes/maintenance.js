var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Maintenance = require('../models/maintenance');

// BUSCAR MANTENIMIENTO ACTIVO DE UN vehiculo
app.get('/activeV/:id', function(req, res) {
    var id = req.params.id;

    Maintenance.findOne({ state: false, _vehicle: id }, 'dateStart totalV totalG detailsRev detailsRep')
        .populate('_user', 'name lastName img')
        .populate('_mech', '')
        .populate('detailsV.part', 'code desc')
        .populate('detailsG.part', 'code desc')
        .exec(
            function(err, mant) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al listar mantenimiento del vehículo',
                        mantenimiento: null,
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mantenimiento: mant
                });

            });


});

// BUSCAR MANTENIMIENTO ACTIVO DE UNA gondola
app.get('/activeG/:id', function(req, res) {
    var id = req.params.id;
    Maintenance.findOne({ state: 0, _gondola: id }, 'dateStart totalV totalG detailsRev detailsRep')
        .populate('_user', 'name lastName img')
        .populate('_mech', '')
        .populate('detailsV.part', 'code desc')
        .populate('detailsG.part', 'code desc')
        .exec(
            function(err, mant) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al listar mantenimiento de la gondola',
                        mantenimiento: null,
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mantenimiento: mant
                });

            });

});

/**
 * ACTUALIZAR MANTENIMIENTO
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Maintenance.findById(id, function(err, mantenimiento) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar mantenimiento',
                errors: err
            });
        }

        if (!mantenimiento) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El mantenimiento con el id' + id + ' no existe',
                errors: { message: 'No existe un mantenimiento con ese ID' }
            });
        }


        mantenimiento._user = body._user._id;
        mantenimiento._mech = body._mech;
        mantenimiento.detailsV = body.detailsV;
        mantenimiento.detailsG = body.detailsG;
        mantenimiento.totalV = body.totalV;
        mantenimiento.totalG = body.totalG;
        mantenimiento.detailsRev = body.detailsRev;
        mantenimiento.detailsRep = body.detailsRep;

        mantenimiento.save(function(err, mantenimientoAct) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar mantenimiento',
                    errors: err
                });
            }

            Maintenance.findById(mantenimientoAct._id, { state: false })
                .populate('_user', 'name lastName img')
                .populate('_mech', '')
                .populate('detailsV.part', 'code desc')
                .populate('detailsG.part', 'code desc')
                .exec(
                    function(err, mantenimientoG) {
                        res.status(200).json({
                            ok: true,
                            mantenimiento: mantenimientoG
                        });
                    }
                );
        });

    });
});


/**
 * CREAR MANTENIMIENTO
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var mantenimiento = new Maintenance({
        _user: body._user._id,
        _vehicle: body._vehicle._id,
        _gondola: body._gondola._id,
        _mech: body._mech,
        dateStart: body.dateStart,
        _typeMaintenance: null,
        detailsRev: '',
        detailsRep: ''
    });

    mantenimiento.save(function(err, mantenimientoG) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear mantenimiento',
                errors: err
            });
        }

        Maintenance.findById({ _id: mantenimientoG._id }, 'dateStart totalV totalG detailsRev detailsRep')
            .populate('_user', 'name lastName img')
            .populate('_mech', '')
            .populate('detailsV.part', 'code desc')
            .populate('detailsG.part', 'code desc')
            .exec(
                function(err, mant) {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al listar mantenimiento del vehículo',
                            mantenimiento: null,
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        mantenimiento: mant
                    });

                });
    });
});

module.exports = app;