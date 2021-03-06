var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var greenTripsSchema = new Schema({
  _employee: { type: Schema.Types.ObjectId, ref: 'Employee' },
  _type: { type: Schema.Types.ObjectId, ref: 'TypeTrip' },
  _vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  _material: { type: Schema.Types.ObjectId, ref: 'Material' },
  date: { type: Date, required: true },
  checkIN: { type: Date, required: true },
  checkOUT: { type: Date, required: true },
  trips: { type: Float, required: false },
  details: { type: String, requiere: false },
  invoiced: { type: Boolean, required: true, default: false },
  state: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model('GreenTrips', greenTripsSchema);
