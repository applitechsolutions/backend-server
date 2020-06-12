var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var purchaseCD = new Schema({
  date: { type: Date, required: true },
  noBill: { type: String },
  serie: { type: String },
  _order: { type: Schema.Types.ObjectId, ref: 'Order' },
  sap: { type: String },
  details: [
    {
      _whiteTrip: { type: Schema.Types.ObjectId, ref: 'WhiteTrip' },
      cost: { type: Float },
    },
  ],
  total: { type: Float },
  payment: { type: Boolean, default: false }, // false = CONTADO | true = CREDITO
  paid: { type: Boolean, default: false },
  state: { type: Boolean, default: false },
});

module.exports = mongoose.model('PurchaseCD', purchaseCD);
