var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var gasolineSchema = new Schema({

    _vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    code: { type: String, required: false },
    date: { type: Date, required: true },
    gallons: { type: Number, required: true },
    total: { type: Float, required: true }
});

module.exports = mongoose.model('Gasoline', gasolineSchema);