var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var customerSchema = new Schema({
    name: { type: String },
    nit: { type: String },
    address: { type: String },
    mobile: { type: String },
    state: { type: Boolean, default: false }
});

module.exports = mongoose.model('CPcustomer', customerSchema);