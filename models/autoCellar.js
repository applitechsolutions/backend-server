var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var autoCellarSchema = new Schema({
    name: { type: String, required: true },
    storage: [{
        _autopart: { type: Schema.Types.ObjectId, ref: 'AutoPart' },
        stock: { type: Float, require: true }
    }],
    state: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('AutoCellar', autoCellarSchema);