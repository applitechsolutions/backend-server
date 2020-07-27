var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var cashSchema = new Schema(
  {
    _cashTypeCD: {
      type: Schema.Types.ObjectId,
      ref: 'CashTypeCD',
    },
    _user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    _materialCellar: {
      type: Schema.Types.ObjectId,
      ref: 'MaterialCellar',
    },
    date: {
      type: Date,
      required: [true, 'La fecha es necesaria'],
    },
    details: {
      type: String,
      required: false,
    },
    amount: {
      type: Float,
      required: [true, 'El monto es necesario'],
    },
    balance: {
      type: Float,
      required: [true, 'El monto es necesario'],
    },
    state: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CashCD', cashSchema);
