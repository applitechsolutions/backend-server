var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var tankTripsSchema = new Schema({
    _employee: { type: Schema.Types.ObjectId, ref: 'Employee' },
    _vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    _destino: { type: Schema.Types.ObjectId, ref: 'DestTank' },
    date: { type: Date, required: true },
    checkIN: { type: Date, required: true },
    checkOUT: { type: Date, required: true },
    trips: { type: Float, required: false },
    tariff: { type: Float, required: false },
    state: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('TanknTrips', tankTripsSchema);