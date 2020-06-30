var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Material = require('../models/material');
var MaterialCellar = require('../models/materialCellar');

/**
 * LISTAR MATERIALES POR STOCK
 */

app.get('/', function (req, res) {
  MaterialCellar.find({ state: false })
    .populate('storage._material', 'code name minStock price cost isCD')
    .sort({ _id: 'desc' })
    .exec(function (err, materials) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando materiales',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        materiales: materials,
      });
    });
});

/**
 * LISTAR MATERIALES CATALOGO
 */

app.get('/catalog', function (req, res) {
  Material.find()
    .sort({ name: 1 })
    .exec(function (err, materials) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error listando materiales',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        materiales: materials,
      });
    });
});

/**
 * BUSCAR MATERIAL
 */

app.get('/:id', function (req, res) {
  var id = req.params.id;

  Material.findById(id, function (err, material) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar material',
        errors: err,
      });
    }

    if (!material) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El material con el id' + id + ' no existe',
        errors: { message: 'No existe un material con ese ID' },
      });
    }

    res.status(200).json({
      ok: true,
      material: material,
    });
  });
});

/**
 * BORRAR MATERIAL
 */

app.put('/delete/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;
  var storage = [];

  Material.findById(id, function (err, material) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar material',
        errors: err,
      });
    }

    if (!material) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El material con el id' + id + ' no existe',
        errors: { message: 'No existe un material con ese ID' },
      });
    }

    material.state = true;

    material
      .save()
      .then(function (materialBorrado) {
        body.storage.forEach(function (bodega) {
          storage.push({
            _material: bodega._id,
            stock: bodega.stock,
            cost: bodega.cost,
          });
        });

        MaterialCellar.findById(body.id)
          .then(function (cellar) {
            cellar.storage = storage.slice(0);

            cellar
              .save()
              .then(function (cellarGuardado) {
                res.status(200).json({
                  ok: true,
                  repuesto: materialBorrado,
                });
              })
              .catch(function (err) {
                res.status(400).json({
                  ok: false,
                  mensaje: 'Error al Guardar storage',
                  errors: err,
                });
              });
          })
          .catch(function (err) {
            res.status(500).json({
              ok: false,
              mensaje: 'Error al buscar bodega',
              errors: err,
            });
          });
      })
      .catch(function (err) {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al borrar material',
            errors: err,
          });
        }
      });
  });
});

/**
 * ACTUALIZAR MATERIALES SUMAR STOCK
 */

app.put('/purchase/', mdAuth.verificaToken, function (req, res) {
  var body = req.body;

  MaterialCellar.findOne(
    { 'storage._material': body._material },
    { 'storage.$': 1 }
  ).exec(function (err, cellar) {
    if (err) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar material',
        errors: err,
      });
    }

    if (!cellar) {
      res.status(400).json({
        ok: false,
        mensaje: 'El cellar no existe',
        errors: { message: 'No existe un cellar con ese ID' },
      });
    }

    var newStock = cellar.storage[0].stock + body.quantity;

    MaterialCellar.updateOne(
      { 'storage._material': body._material },
      { 'storage.$.stock': newStock },
      function (err, storageAct) {
        if (err) {
          res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar existencia',
            errors: err,
          });
        }

        res.status(200).json({
          ok: true,
          mensaje: 'Storage actualizado',
          storage: storageAct,
        });
      }
    );
  });
});

/**
 * ACTUALIZAR MATERIALES RESTAR STOCK
 */

app.put('/sale/', mdAuth.verificaToken, function (req, res) {
  var body = req.body;

  MaterialCellar.findOne(
    { 'storage._material': body._material },
    { 'storage.$': 1 }
  ).exec(function (err, cellar) {
    if (err) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar material',
        errors: err,
      });
    }

    if (!cellar) {
      res.status(400).json({
        ok: false,
        mensaje: 'El cellar no existe',
        errors: { message: 'No existe un cellar con ese ID' },
      });
    }

    var newStock = cellar.storage[0].stock - body.quantity;

    MaterialCellar.updateOne(
      { 'storage._material': body._material },
      { 'storage.$.stock': newStock },
      function (err, storageAct) {
        if (err) {
          res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar existencia',
            errors: err,
          });
        }

        res.status(200).json({
          ok: true,
          mensaje: 'Storage actualizado',
          storage: storageAct,
        });
      }
    );
  });
});

/**
 * ACTUALIZAR MATERIALES
 */

app.put('/:id', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  Material.findById(id, function (err, material) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar material',
        errors: err,
      });
    }

    if (!material) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El material con el id' + id + ' no existe',
        errors: { message: 'No existe un material con ese ID' },
      });
    }

    material.code = body.code;
    material.name = body.name;
    material.minStock = body.minStock;
    material.cost = body.cost;
    material.price = body.price;
    material.isCD = body.isCD;
    material.state = false;

    material.save(function (err, materialACT) {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar material',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        material: materialACT,
      });
    });
  });
});

/**
 * INSERTAR MATERIALES
 */

app.post('/', mdAuth.verificaToken, function (req, res) {
  var id = req.params.id;
  var body = req.body;

  var material = new Material({
    code: body.code,
    name: body.name,
    minStock: body.minStock,
    cost: body.cost,
    price: body.price,
    isCD: body.isCD
  });

  material
    .save()
    .then(function (materialG) {
      MaterialCellar.findOne({ name: 'Centro de distribución' })
        .then(function (cellar) {
          var material = { _material: materialG._id, stock: 0, cost: 0.0 };
          cellar.storage.push(material);
          cellar
            .save()
            .then(function (cellarGuardado) {
              res.status(201).json({
                ok: true,
                material: materialG,
                usuarioToken: req.usuario,
              });
            })
            .catch(function (err) {
              res.status(400).json({
                ok: false,
                mensaje: 'Error al crear bodega',
                errors: err,
              });
            });
        })
        .catch(function (err) {
          res.status(400).json({
            ok: false,
            mensaje: 'La bodega con el id ' + id + ' no existe',
            errors: { message: 'No existe una bodega con ese ID' },
          });
        });
    })
    .catch(function (err) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al crear material',
        errors: err,
      });
    });
});

module.exports = app;
