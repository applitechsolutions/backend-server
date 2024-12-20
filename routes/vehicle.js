var mongoose = require('mongoose');
var express = require('express');
var mdAuth = require('../middlewares/auth');
// mongoose.set('useFindAndModify', false);

var app = express();

var Vehicle = require('../models/vehicle');
var GreenTrip = require('../models/greenTrip');
var WhiteTrip = require('../models/whiteTrip');
var TankTrip = require('../models/tankTrip');
var ObjectId = mongoose.Types.ObjectId;

/**
 * LISTAR VEHICULOS
 */

app.get('/', function (req, res) {
  Vehicle.find({ state: false }, 'cp type plate no model km mts basics pits')
    .populate('_make', 'name')
    .populate('_gondola', 'plate')
    .populate('pits.rim')
    .sort({ plate: 'asc' })
    .exec(function (err, vehicles) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando vehiculos',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        vehiculos: vehicles,
      });
    });
});

/**
 * LISTAR CUPONES DE GASOLINA DE TODOS LOS VEHICULOS
 */

app.get('/gasolines/all', function (req, res) {
  var startDate = new Date(req.query.fecha1);
  var endDate = new Date(req.query.fecha2);

  Vehicle.aggregate(
    [
      {
        $match: {
          'gasoline.date': {
            $gte: startDate,
            $lte: endDate,
          },
          'gasoline.state': false,
        },
      },
      {
        $unwind: '$gasoline',
      },
      {
        $match: {
          'gasoline.date': {
            $gte: startDate,
            $lte: endDate,
          },
          'gasoline.state': false,
        },
      },
      {
        $sort: {
          'gasoline.date': 1,
        },
      },
      {
        $project: {
          _id: '$gasoline._id',
          code: '$gasoline.code',
          date: '$gasoline.date',
          gallons: '$gasoline.gallons',
          total: '$gasoline.total',
          type: '$type',
          plate: '$plate',
          idVehicle: '$_id',
        },
      },
    ],
    function (err, gasolines) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando historial de cupones',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        gasoline: gasolines,
      });
    }
  );
});

/**
 * LISTAR CUPONES DE GASOLINA DE UN VEHICULO
 */

app.get('/gasolines', function (req, res) {
  console.log(req.query);

  var startDate = new Date(req.query.fecha1);
  var endDate = new Date(req.query.fecha2);
  var id = req.query.id;

  console.log(startDate);

  Vehicle.aggregate(
    [
      {
        $match: { _id: ObjectId(id) },
      },
      {
        $match: {
          'gasoline.date': {
            $gte: startDate,
            $lte: endDate,
          },
          'gasoline.state': false,
        },
      },
      {
        $unwind: '$gasoline',
      },
      {
        $match: {
          'gasoline.date': {
            $gte: startDate,
            $lte: endDate,
          },
          'gasoline.state': false,
        },
      },
      {
        $project: {
          _id: '$gasoline._id',
          code: '$gasoline.code',
          date: '$gasoline.date',
          gallons: '$gasoline.gallons',
          total: '$gasoline.total',
        },
      },
    ],
    function (err, gasolines) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando historial de cupones',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        gasoline: gasolines,
      });
    }
  );
});

/**
 * REPORTE DE VIAJES POR FECHA Y VEHICULO
 */

app.get('/kmByVehicle/:id', async function (req, res) {
  var startDate = new Date(req.query.fecha1);
  var endDate = new Date(req.query.fecha2);
  var id = req.params.id;

  try {
    const query1 = await GreenTrip.find(
      {
        _vehicle: ObjectId(id),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        state: false,
      },
      ''
    )
      .populate('_employee', 'name')
      .populate('_type', 'code name km')
      .populate('_material', 'code name')
      .sort({ date: 'asc' })
      .exec();

    const query2 = await WhiteTrip.aggregate([
      {
        $match: {
          _vehicle: ObjectId(id),
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
          date: 1,
        },
      },
    ]);

    Promise.all([query1, query2])
      .then(function (results) {
        res.status(200).json({
          ok: true,
          greenTrips: results[0],
          whiteTrips: results[1],
        });
      })
      .catch(function (err) {
        return err;
      });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error listando reporte',
      errors: error.message,
    });
  }
});

