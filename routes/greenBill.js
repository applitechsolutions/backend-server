var express = require('express');
var mongoose = require('mongoose');
var mdAuth = require('../middlewares/auth');
var ObjectId = mongoose.Types.ObjectId;

var app = express();

var GreenBill = require('../models/greenBill');
var GreenTrip = require('../models/greenTrip');

/**
 * LISTAR FACTURAS VERDES PAGADAS POR FECHAS
 */

app.get('/', function (req, res) {
  var startDate = new Date(req.query.fecha1);
  var endDate = new Date(req.query.fecha2);

  GreenBill.find(
    {
      state: false,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    },
    ''
  )
    .populate('_customer', 'name nit address mobile')
    .populate('details._type', 'code name')
    .exec(function (err, bills) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al listar facturas',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        facturas: bills,
      });
    });
});

/**
 * LISTAR PRE-FACTURAS
 */

app.get('/prebills', function (req, res) {
  GreenBill.find(
    {
      state: false,
      paid: false,
      date: null,
    },
    ''
  )
    .populate('_customer', 'name')
    .populate('details._type', 'code name')
    .exec(function (err, bills) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al listar facturas',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        facturas: bills,
      });
    });
});

/**
 * LISTAR FACTURAS AL CREDITO
 */

app.get('/creditbills', function (req, res) {
  GreenBill.find(
    {
      state: false,
      paid: false,
      date: { $ne: null },
    },
    ''
  )
    .populate('_customer', 'name')
    .populate('details._type', 'code name')
    .exec(function (err, bills) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al listar facturas',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        facturas: bills,
      });
    });
});

/**
 * LISTAR DETALLE FACTURA VERDE POR FECHAS
 */

app.get('/detalles', function (req, res) {
  var id = req.query.id;
  var startDate = new Date(req.query.fecha1);
  var endDate = new Date(req.query.fecha2);

  GreenTrip.aggregate(
    [
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
        $match: {
          _type: ObjectId(id),
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          $or: [{ invoiced: false }, { invoiced: null }],
          state: false,
        },
      },
      {
        $sort: { date: -1, '_vehicle.plate': 1 },
      },
      {
        $lookup: {
          from: 'typetrips',
          localField: '_type',
          foreignField: '_id',
          as: '_type',
        },
      },
      {
        $unwind: '$_type',
      },
      {
        $group: {
          _id: '$date', // El valor por el cual se agrupa
          _type: {
            $first: '$_type._id',
          },
          code: {
            $first: '$_type.code',
          },
          prod: {
            $first: '$_type.name',
          },
          detalles: {
            $push: {
              _greenTrip: '$_id',
              vehicle: '$_vehicle.plate',
              mts: '$_vehicle.mts',
              totalmts: {
                $sum: {
                  $multiply: ['$_vehicle.mts', '$trips'],
                },
              },
              trips: '$trips',
            },
          },
          totalTrips: {
            $sum: '$trips',
          },
          totalmts: {
            $sum: {
              $multiply: ['$_vehicle.mts', '$trips'],
            },
          },
          tariff: {
            $first: '$_type.tariff',
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ],
    function (err, reports) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando reportes verdes',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        preDetail: reports,
      });
    }
  );
});

/**
 * ELIMINAR FACTURA REPORTE CUADROS
 */

app.put('/delete', mdAuth.verificaToken, function (req, res) {
  var id = req.query.id;
  var body = req.body;

  GreenBill.findByIdAndUpdate(
    id,
    {
      state: body.state,
    },
    {
      new: true,
    }
  )
    .then(function (billBorrada) {
      var promises = billBorrada.details.map(function(e) {
        // console.log(e);

        e.details.forEach(detail => {
          GreenTrip.updateOne(
            {
              _id: detail._greenTrip
            },
            {
              invoiced: false,
            },
            function(err, storageAct) {
              if (err) {
                res.status(400).json({
                  ok: false,
                  mensaje: 'Error al actualizar reporte',
                  errors: err
                });
              }
            }
          );
        });
      });

      Promise.all(promises)
        .then(function(results) {
          res.status(200).json({
            ok: true,
            bill: billBorrada,
          });
        })
        .catch(function(error) {
          res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar reporte',
            errors: error
          });
        });
    })
    .catch(function (err) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error borrando facturas',
        errors: err,
      });
    });
});

/**
 * ACTUALIZAR FACTURA REPORTE CUADROS
 */

app.put('/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  GreenBill.findByIdAndUpdate(
    id,
    {
      noBill: body.noBill,
      serie: body.serie,
      date: body.date,
      oc: body.oc,
      ac: body.ac,
      paid: body.paid,
      paidDoc: body.paidDoc
    },
    {
      new: true,
    }
  )
    .then(function (billActualizada) {
      res.status(200).json({
        ok: true,
        bill: billActualizada,
      });
    })
    .catch(function (err) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error actualizando facturas',
        errors: err,
      });
    });
});

/**
 * CREAR FACTURA REPORTE CUADROS
 */

app.post('/', mdAuth.verificaToken, function (req, res) {
  var body = req.body;
  var greenbill = new GreenBill({
    _customer: body._customer,
    noBill: body.noBill,
    serie: body.serie,
    date: body.date,
    oc: body.oc,
    ac: body.ac,
    details: body.details,
    total: body.total,
    paid: body.paid,
    paidDoc: body.paidDoc,
    state: body.state,
  });

  greenbill
    .save()
    .then(function (gbGuardado) {
      var promises = gbGuardado.details.map(function(e) {
        // console.log(e);

        e.details.forEach(detail => {
          GreenTrip.updateOne(
            {
              _id: detail._greenTrip
            },
            {
              invoiced: true,
            },
            function(err, storageAct) {
              if (err) {
                res.status(400).json({
                  ok: false,
                  mensaje: 'Error al actualizar reporte',
                  errors: err
                });
              }
            }
          );
        });
      });

      Promise.all(promises)
        .then(function(results) {
          res.status(201).json({
            ok: true,
            facturaV: gbGuardado,
            usuarioToken: req.usuario,
          });
        })
        .catch(function(error) {
          res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar reporte',
            errors: error
          });
        });
    })
    .catch(function (err) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al crear factura reporte cuadros',
        errors: err,
      });
    });
});

module.exports = app;
