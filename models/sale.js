var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var saleSchema = new Schema({
  _customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'El cliente es necesario'],
  },
  date: { type: Date, required: [true, 'La fecha es necesaria'] },
  serie: { type: String },
  bill: { type: String, unique: true },
  details: [
    {
      material: {
        type: Schema.Types.ObjectId,
        ref: 'Material',
        required: [true, 'El material es necesario'],
      },
      total: { type: Float, requerido: [true, 'La cantidad es necesaria'] },
      price: { type: Float, requerido: [true, 'El precio es necesario'] },
    },
  ],
  total: { type: Float, required: true },
  state: { type: Boolean, required: true, default: false },
});

saleSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Sale', saleSchema);
