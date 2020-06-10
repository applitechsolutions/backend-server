const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Float = require('mongoose-float').loadType(mongoose, 2);

const missingSurplus = new Schema(
  {
    type: { type: Boolean, required: [true, 'El tipo es necesario'] },
    load: {
      type: Float,
      required: [true, 'Es necesaria la cantidad que esta de mas'],
    },
    _user: { type: Schema.Types.ObjectId, ref: 'User' },
    _material: { type: Schema.Types.ObjectId, ref: 'Material' },
    description: {
      type: String,
      required: [true, 'Una descripcion es necesaria'],
    },
    _materialCellar: { type: Schema.Types.ObjectId, ref: 'MaterialCellar' },
    state: {
      type: String,
      required: [true, 'Es necesario el estado del sobrante o faltante'],
      default: 'pendiente',
      enum: ['pendiente', 'confirmado', 'rechazado'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MissingSurplus', missingSurplus);
