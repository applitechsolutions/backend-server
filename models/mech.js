var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var mechSchema = new Schema({
    code: { type: String },
    name: { type: String, required: true },
    state: { type: Boolean, default: false }
});

module.exports = mongoose.model('Mech', mechSchema);