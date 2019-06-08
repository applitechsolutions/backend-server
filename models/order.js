var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var orderSchema = new Schema({
    _destination: { type: Schema.Types.ObjectId, ref: 'Destination', required: [true, 'El destino es necesario'] },
    order: { type: String, unique: true, required: [true, 'El número de orden es necesario'] }
});

orderSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Order', orderSchema);