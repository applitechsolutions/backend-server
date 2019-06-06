var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var makeSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] }
});

module.exports = mongoose.model('Make', makeSchema);