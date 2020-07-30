var express = require('express');
var mongoose = require('mongoose');
var mdAuth = require('../middlewares/auth');

var app = express();

var CashCD = require('../models/cashCD');
var Sale = require('../models/sale');

/* #region  GET Saldo Actual */
app.get('/lastBalance', function (req, res) {
  var startDate = new Date(req.query.fecha1);
  var endDate = new Date(req.query.fecha2);

  CashCD.findOne(
    {},
    {},
    {
      sort: {
        createdAt: -1,
      },
    },
    function (err, cash) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando saldo',
          errors: err,
        });
      }

      Sale.find(
        {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          state: false,
        },
        'flete total'
      ).exec(function (err, sales) {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error obteniendo ventas',
            errors: err,
          });
        }

        res.status(200).json({
          ok: true,
          saldo: cash,
          ventas: sales,
        });
      });
    }
  );
});
/* #endregion */

/* #region  GET movimientos de caja */

app.get('/', function (req, res) {
  var startDate = new Date(req.query.fecha1);
  var endDate = new Date(req.query.fecha2);

  CashCD.find(
    {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      state: false,
    },
    ''
  )
    .populate('_cashTypeCD', '')
    .populate('_user', 'name')
    .sort({
      createdAt: -1,
    })
    .exec(function (err, cashs) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando movimientos',
          errors: err,
        });
      }

      Sale.find(
        {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          state: false,
        },
        'flete total'
      ).exec(function (err, sales) {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error obteniendo ventas',
            errors: err,
          });
        }

        res.status(200).json({
          ok: true,
          movimientos: cashs,
          ventas: sales,
        });
      });
    });
});

/* #region  GET movimiento de caja */
app.get('/:id', function (req, res) {
  var id = req.params.id;

  CashCD.findById(id, '').exec(function (err, cash) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar movimiento de caja',
        errors: err,
      });
    }

    if (!cash) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El movimiento de caja con el id' + id + ' no existe',
        errors: {
          message: 'No existe un movimiento de caja con ese ID',
        },
      });
    }

    res.status(200).json({
      ok: true,
      movimiento: cash,
    });
  });
});
/* #endregion */

/* #region  PUT movimiento de caja */
app.put('/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  CashCD.findById(id, function (err, cash) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar movimiento de caja',
        errors: err,
      });
    }

    if (!cash) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El movimiento de caja con el id' + id + ' no existe',
        errors: {
          message: 'No existe un movimiento de caja con ese ID',
        },
      });
    }

    cash._cashType = body._cashType;
    cash._user = body._user;
    cash._cellar = body._cellar;
    cash.date = body.date;
    cash.details = body.details;
    cash.amount = body.amount;

    cash.save(function (err, cashSave) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar movimiento de caja',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        movimiento: cashSave,
      });
    });
  });
});
/* #endregion */

/* #region  DELETE movimiento de caja */
app.put('/delete/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;

  CashCD.findById(id, function (err, cash) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar movimiento de caja',
        errors: err,
      });
    }

    if (!cash) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El movimiento de caja con el id' + id + ' no existe',
        errors: {
          message: 'No existe un movimiento de caja con ese ID',
        },
      });
    }

    cash.state = true;

    cash.save(function (err, deletedCash) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al borrar movimiento de caja',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        movimiento: deletedCash,
      });
    });
  });
});
/* #endregion */

/* #region  POST movimiento de caja */
app.post('/', mdAuth.verificaToken, function (req, res) {
  var body = req.body;
  var idCellarMaterial = mongoose.Types.ObjectId('5db1d858d2773e07f0965510'); // ID DEL CENTRO DE DISTRIBUCION DE LA VIÑA

  var cash = new CashCD({
    _cashTypeCD: body._cashTypeCD,
    _user: body._user,
    _cellar: idCellarMaterial,
    date: body.date,
    details: body.details,
    amount: body.amount,
    balance: body.balance,
  });

  cash
    .save()
    .then(function (cashG) {
      res.status(201).json({
        ok: true,
        movimiento: cashG,
        usuarioToken: req.usuario,
      });
    })
    .catch(function (Error) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al crear movimiento de caja',
        errors: Error,
      });
    });
});
/* #endregion */

module.exports = app;
