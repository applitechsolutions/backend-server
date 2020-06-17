var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var saleSchema = new Schema({
  _customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'El cliente es necesario'],
  },
  date: { type: Date, required: [true, 'La fecha es necesaria'] },
  serie: { type: String, unique: false },
  bill: { type: String, unique: false },
  details: [
    {
      material: {
        type: Schema.Types.ObjectId,
        ref: 'Material',
        required: [true, 'El material es necesario'],
      },
      total: { type: Float, required: [true, 'La cantidad es necesaria'] },
      price: { type: Float, required: [true, 'El precio es necesario'] },
    },
  ],
  flete: { type: Float },
  total: { type: Float, required: true },
  state: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model('Sale', saleSchema);
