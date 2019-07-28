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
    dateStart: { type: Date, required: true },
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
    totalV: { type: Float, required: true },
    totalG: { type: Float, required: true },
    detailsRev: { type: String, requiere: false },
    detailsRep: { type: String, requiere: false },
    state: { type: Number, default: 0 }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);