var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var jobSchema = new Schema({
    name: { type: String, required: [true, 'El nombre del tipo es necesario'] }
});

module.exports = mongoose.model('Job', jobSchema);