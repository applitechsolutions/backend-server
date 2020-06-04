var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orderSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'La fecha es necesaria']
    },
    order: {
        type: String,
        required: [true, 'El número de orden es necesario']
    },
    _destination: {
        type: Schema.Types.ObjectId,
        ref: 'Destination',
        required: [true, 'El destino es necesario']
    },
    state: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);