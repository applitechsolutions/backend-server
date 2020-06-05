var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var materialCellarSchema = new Schema({
  name: { type: String, required: [true, 'El nombre es necesario'] },
  storage: [
    {
      _material: { type: Schema.Types.ObjectId, ref: 'Material' },
      stock: { type: Number, required: true },
      cost: { type: Float, require: false },
    },
  ],
  state: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model('MaterialCellar', materialCellarSchema);
