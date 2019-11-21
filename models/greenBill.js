var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var greenBillSchema = new Schema({

    _customer: { type: Schema.Types.ObjectId, ref: 'CPcustomer' },
    noBill: { type: String, required: true },
    serie: { type: String, required: true },
    date: { type: Date, required: true },
    oc: { type: String },
    ac: { type: String },
    details: [{
        _type: { type: Schema.Types.ObjectId, ref: 'TypeTrip' },
        mts: { type: Float },
        trips: { type: Number },
        cost: { type: Float }
    }],
    tariffopt: { type: Float },
    total: { type: Float },
    paid: { type: Boolean, default: false },
    state: { type: Boolean, default: false }

});

module.exports = mongoose.model('GreenBill', greenBillSchema);