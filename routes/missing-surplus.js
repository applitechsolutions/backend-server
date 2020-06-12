const express = require('express');
const mdAuth = require('../middlewares/auth');
const app = express();

const MissingSurplus = require('../models/missing-surplus');
const MaterialCellar = require('../models/materialCellar');

/**
 * LISTAR FALTANTES O SOBRANTES
 */

app.get('/', (req, res) => {
  const type = req.query.type;

  MissingSurplus.find(
    {
      type,
    },
    'type load _user _material description _materialCellar state createdAt'
  )
    .populate('_user', 'name role')
    .populate('_material', 'code name minStock price')
    .populate('_materialCellar', 'name storage')
    .limit(50)
    .sort({ createdAt: -1 })
    .exec((err, stocks) => {
      if (err) {
        res.status(500).json({
          ok: false,
          mensjae: 'Error listando los faltantes',
          errors: err.message,
        });
      }

      res.status(200).json({
        ok: true,
        excesos: stocks,
      });
    });
});

/**
 * CONFIRMAR FALTANTE O SOBRANTE
 */

app.patch('/confirmar', mdAuth.verificaToken, async (req, res) => {
  const body = req.body;
  let name;
  let cantidad;

  if (body.type) {
    name = 'Faltante';
    cantidad = body.load * -1;
  } else {
    name = 'Sobrante';
    cantidad = body.load;
  }

  try {
    const respuesta = await MissingSurplus.findByIdAndUpdate(body._id, {
      $set: { state: 'confirmado' },
    });

    if (respuesta) {
      MaterialCellar.findOneAndUpdate(
        { 'storage._material': respuesta._material },
        { $inc: { 'storage.$.stock': cantidad } }
      )
        .then((doc) => {
          res.status(201).json({
            ok: true,
            mensaje: `${name} confirmado correctamente`,
            surpmiss: respuesta,
          });
        })
        .catch((error) => {
          throw new Error(error);
        });
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: `Error al confirmar ${name}`,
      errors: error.message,
    });
  }
});

/**
 * RECHAZAR FALTANTE O SOBRANTE
 */

app.patch('/rechazar', mdAuth.verificaToken, async (req, res) => {
  const body = req.body;
  const name = body.type ? 'Faltante' : 'Sobrante';

  try {
    const respuesta = await MissingSurplus.findByIdAndUpdate(body._id, {
      state: 'rechazado',
    });

    if (respuesta) {
      res.status(200).json({
        ok: true,
        mensaje: `${name} rechazado correctamente`,
        surpmiss: respuesta,
      });
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: `Error al rechazar ${name}`,
      errors: error.message,
    });
  }
});

/**
 * CREAR FALTANTE O SOBRANTE COMO ADMIN
 */

app.post('/admin', mdAuth.verificaToken, async (req, res) => {
  const body = req.body;
  let name;
  let cantidad;

  if (body.type) {
    name = 'Faltante';
    cantidad = body.load * -1;
  } else {
    name = 'Sobrante';
    cantidad = body.load;
  }

  missingSurplus = new MissingSurplus({
    type: body.type,
    load: body.load,
    _user: body._user,
    _material: body._material,
    description: body.description,
    _materialCellar: body._materialCellar,
    state: body.state,
  });

  try {
    const respuesta = await missingSurplus.save();

    if (respuesta) {
      MaterialCellar.findOneAndUpdate(
        { 'storage._material': respuesta._material },
        { $inc: { 'storage.$.stock': cantidad } }
      )
        .then((doc) => {
          res.status(201).json({
            ok: true,
            mensaje: `${name} creado correctamente`,
            surpmiss: respuesta,
          });
        })
        .catch((error) => {
          throw new Error(error);
        });
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: `Error al crear ${name}`,
      errors: error.message,
    });
  }
});

/**
 * CREAR FALTANTE O SOBRANTE SIN ADMIN
 */

app.post('/noadmin', mdAuth.verificaToken, async (req, res) => {
  const body = req.body;
  let name;

  if (body.type) {
    name = 'Faltante';
  } else {
    name = 'Sobrante';
  }

  missingSurplus = new MissingSurplus({
    type: body.type,
    load: body.load,
    _user: body._user,
    _material: body._material,
    description: body.description,
    _materialCellar: body._materialCellar,
    state: body.state,
  });

  try {
    const respuesta = await missingSurplus.save();

    if (respuesta) {
      res.status(201).json({
        ok: true,
        mensaje: `${name} creado correctamente`,
        surpmiss: respuesta,
      });
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: `Error al crear ${name}`,
      errors: error.message,
    });
  }
});

module.exports = app;