/**
 * REPORTE DE VIAJES POR KM EN DIFERENTES DESTINOS
 */

app.get('/kmByDestination', async function (req, res) {
  var startDate = new Date(req.query.fecha1);
  var endDate = new Date(req.query.fecha2);

  try {
    const query1 = await GreenTrip.aggregate([
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
        $project: {
          _id: 1,
          _type: 1,
          trips: 1,
          range: {
            $concat: [
              { $cond: [{$and:[ {$gt:["$_type.km", 0]}, {$lte: ["$_type.km", 2]}]}, "0 - 2 km", ""] }, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 2]}, {$lte:["$_type.km", 4]}]}, "2 - 4 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 4]}, {$lte:["$_type.km", 6]}]}, "4 - 6 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 6]}, {$lte:["$_type.km", 8]}]}, "6 - 8 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 8]}, {$lte:["$_type.km", 10]}]}, "8 - 10 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 10]}, {$lte:["$_type.km", 15]}]}, "10 - 15 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 15]}, {$lte:["$_type.km", 20]}]}, "15 - 20 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 20]}, {$lte:["$_type.km", 25]}]}, "20 - 25 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 25]}, {$lte:["$_type.km", 30]}]}, "25 - 30 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 30]}, {$lte:["$_type.km", 35]}]}, "30 - 35 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 35]}, {$lte:["$_type.km", 40]}]}, "35 - 40 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 40]}, {$lte:["$_type.km", 45]}]}, "40 - 45 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 45]}, {$lte:["$_type.km", 50]}]}, "45 - 50 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 50]}, {$lte:["$_type.km", 60]}]}, "50 - 60 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 60]}, {$lte:["$_type.km", 70]}]}, "60 - 70 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 70]}, {$lte:["$_type.km", 80]}]}, "70 - 80 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 80]}, {$lte:["$_type.km", 90]}]}, "80 - 90 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 90]}, {$lte:["$_type.km", 100]}]}, "90 - 100 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 100]}, {$lte:["$_type.km", 125]}]}, "100 - 125 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 125]}, {$lte:["$_type.km", 150]}]}, "125 - 150 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 150]}, {$lte:["$_type.km", 175]}]}, "150 - 175 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 175]}, {$lte:["$_type.km", 200]}]}, "175 - 200 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_type.km", 200]}]}, "+200 km", ""]}, //prettier-ignore
            ],
          },
        },
      },
      {
        $group: {
          _id: '$range',
          viajes: { $sum: '$trips' },
          total: {
            $sum: { $multiply: ['$trips', '$_type.km'] },
          },
          // cantidad: { $sum: 1 },
        },
      },
    ]);

    const query2 = await WhiteTrip.aggregate([
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
        $project: {
          _id: 1,
          _pull: 1,
          range: {
            $concat: [
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 0]}, {$lte: ["$_pull._order._destination.km", 2]}]}, "0 - 2 km", ""] }, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 2]}, {$lte:["$_pull._order._destination.km", 4]}]}, "2 - 4 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 4]}, {$lte:["$_pull._order._destination.km", 6]}]}, "4 - 6 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 6]}, {$lte:["$_pull._order._destination.km", 8]}]}, "6 - 8 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 8]}, {$lte:["$_pull._order._destination.km", 10]}]}, "8 - 10 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 10]}, {$lte:["$_pull._order._destination.km", 15]}]}, "10 - 15 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 15]}, {$lte:["$_pull._order._destination.km", 20]}]}, "15 - 20 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 20]}, {$lte:["$_pull._order._destination.km", 25]}]}, "20 - 25 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 25]}, {$lte:["$_pull._order._destination.km", 30]}]}, "25 - 30 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 30]}, {$lte:["$_pull._order._destination.km", 35]}]}, "30 - 35 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 35]}, {$lte:["$_pull._order._destination.km", 40]}]}, "35 - 40 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 40]}, {$lte:["$_pull._order._destination.km", 45]}]}, "40 - 45 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 45]}, {$lte:["$_pull._order._destination.km", 50]}]}, "45 - 50 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 50]}, {$lte:["$_pull._order._destination.km", 60]}]}, "50 - 60 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 60]}, {$lte:["$_pull._order._destination.km", 70]}]}, "60 - 70 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 70]}, {$lte:["$_pull._order._destination.km", 80]}]}, "70 - 80 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 80]}, {$lte:["$_pull._order._destination.km", 90]}]}, "80 - 90 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 90]}, {$lte:["$_pull._order._destination.km", 100]}]}, "90 - 100 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 100]}, {$lte:["$_pull._order._destination.km", 125]}]}, "100 - 125 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 125]}, {$lte:["$_pull._order._destination.km", 150]}]}, "125 - 150 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 150]}, {$lte:["$_pull._order._destination.km", 175]}]}, "150 - 175 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 175]}, {$lte:["$_pull._order._destination.km", 200]}]}, "175 - 200 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_pull._order._destination.km", 200]}]}, "+200 km", ""]}, //prettier-ignore
            ],
          },
        },
      },
      {
        $group: {
          _id: '$range',
          viajes: { $sum: 1 },
          total: { $sum: '$_pull._order._destination.km' },
        },
      },
    ]);

    const query3 = await TankTrip.aggregate([
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
          from: 'desttanks',
          localField: '_destination',
          foreignField: '_id',
          as: '_destination',
        },
      },
      {
        $unwind: '$_destination',
      },
      {
        $project: {
          _id: 1,
          _destination: 1,
          trips: 1,
          range: {
            $concat: [
              { $cond: [{$and:[ {$gt:["$_destination.km", 0]}, {$lte: ["$_destination.km", 2]}]}, "0 - 2 km", ""] }, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 2]}, {$lte:["$_destination.km", 4]}]}, "2 - 4 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 4]}, {$lte:["$_destination.km", 6]}]}, "4 - 6 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 6]}, {$lte:["$_destination.km", 8]}]}, "6 - 8 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 8]}, {$lte:["$_destination.km", 10]}]}, "8 - 10 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 10]}, {$lte:["$_destination.km", 15]}]}, "10 - 15 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 15]}, {$lte:["$_destination.km", 20]}]}, "15 - 20 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 20]}, {$lte:["$_destination.km", 25]}]}, "20 - 25 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 25]}, {$lte:["$_destination.km", 30]}]}, "25 - 30 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 30]}, {$lte:["$_destination.km", 35]}]}, "30 - 35 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 35]}, {$lte:["$_destination.km", 40]}]}, "35 - 40 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 40]}, {$lte:["$_destination.km", 45]}]}, "40 - 45 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 45]}, {$lte:["$_destination.km", 50]}]}, "45 - 50 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 50]}, {$lte:["$_destination.km", 60]}]}, "50 - 60 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 60]}, {$lte:["$_destination.km", 70]}]}, "60 - 70 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 70]}, {$lte:["$_destination.km", 80]}]}, "70 - 80 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 80]}, {$lte:["$_destination.km", 90]}]}, "80 - 90 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 90]}, {$lte:["$_destination.km", 100]}]}, "90 - 100 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 100]}, {$lte:["$_destination.km", 125]}]}, "100 - 125 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 125]}, {$lte:["$_destination.km", 150]}]}, "125 - 150 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 150]}, {$lte:["$_destination.km", 175]}]}, "150 - 175 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 175]}, {$lte:["$_destination.km", 200]}]}, "175 - 200 km", ""]}, //prettier-ignore
              { $cond: [{$and:[ {$gt:["$_destination.km", 200]}]}, "+200 km", ""]}, //prettier-ignore
            ],
          },
        },
      },
      {
        $group: {
          _id: '$range',
          viajes: { $sum: '$trips' },
          total: {
            $sum: { $multiply: ['$trips', '$_destination.km'] },
          },
        },
      },
    ]);

    Promise.all([query1, query2, query3])
      .then(function (results) {
        res.status(200).json({
          ok: true,
          greenTrips: results[0],
          whiteTrips: results[1],
          tankTrips: results[2],
        });
      })
      .catch(function (err) {
        return err;
      });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error listando reporte',
      errors: error.message,
    });
  }
});

