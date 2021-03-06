var express = require('express');
var mongoose = require('mongoose');
var mdAuth = require('../middlewares/auth');
var app = express();

var whiteTrip = require('../models/whiteTrip');
var Vehicle = require('../models/vehicle');
var Gondola = require('../models/gondola');
var Pull = require('../models/pull');

/**
 * LISTAR REPORTE LINEAS DE ORDENES ACTIVAS
 */

app.get('/actives', function name(req, res) {
  whiteTrip.aggregate(
    [
      {
        $match: {
          state: false,
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_employee',
          foreignField: '_id',
          as: '_employee',
        },
      },
      {
        $unwind: '$_employee',
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_vehicle',
          foreignField: '_id',
          as: '_vehicle',
        },
      },
      {
        $unwind: '$_vehicle',
      },
      {
        $lookup: {
          from: 'pulls',
          localField: '_pull',
          foreignField: '_id',
          as: '_pull',
        },
      },
      {
        $unwind: '$_pull',
      },
      {
        $match: {
          '_pull.state': false,
        },
      },
      {
        $lookup: {
          from: 'materials',
          localField: '_pull._material',
          foreignField: '_id',
          as: '_pull._material',
        },
      },
      {
        $unwind: '$_pull._material',
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_pull._order',
          foreignField: '_id',
          as: '_pull._order',
        },
      },
      {
        $unwind: '$_pull._order',
      },
      {
        $lookup: {
          from: 'destinations',
          localField: '_pull._order._destination',
          foreignField: '_id',
          as: '_pull._order._destination',
        },
      },
      {
        $unwind: '$_pull._order._destination',
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $project: {
          _id: '$_id',
          _employee: { name: 1 },
          _vehicle: { plate: 1 },
          _pull: 1,
          date: '$date',
          noTicket: '$noTicket',
          noDelivery: '$noDelivery',
          mts: '$mts',
          kgB: '$kgB',
          kgT: '$kgT',
          kgN: '$kgN',
          checkIN: '$checkIN',
          checkOUT: '$checkOUT',
          invoiced: '$invoiced',
        },
      },
    ],
    function (err, reports) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando reportes',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        reportes: reports,
      });
    }
  );
});

/**
 * LISTAR REPORTE LINEAS DE ORDENES HISTORIAL
 */

app.get('/history', function name(req, res) {
  var startDate = new Date(req.query.fecha1);
  var endDate = new Date(req.query.fecha2);

  whiteTrip.aggregate(
    [
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          state: false,
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_employee',
          foreignField: '_id',
          as: '_employee',
        },
      },
      {
        $unwind: '$_employee',
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_vehicle',
          foreignField: '_id',
          as: '_vehicle',
        },
      },
      {
        $unwind: '$_vehicle',
      },
      {
        $lookup: {
          from: 'pulls',
          localField: '_pull',
          foreignField: '_id',
          as: '_pull',
        },
      },
      {
        $unwind: '$_pull',
      },
      {
        $lookup: {
          from: 'materials',
          localField: '_pull._material',
          foreignField: '_id',
          as: '_pull._material',
        },
      },
      {
        $unwind: '$_pull._material',
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_pull._order',
          foreignField: '_id',
          as: '_pull._order',
        },
      },
      {
        $unwind: '$_pull._order',
      },
      {
        $lookup: {
          from: 'destinations',
          localField: '_pull._order._destination',
          foreignField: '_id',
          as: '_pull._order._destination',
        },
      },
      {
        $unwind: '$_pull._order._destination',
      },
      {
        $sort: {
          date: 1,
        },
      },
      {
        $project: {
          _id: '$_id',
          _employee: { name: 1 },
          _vehicle: { plate: 1 },
          _pull: 1,
          date: '$date',
          noTicket: '$noTicket',
          noDelivery: '$noDelivery',
          mts: '$mts',
          kgB: '$kgB',
          kgT: '$kgT',
          kgN: '$kgN',
          checkIN: '$checkIN',
          checkOUT: '$checkOUT',
          invoiced: '$invoiced',
        },
      },
    ],
    function (err, reports) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando reportes',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        reportes: reports,
      });
    }
  );
});

/**
 * LISTAR REPORTE LINEAS DISPONIBLES PARA FACTURAR EN EL CD
 */

app.get('/purchaseCD', function (req, res) {
  var id = mongoose.Types.ObjectId('5e31e0a9c71f490a70eb2884'); // ID DEL CENTRO DE DISTRIBUCION DE LA VIÑA

  whiteTrip.aggregate(
    [
      {
        $match: {
          state: false,
          invoicedCD: false,
        },
      },
      {
        $lookup: {
          from: 'pulls',
          localField: '_pull',
          foreignField: '_id',
          as: '_pull',
        },
      },
      {
        $unwind: '$_pull',
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_pull._order',
          foreignField: '_id',
          as: '_pull._order',
        },
      },
      {
        $unwind: '$_pull._order',
      },
      {
        $match: {
          '_pull._order._destination': id,
        },
      },
      {
        $lookup: {
          from: 'materials',
          localField: '_pull._material',
          foreignField: '_id',
          as: '_pull._material',
        },
      },
      {
        $unwind: '$_pull._material',
      },
      {
        $sort: {
          '_pull._order.order': 1,
        },
      },
      {
        $project: {
          _id: '$_id',
          _pull: 1,
          date: 1,
          noTicket: 1,
          mts: 1,
        },
      },
    ],
    function (err, whiteTrips) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando reportes',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        viajesBlancos: whiteTrips,
      });
    }
  );
});

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
 * LISTAR REPORTES DE LINEAS ANULADOS POR PULL
 */

app.get('/anulados/:id', function (req, res) {
  const id = req.params.id;

  whiteTrip
    .find(
      {
        state: true,
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

app.delete('/:id', mdAuth.verificaToken, async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const km = req.query.km;

  whiteTrip
    .findByIdAndDelete(id)
    .then(function (tripBorrado) {
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
        .then(function (tripKm) {})
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
        viajeB: tripBorrado,
      });
    })
    .catch(function (err) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al borrar reporte lineas',
        errors: err,
      });
    });
});

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
