var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var providerSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    credit: { type: Schema.Types.Decimal128, default: 0 }
});

module.exports = mongoose.model('Provider', providerSchema);