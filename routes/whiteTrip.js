var express = require('express');
var mdAuth = require('../middlewares/auth');
var app = express();

var whiteTrip = require('../models/whiteTrip');
var Vehicle = require('../models/vehicle');
var Gondola = require('../models/gondola');
var Pull = require('../models/pull');

/**
 * LISTAR REPORTE LINEAS POR PULL
 */

app.get('/:id', function (req, res) {
  var id = req.params.id;

  whiteTrip
    .find(
      {
        state: false,
        _pull: id,
      },
      'date noTicket noDelivery mts kgB kgT kgN checkIN checkOUT tariff invoiced'
    )
    .populate('_employee', 'name')
    .populate('_vehicle', 'plate type km')
    .populate({
      path: '_pull',
      populate: {
        path: '_order',
        populate: {
          path: '_destination',
        },
      },
    })
    .sort({
      _id: 'asc',
    })
    .exec(function (err, Wviajes) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando reporte cuadros',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        wviajes: Wviajes,
      });
    });
});

/**
 * LISTAR REPORTES DE LINEAS POR FECHAS
 */

app.get('/reports/:id', function (req, res) {
  const id = req.params.id;
  const startDate = new Date(req.query.fecha1);
  const endDate = new Date(req.query.fecha2);

  whiteTrip
    .find(
      {
        state: false,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        _pull: id,
      },
      'date noTicket noDelivery mts kgB kgT kgN checkIN checkOUT tariff invoiced'
    )
    .populate('_employee', 'name')
    .populate('_vehicle', 'plate type km')
    .populate({
      path: '_pull',
      populate: {
        path: '_order',
        populate: {
          path: '_destination',
        },
      },
    })
    .sort({
      _id: 'asc',
    })
    .exec(function (err, Wviajes) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando reporte cuadros',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        wviajes: Wviajes,
      });
    });
});

/**
 * ELIMINAR REPORTE LINEAS
 */

app.put('/anular', mdAuth.verificaToken, function (req, res) {
  const id = req.query.id;
  const body = req.body;
  const km = req.query.km;

  whiteTrip
    .findByIdAndUpdate(id, { $set: { state: body.state } }, { new: true })
    .then(function (deleteT) {
      Pull.updateOne(
        {
          _id: body._pull._id,
        },
        {
          $inc: {
            mts: -body.mts,
            kg: -body.kgN,
          },
        }
      )
        .then(function () {})
        .catch(function (err) {
          console.log(err);
        });
      Vehicle.findByIdAndUpdate(
        body._vehicle._id,
        { $inc: { km: -km, 'pits.$[elem].km': -km } },
        {
          multi: true,
          arrayFilters: [{ 'elem.km': { $gte: 0 } }],
        }
      )
        .then(function (vehicle) {})
        .catch(function (err) {});

      if (body._vehicle.type === 'camionG') {
        Gondola.findByIdAndUpdate(
          body._vehicle._gondola,
          { $inc: { 'pits.$[elem].km': -km } },
          {
            multi: true,
            arrayFilters: [{ 'elem.km': { $gte: 0 } }],
          }
        )
          .then(function (gkm) {})
          .catch(function (err) {});
      }

      res.status(200).json({
        ok: true,
        viajeB: deleteT,
      });
    })
    .catch(function (err) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al anular reporte de lineas',
        errors: err,
      });
    });
});

/**
 * CREAR REPORTE LINEAS
 */

app.post('/', mdAuth.verificaToken, function (req, res) {
  var body = req.body;
  var km = req.query.km;

  var whitetrip = new whiteTrip({
    _employee: body._employee,
    _vehicle: body._vehicle,
    _pull: body._pull,
    date: body.date,
    noTicket: body.noTicket,
    noDelivery: body.noDelivery,
    mts: body.mts,
    kgB: body.kgB,
    kgT: body.kgT,
    kgN: body.kgN,
    checkIN: body.checkIN,
    checkOUT: body.checkOUT,
    tariff: body.tariff,
  });

  whitetrip
    .save()
    .then(function (wtripsave) {
      Pull.updateOne(
        {
          _id: body._pull._id,
        },
        {
          $inc: {
            mts: body.mts,
            kg: body.kgN,
          },
        }
      )
        .then(function () {})
        .catch(function (err) {
          console.log(err);
        });

      Vehicle.updateOne(
        {
          _id: body._vehicle._id,
        },
        {
          $inc: {
            km: km,
            'pits.$[elem].km': km,
          },
        },
        {
          multi: true,
          arrayFilters: [
            {
              'elem.km': {
                $gte: 0,
              },
            },
          ],
        }
      )
        .then(function (tripKm) {})
        .catch(function (err) {
          console.log(err);
        });

      if (body._vehicle.type === 'camionG') {
        Gondola.findByIdAndUpdate(
          body._vehicle._gondola,
          {
            $inc: {
              'pits.$[elem].km': km,
            },
          },
          {
            multi: true,
            arrayFilters: [
              {
                'elem.km': {
                  $gte: 0,
                },
              },
            ],
          }
        )
          .then(function (gkm) {})
          .catch(function (err) {
            console.log(err);
          });
      }
      res.status(201).json({
        ok: true,
        viajeB: wtripsave,
        usuarioToken: req.usuario,
      });
    })
    .catch(function (err) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al crear reporte lineas',
        errors: err,
      });
      console.log(err);
    });
});

module.exports = app;
