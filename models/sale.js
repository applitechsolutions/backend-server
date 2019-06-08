var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var saleSchema = new Schema({
    _customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: [true, 'El cliente es necesario'] },
    date: { type: Date, required: [true, 'La fecha es necesaria'] },
    serie: { type: String, required: [true, 'La serie de la factura es necesaria'] },
    bill: { type: String, unique: true, required: [true, 'El número de factura es necesario'] },
    details: [{
        _material: { type: Schema.Types.ObjectId, ref: 'Material', required: [true, 'El material es necesario'] },
        total: { type: Schema.Types.Decimal128, requerido: [true, 'La cantidad es necesaria'] },
        price: { type: Schema.Types.Decimal128, requerido: [true, 'El precio es necesario'] }
    }],
    total: { type: Schema.Types.Decimal128, required: true },
    state: { type: Boolean, required: true, default: false }
});

saleSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Sale', saleSchema);