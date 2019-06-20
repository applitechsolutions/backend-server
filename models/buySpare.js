var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var buySpareSchema = new Schema({
    _provider: { type: Schema.Types.ObjectId, ref: 'AutoProvider' },
    date: { type: Date, required: true },
    noBill: { type: String },
    serie: { type: String },
    noDoc: { type: String },
    details: [{
        _part: { type: Schema.Types.ObjectId, ref: 'AutoPart' },
        quantity: { type: Number },
        cost: { type: Schema.Types.Decimal128 }
    }],
    total: { type: Schema.Types.Decimal128 },
    state: { type: Boolean, default: false }
});

module.exports = mongoose.model('BuySpare', buySpareSchema);