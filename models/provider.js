var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var providerSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    credit: { type: Float, default: 0 }
});

module.exports = mongoose.model('Provider', providerSchema);