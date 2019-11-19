var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var typeTripSchema = new Schema({

    code: { type: String, required: [true, 'El código es necesario'] },
    name: { type: String, required: [true, 'El nombre es necesario'] },
    km: { type: Float, required: [true, 'El kilometraje es necesario'] },
    tariff: [{
        start: { type: Number, required: [true, 'Es necesario el campo'] },
        end: { type: Number, required: [true, 'Es necesario el campo'] },
        cost: { type: Float, required: [true, 'Es necesario el campo'] }
    }]

});

module.exports = mongoose.model('TypeTrip', typeTripSchema);