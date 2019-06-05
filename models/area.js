var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var areaSchema = new Schema({

    name: { type: String, required: [true, 'El nombre es necesario'] }

});

module.exports = mongoose.model('Area', areaSchema);