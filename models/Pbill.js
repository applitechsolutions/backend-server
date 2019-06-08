var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var purchaseSchema = new Schema({
    _provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: [true, 'El proveedor es necesario'] },
    date: { type: Date, required: [true, 'La fecha es necesaria'] },
    order: { type: String, unique: true, required: [true, 'El número de orden es necesario'] },
    detailp: [{
        _material: { type: Schema.Types.ObjectId, ref: 'Material', required: [true, 'El material es necesario'] },
        total: { type: Schema.Types.Decimal128, requerido: [true, 'La cantidad es necesaria'] },
        price: { type: Schema.Types.Decimal128, requerido: [true, 'El precio es necesario'] }
    }],
    total: { type: Schema.Types.Decimal128, required: true },
    state: { type: Boolean, required: true, default: false }
});

purchaseSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Purchase', purchaseSchema);