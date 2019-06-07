var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var maintenanceSchema = new Schema({
    _vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    _gondola: { type: Schema.Types.ObjectId, ref: 'Gondola' },
    _mech: { type: Schema.Types.ObjectId, ref: 'Mech' },
    datestart: { type: Date, required: true },
    dateEnd: { type: Date, required: true },
    noBill: { type: String },
    serie: { type: String },
    noDoc: { type: String },
    details: [{
        _part: { type: Schema.Types.ObjectId, ref: 'AutoPart' },
        quantity: { type: Number },
        cost: { type: Schema.Types.Decimal128 }
    }],
    total: { type: Schema.Types.Decimal128, required: true },
    state: { type: Boolean, default: false }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);