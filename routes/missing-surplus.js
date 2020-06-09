const express = require('express');
const mdAuth = require('../middlewares/auth');
const app = express();

const MissingSurplus = require('../models/missing-surplus');

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
    .populate('_material', 'code name price')
    .populate('_materialCellar', 'name storage')
    .exec((err, missings) => {
      if (err) {
        res.status(500).json({
          ok: false,
          mensjae: 'Error listando los faltantes',
          errors: err.message,
        });
      }

      res.status(200).json({
        ok: true,
        faltantes: missings,
      });
    });
});

/**
 * CREAR FALTANTE O SOBRANTE
 */

app.post('/', mdAuth.verificaToken, async (req, res) => {
  const body = req.body;
  let name;

  if (body.type) {
    name = 'Faltante';
  } else {
    name = 'Sobrante';
  }

  missingSurplus = new MissingSurplus({
    type: body.type,
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
        mensjae: `${name} creado correctamente`,
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
