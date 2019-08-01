var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var maintenanceSchema = new Schema({
    _user: { type: Schema.Types.ObjectId, ref: 'User' },
    _vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    _gondola: { type: Schema.Types.ObjectId, ref: 'Gondola' },
    _mech: [
        { type: Schema.Types.ObjectId, ref: 'Mech' }
    ],
    dateStart: { type: Date, timezone: "-0600", required: true },
    _typeMaintenance: { type: Schema.Types.ObjectId, ref: 'TypeMaintenance' },
    dateEnd: { type: Date, required: false },
    detailsV: [{
        part: { type: Schema.Types.ObjectId, ref: 'AutoPart' },
        quantity: { type: Float },
        cost: { type: Float }
    }],
    detailsG: [{
        part: { type: Schema.Types.ObjectId, ref: 'AutoPart' },
        quantity: { type: Float },
        cost: { type: Float }
    }],
    totalV: { type: Float, required: false },
    totalG: { type: Float, required: false },
    detailsRev: { type: String, requiere: false },
    detailsRep: { type: String, requiere: false },
    state: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);