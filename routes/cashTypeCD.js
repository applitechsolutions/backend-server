var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var CashTypeCD = require('../models/cashTypeCD');

/* #region  GET movimientos */
app.get('/', function (req, res) {
  CashTypeCD.find(
    {
      state: false,
    },
    ''
  )
    .sort({
      name: 'asc',
    })
    .exec(function (err, cashTypesCD) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando movimientos',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        movimientos: cashTypesCD,
      });
    });
});
/* #endregion */

/* #region  GET movimiento */
app.get('/:id', function (req, res) {
  var id = req.params.id;

  CashTypeCD.findById(id, '').exec(function (err, cashTypeCD) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar movimiento',
        errors: err,
      });
    }

    if (!cashTypeCD) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El movimiento con el id' + id + ' no existe',
        errors: {
          message: 'No existe un movimiento con ese ID',
        },
      });
    }

    res.status(200).json({
      ok: true,
      movimiento: cashTypeCD,
    });
  });
});
/* #endregion */

/* #region  PUT movimiento */
app.put('/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  CashTypeCD.findById(id, function (err, cashTypeCD) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar movimiento',
        errors: err,
      });
    }

    if (!cashTypeCD) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El movimiento con el id' + id + ' no existe',
        errors: {
          message: 'No existe un movimiento con ese ID',
        },
      });
    }

    cashTypeCD.name = body.name;
    cashTypeCD.type = body.type;

    cashTypeCD.save(function (err, cashTypeSave) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar movimiento',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        movimiento: cashTypeSave,
      });
    });
  });
});
/* #endregion */

/* #region  DELETE movimiento */
app.put('/delete/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;

  CashTypeCD.findById(id, function (err, cashTypeCD) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar movimiento',
        errors: err,
      });
    }

    if (!cashTypeCD) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El movimiento con el id' + id + ' no existe',
        errors: {
          message: 'No existe un movimiento con ese ID',
        },
      });
    }

    cashTypeCD.state = true;

    cashTypeCD.save(function (err, deletedCashType) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al borrar movimiento',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        movimiento: deletedCashType,
      });
    });
  });
});
/* #endregion */

/* #region  POST movimiento */
app.post('/', mdAuth.verificaToken, function (req, res) {
  var body = req.body;

  var cashType = new CashTypeCD({
    name: body.name,
    type: body.type,
  });

  cashType
    .save()
    .then(function (cashType) {
      res.status(201).json({
        ok: true,
        movimiento: cashType,
        usuarioToken: req.usuario,
      });
    })
    .catch(function (Error) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al crear movimiento',
        errors: Error,
      });
    });
});
/* #endregion */

module.exports = app;