/**
 * BUSCAR VEHICULO
 */

app.get('/:id', function (req, res) {
  var id = req.params.id;

  Vehicle.findById(id, 'cp type plate no model km mts')
    .populate('_make')
    .exec(function (err, vehiculo) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar vehículo',
          errors: err,
        });
      }

      if (!vehiculo) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El vehículo con el id' + id + ' no existe',
          errors: { message: 'No existe un vehículo con ese ID' },
        });
      }

      res.status(200).json({
        ok: true,
        vehiculo: vehiculo,
      });
    });
});

/**
 * ACTUALIZAR GASOLINE
 */

app.put('/gasoline/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  Vehicle.findOneAndUpdate(
    { _id: id, 'gasoline._id': body._id },
    {
      $set: {
        'gasoline.$.code': body.code,
        'gasoline.$.date': body.date,
        'gasoline.$.gallons': body.gallons,
        'gasoline.$.total': body.total,
      },
    },
    function (err, vehiculoAct) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar vehículo',
          errors: err,
        });
      }

      Vehicle.findById(vehiculoAct._id, { gasoline: 0 })
        .populate('pits.rim')
        .exec(function (err, vehiculoG) {
          res.status(200).json({
            ok: true,
            vehiculo: vehiculoG,
          });
        });
    }
  );
});

