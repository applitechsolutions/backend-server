var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var rimSchema = new Schema({
    code: { type: String, required: false },
    desc: { type: String, required: false },
    state: { type: Boolean, required: false, default: false }
});

module.exports = mongoose.model('Rim', rimSchema);