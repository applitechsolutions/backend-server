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