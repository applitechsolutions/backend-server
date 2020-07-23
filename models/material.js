var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var materialSchema = new Schema({
  code: { type: String, required: false },
  name: { type: String, required: [true, 'El nombre es necesario'] },
  minStock: {
    type: Float,
    required: [true, 'La existencia minima es necesaria'],
  },
  cost: { type: Float, required: false },
  price: { type: Float, required: false },
  isCD: { type: Boolean, default: false },
  state: { type: Boolean, default: false }
});

module.exports = mongoose.model('Material', materialSchema);
