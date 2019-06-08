var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var whiteBillSchema = new Schema({
    _CPcustomer: { type: Schema.Types.ObjectId, ref: 'CPcustomer', required: [true, 'El cliente es necesario'] },
    bill: { type: String, unique: true, required: [true, 'El número de factura es necesario'] },
    serie: { type: String, required: [true, 'El número de serie es necesario'] },
    date: { type: Date, required: [true, 'La fecha es necesaria'] },
    oc: { type: String, unique: true },
    ac: { type: String, unique: true },
    pulls: [{
        _pull: { type: Schema.Types.ObjectId, ref: 'Pull', required: [true, 'El pull es necesario'] },
    }],
    total: { type: Schema.Types.Decimal128 },
    paid: { type: Boolean, default: false },
    state: { type: Boolean, default: false }
});

whiteBillSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('WhiteBill', whiteBillSchema);