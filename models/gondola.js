var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var gondolaSchema = new Schema({
    plate: { type: String, required: [true, 'La placa es necesaria'] },
    _truck: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    basics: [{
        code: String,
        name: String,
        description: String
    }],
    pits: [{
        rim: { type: Schema.Types.ObjectId, ref: 'Rim', required: false },
        km: { type: Float, default: 0.00 },
        counter: { type: Float, default: 0.00 },
        axis: { type: String, require: false },
        place: { type: String, require: false },
        side: { type: String, require: false },
        date: { type: Date, require: false },
        total: { type: Float }
    }]
});

module.exports = mongoose.model('Gondola', gondolaSchema);