var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var autoProviderSchema = new Schema({
    name: { type: String },
    address: { type: String },
    mobile1: { type: String },
    mobile2: { type: String },
    email: { type: String },
    account1: { type: String },
    account2: { type: String },
    details: { type: String },
    state: { type: Boolean, default: false }
});

module.exports = mongoose.model('AutoProvider', autoProviderSchema);