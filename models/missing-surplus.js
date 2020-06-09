const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const missingSurplus = new Schema(
  {
    type: { type: Boolean, required: [true, 'El tipo es necesario'] },
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
