var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var estatus = {
    values: ['PRE', 'NOPAID', 'PAID'],
    message: '{VALUE} no es un estatus permitido'
};

var tankBillSchema = new Schema({

    _customer: { type: Schema.Types.ObjectId, ref: 'CPcustomer' },
    noBill: { type: String, required: true },
    serie: { type: String, required: true },
    date: { type: Date, required: true },
    oc: { type: String },
    ac: { type: String },
    details: [{
        _destination: { type: Schema.Types.ObjectId, ref: 'DestTank' },
        mts: { type: Float },
        noTrips: { type: Number },
        details: [{
            date: {
                type: Date,
                required: [true, 'La fecha es necesaria']
            },
            noTicket: {
                type: String
            },
            noDelivery: {
                type: String
            },
            employee: {
                type: String
            },
            destination: {
                type: String
            },
            km: {
                type: Float
            }
        }],
    }],
    total: { type: Float },
    status: { type: String, required: true, default: 'PRE', enum: estatus },
    state: { type: Boolean, default: false }

});

module.exports = mongoose.model('TankBill', tankBillSchema);