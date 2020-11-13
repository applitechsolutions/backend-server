var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var greenBillSchema = new Schema({
  _customer: { type: Schema.Types.ObjectId, ref: 'CPcustomer' },
  noBill: { type: String },
  serie: { type: String },
  date: { type: Date },
  oc: { type: String },
  ac: { type: String },
  details: [
    {
      date: { type: Date },
      _type: { type: Schema.Types.ObjectId, ref: 'TypeTrip' },
      details: [{
        _greenTrip: { type: Schema.Types.ObjectId, ref: 'GreenTrip' },
        mts: { type: Float },
        trips: { type: Number },
      }],
      mts: { type: Float },
      trips: { type: Number },
      cost: { type: Float },
    },
  ],
  total: { type: Float },
  paid: { type: Boolean, default: false },
  paidDoc: { type: String },
  state: { type: Boolean, default: false },
},{
  timestamps: true
});

module.exports = mongoose.model('GreenBill', greenBillSchema);
