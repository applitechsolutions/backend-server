var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Destination = require('../models/destination');

/**
 * LISTAR destinos
 */

app.get('/', function (req, res) {
  Destination.find({})
    .sort({
      _id: 'desc',
    })
    .exec(function (err, destinations) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando destinos',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        destinos: destinations,
      });
    });
});

/**
 * CARGAR destino
 */

app.get('/:id', function (req, res) {
  var id = req.params.id;

  Destination.findById(id)
    .then(function (destination) {
      if (!destination) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El destino con el id' + id + ' no existe',
          errors: {
            message: 'No existe un destino con ese ID',
          },
        });
      }

      res.status(200).json({
        ok: true,
        destino: destination,
      });
    })
    .catch(function (err) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar destino',
        errors: err,
      });
    });
});

/**
 * EDITAR destino
 */

app.put('/', mdAuth.verificaToken, function (req, res) {
  var id = req.query.id;
  var body = req.body;

  console.log('editando');

  Destination.findByIdAndUpdate(
    id,
    {
      name: body.name,
      type: body.type,
      km: body.km,
      tariff: body.tariff,
    },
    {
      new: true,
    }
  )
    .then(function (destinationU) {
      res.status(200).json({
        ok: true,
        destino: destinationU,
      });
    })
    .catch(function (err) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error actualizando destino',
        errors: err,
      });
    });
});

/**
 * CREAR destino
 */

app.post('/', mdAuth.verificaToken, function (req, res) {
  var body = req.body;

  var destination = new Destination({
    name: body.name,
    type: body.type,
    km: body.km,
    tariff: body.tariff,
  });

  destination
    .save()
    .then(function (destinationG) {
      res.status(201).json({
        ok: true,
        destino: destinationG,
        usuarioToken: req.usuario,
      });
    })
    .catch(function (err) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al crear destino',
        errors: err,
      });
    });
});

module.exports = app;
