var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Float = require('mongoose-float').loadType(mongoose, 6);

var Schema = mongoose.Schema;

var pullSchema = new Schema({
    _order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        require: [true, 'La orden es necesaria']
    },
    _material: {
        type: Schema.Types.ObjectId,
        ref: 'Material',
        require: [true, 'El material es necesario']
    },
    mts: {
        type: Float,
        require: [true, 'Los MTS son necesarios']
    },
    totalMts: {
        type: Float,
        require: [true, 'Los MTS son necesarios']
    },
    kg: {
        type: Float,
        require: [true, 'Los KG son necesarios']
    },
    totalKg: {
        type: Float,
        require: [true, 'Los KG son necesarios']
    },
    state: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Pull', pullSchema);