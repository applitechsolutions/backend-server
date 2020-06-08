const express = require('express');
const mongoose = require('mongoose');
const mdAuth = require('../middlewares/auth');
const app = express();

const Sale = require('../models/sale');
const MaterialCellar = require('../models/materialCellar');
var ObjectId = mongoose.Types.ObjectId;

// LISTAR VENTAS CON FACTURA POR FECHAS
app.get('/', (req, res) => {
  const startDate = req.query.fecha1;
  const endDate = req.query.fecha2;

  Sale.find(
    { state: false, date: { $gte: startDate, $lte: endDate } },
    '_customer date serie bill details flete total state'
  )
    .populate('_customer', 'name nit')
    .populate('details.material')
    .sort({ date: 'asc' })
    .exec((err, sales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando ventas',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        ventas: sales,
      });
    });
});

/**
 * ANULAR VENTA
 */

app.patch('/:id', mdAuth.verificaToken, async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  try {
    const ventaAnulada = await Sale.findByIdAndUpdate(id, { $set: { state: body.state } }, { new: true }, (err, res) => {
      if (err) {
        res.status(400).json({
          ok: false,
          mensaje: 'No existe una venta con ese id',
          errors: err
        });
      }
    });

    const promises = await body.details.map(async (item) => {
      await MaterialCellar.findOneAndUpdate(
        { 'storage._material': item.material },
        { $inc: { 'storage.$.stock': item.total } });
    });

    const storage = Promise.all(promises);

    if (ventaAnulada && storage) {
      res.status(200).json({
        ok: true,
        mensaje: 'Venta anulada correctamente',
        venta: ventaAnulada
      });
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al anular la venta',
      errors: error.message
    });
  }

});

// CREAR VENTA
app.post('/', mdAuth.verificaToken, async (req, res) => {
  const body = req.body;

  const sale = new Sale({
    _customer: body._customer,
    date: body.date,
    serie: body.serie,
    bill: body.bill,
    details: body.details,
    flete: body.flete,
    total: body.total,
  });

  try {
    const saleSaved = await sale.save();

    const promises = saleSaved.details.map(async (item) => {
      await MaterialCellar.findOneAndUpdate(
        { 'storage._material': item.material },
        { $inc: { 'storage.$.stock': -item.total } }
      )
        .then((res) => {
          console.log('respuesta', res);
        })
        .catch((error) => {
          throw new Error(error);
        });
    });

    await Promise.all(saleSaved, promises).catch(function (err) {
      // log that I have an error, return the entire array;
      console.log('A promise failed to resolve', err);
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Venta creada correctamente',
      venta: saleSaved,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al crear venta',
      errors: error,
    });
  }
});

module.exports = app;
