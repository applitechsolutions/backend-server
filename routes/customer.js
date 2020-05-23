var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Customer = require('../models/customer.js');

/**
 * LISTAR clientes
 */

app.get('/', function (req, res) {
  Customer.find({ state: false }, 'name nit address mobile')
    .sort({ name: 'asc' })
    .exec(function (err, customers) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando clientes',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        clientes: customers,
      });
    });
});

/**
 * BUSCAR cliente
 */

app.get('/:id', function (req, res) {
  var id = req.params.id;

  Customer.findById(id, 'name nit address mobile').exec(function (
    err,
    customer
  ) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar cliente',
        errors: err,
      });
    }

    if (!customer) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El cliente con el id' + id + ' no existe',
        errors: { message: 'No existe un cliente con ese ID' },
      });
    }

    res.status(200).json({
      ok: true,
      cliente: customer,
    });
  });
});

/**
 * ACTUALIZAR clientes
 */

app.put('/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  Customer.findById(id, function (err, customer) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar cliente',
        errors: err,
      });
    }

    if (!customer) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El cliente con el id' + id + ' no existe',
        errors: { message: 'No existe un cliente con ese ID' },
      });
    }

    customer.name = body.name;
    customer.nit = body.nit;
    customer.address = body.address;
    customer.mobile = body.mobile;

    customer.save(function (err, customerA) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar cliente',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        cliente: customerA,
      });
    });
  });
});

/**
 * BORRAR CLIENTE
 */

app.put('/delete/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;

  Customer.findById(id, function (err, customer) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar cliente',
        errors: err,
      });
    }

    if (!customer) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El cliente con el id' + id + ' no existe',
        errors: { message: 'No existe un cliente con ese ID' },
      });
    }

    customer.state = true;

    customer.save(function (err, customerB) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al borrar cliente',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        cliente: customerB,
      });
    });
  });
});

/**
 * CREAR CLIENTE
 */

app.post('/', mdAuth.verificaToken, function (req, res) {
  var body = req.body;

  var customer = new Customer({
    name: body.name,
    nit: body.nit,
    address: body.address,
    mobile: body.mobile,
  });

  customer.save(function (err, customerG) {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear cliente',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      cliente: customerG,
      usuarioToken: req.usuario,
    });
  });
});

module.exports = app;
