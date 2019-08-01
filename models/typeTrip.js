var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var typeTripSchema = new Schema({

    name: { type: String, required: [true, 'El nombre es necesario'] },
    km: { type: Float, required: [true, 'El kilometraje es necesario'] }

});

module.exports = mongoose.model('TypeTrip', typeTripSchema);