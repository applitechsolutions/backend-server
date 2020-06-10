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
    { type },
    'type _user _material description _materialCellar state createdAt'
  )
    .populate('_user', 'name role')
    .populate('_material', 'code name minStock price')
    .populate('_materialCellar', 'name storage')
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
 * CREAR FALTANTE O SOBRANTE
 */

app.post('/', mdAuth.verificaToken, async (req, res) => {
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
        { $inc: { 'storage.stock': cantidad } }
      )
        .then((doc) => {
          console.log('respuesta', doc);
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

module.exports = app;
