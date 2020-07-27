var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var typesValidos = {
  values: ['INGRESO', 'EGRESO'],
  message: '{VALUE} no es un estado permitido',
};

var cashTypeSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre es necesario'],
  },
  type: {
    type: String,
    required: true,
    default: 'INGRESO',
    enum: typesValidos,
  },
  state: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('CashTypeCD', cashTypeSchema);