/**
 * ACTUALIZAR VEHICULOS
 */

app.put('/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  Vehicle.findById(id, function (err, vehiculo) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar vehiculo',
        errors: err,
      });
    }

    if (!vehiculo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El vehículo con el id' + id + ' no existe',
        errors: { message: 'No existe un vehículo con ese ID' },
      });
    }

    vehiculo.cp = body.cp;
    vehiculo.type = body.type;
    vehiculo._gondola = body._gondola;
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

    vehiculo.save(function (err, vehiculoAct) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar vehículo',
          errors: err,
        });
      }

      Vehicle.findById(vehiculoAct._id, { gasoline: 0 })
        .populate('pits.rim')
        .exec(function (err, vehiculoG) {
          res.status(200).json({
            ok: true,
            vehiculo: vehiculoG,
          });
        });
    });
  });
});

/**
 * BORRAR GASOLINE
 */

app.put('/gasoline/delete/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  Vehicle.findOneAndUpdate(
    { _id: id, 'gasoline._id': body._id },
    {
      $set: {
        'gasoline.$.state': true,
      },
    },
    function (err, vehiculoAct) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar vehículo',
          errors: err,
        });
      }
      Vehicle.findById(vehiculoAct._id, { gasoline: 0 })
        .populate('pits.rim')
        .exec(function (err, vehiculoG) {
          res.status(200).json({
            ok: true,
            vehiculo: vehiculoG,
          });
        });
    }
  );
});

/**
 * BORRAR VEHICULOS
 */

app.put('/delete/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;

  Vehicle.findById(id, function (err, vehiculo) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar vehículo',
        errors: err,
      });
    }

    if (!vehiculo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El vehículo con el id' + id + ' no existe',
        errors: { message: 'No existe un vehículo con ese ID' },
      });
    }

    vehiculo.state = true;

    vehiculo.save(function (err, vehiculoBorrado) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al borrar vehículo',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        vehiculo: vehiculoBorrado,
      });
    });
  });
});

/**
 * INSERTAR GASOLINE
 */

app.post('/gasoline/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  Vehicle.findById(id, function (err, vehiculo) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar vehículo',
        errors: err,
      });
    }

    if (!vehiculo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El vehículo con el id' + id + ' no existe',
        errors: { message: 'No existe un vehículo con ese ID' },
      });
    }

    var gasoline = {
      code: body.code,
      date: body.date,
      gallons: body.gallons,
      total: body.total,
    };

    vehiculo.gasoline.push(gasoline);

    vehiculo.save(function (err, vehiculoAct) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar vehículo',
          errors: err,
        });
      }

      Vehicle.findById(vehiculoAct._id, { gasoline: 0 })
        .populate('pits.rim')
        .exec(function (err, vehiculoG) {
          res.status(200).json({
            ok: true,
            vehiculo: vehiculoG,
          });
        });
    });
  });
});

/**
 * CREAR VEHICULOS
 */

app.post('/', mdAuth.verificaToken, function (req, res) {
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
    mts: body.mts,
    _gondola: body._gondola,
  });

  vehiculo.save(function (err, vehiculoGuardado) {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear vehiculo',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      vehiculo: vehiculoGuardado,
      usuarioToken: req.usuario,
    });
  });
});

module.exports = app;
