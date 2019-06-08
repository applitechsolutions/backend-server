var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var pullSchema = new Schema({
    _order: { type: Schema.Types.ObjectId, ref: 'Order', require: [true, 'La orden es necesaria'] },
    _material: { type: Schema.Types.ObjectId, ref: 'Material', require: [true, 'El material es necesario'] },
    mts: { type: Schema.Types.Decimal128, require: [true, 'Los MTS son necesarios'] },
    kg: { type: Schema.Types.Decimal128, require: [true, 'Los KG son necesarios'] },
    _detail: [{
        _WhiteBill: { type: Schema.Types.ObjectId, ref: 'WhiteBill', require: [true, 'La factura es necesaria'] },
        mts: { type: Schema.Types.Decimal128, require: [true, 'Los metros son necesarios'] },
        kg: { type: Schema.Types.Decimal128, require: [true, 'Los kilogramos son necesarios'] },
        cost: { type: Schema.Types.Decimal128, require: [true, 'El costo es necesario'] }
    }]
});

module.exports = mongoose.model('Pull', pullSchema);