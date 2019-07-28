var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var typeMaintenanceSchema = new Schema({
    name: { type: String },
    state: { type: Boolean, default: false }
});

module.exports = mongoose.model('TypeMaintenance', typeMaintenanceSchema);