var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Employee = require('../models/employee');

/**
 * LISTAR EMPLEADOS
 */

app.get('/', function(req, res) {

    Employee.find({ state: false })
        .sort({ _id: 'desc' })
        .exec(
            function(err, employees) {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error listando empleados',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    empleados: employees
                });
            });
});

/**
 * BUSCAR EMPLEADO
 */

app.get('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;

    Employee.findById(id)
        .then(function(empDB) {
            if (!empDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El empleado con el id' + id + ' no existe',
                    errors: { message: 'No existe un empleado con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                empleado: empDB
            });
        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar empleado',
                errors: err
            });
        });
});

/**
 * BORRAR EMPLEADOS
 */

app.put('/delete/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Employee.findByIdAndUpdate(id, { $set: { state: body.state } }, { new: true })
        .then(function(empDEL) {
            if (!empDEL) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El empleado con el id' + id + ' no existe',
                    errors: { message: 'No existe un empleado con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                empleado: empDEL
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar empleado',
                errors: err
            });
        });

});

/**
 * ACTUALIZAR EMPLEADOS
 */

app.put('/:id', mdAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Employee.findById(id)
        .then(function(empDB) {

            if (!empDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El empleado con el id' + id + ' no existe',
                    errors: { message: 'No existe un empleado con ese ID' }
                });
            }

            empDB.job = body.job;
            empDB.entry = body.entry;
            empDB.account = body.account;
            empDB.name = body.name;
            empDB.datestart = body.datestart;
            empDB.pay = body.pay;
            empDB.dpi = body.dpi;
            empDB.address = body.address;
            empDB.mobile = body.mobile;
            empDB.igss = body.igss;

            empDB.save()
                .then(function(empAct) {
                    res.status(200).json({
                        ok: true,
                        empleado: empAct
                    });
                })
                .catch(function(err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar empleado',
                        errors: err
                    });
                });

        })
        .catch(function(err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar empleado',
                errors: err
            });

            console.log(err);
        });

});

/**
 * CREAR EMPLEADOS
 */

app.post('/', mdAuth.verificaToken, function(req, res) {

    var body = req.body;

    var employee = new Employee({
        job: body.job,
        entry: body.entry,
        account: body.account,
        name: body.name,
        datestart: body.datestart,
        pay: body.pay,
        dpi: body.dpi,
        address: body.address,
        mobile: body.mobile,
        igss: body.igss
    });

    employee.save()
        .then(function(empSave) {
            res.status(201).json({
                ok: true,
                empleado: empSave,
                usuarioToken: req.usuario
            });
        })
        .catch(function(err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear empleado',
                errors: err
            });
        });
});

module.exports = app;