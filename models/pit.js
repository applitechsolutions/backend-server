var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);
var DateOnly = require('mongoose-dateonly')(mongoose);

var Schema = mongoose.Schema;

var pitSchema = new Schema({

    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    gondola: { type: Schema.Types.ObjectId, ref: 'Gondola' },
    rim: { type: Schema.Types.ObjectId, ref: 'Rim', required: false },
    km: { type: Float, default: 0.00 },
    counter: { type: Float, default: 0.00 },
    axis: { type: String, require: false },
    place: { type: String, require: false },
    side: { type: String, require: false },
    date: { type: Date, require: false },
    total: { type: Float }

});

module.exports = mongoose.model('Pit', pitSchema);