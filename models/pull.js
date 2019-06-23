var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var pullSchema = new Schema({
    _order: { type: Schema.Types.ObjectId, ref: 'Order', require: [true, 'La orden es necesaria'] },
    _material: { type: Schema.Types.ObjectId, ref: 'Material', require: [true, 'El material es necesario'] },
    mts: { type: Float, require: [true, 'Los MTS son necesarios'] },
    kg: { type: Float, require: [true, 'Los KG son necesarios'] },
    _detail: [{
        _WhiteBill: { type: Schema.Types.ObjectId, ref: 'WhiteBill', require: [true, 'La factura es necesaria'] },
        mts: { type: Float, require: [true, 'Los metros son necesarios'] },
        kg: { type: Float, require: [true, 'Los kilogramos son necesarios'] },
        cost: { type: Float, require: [true, 'El costo es necesario'] }
    }]
});

module.exports = mongoose.model('Pull', pullSchema);