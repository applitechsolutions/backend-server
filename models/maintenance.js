var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var maintenanceSchema = new Schema({
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    _vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    _gondola: {
        type: Schema.Types.ObjectId,
        ref: 'Gondola',
        default: null
    },
    _mech: [{
        type: Schema.Types.ObjectId,
        ref: 'Mech'
    }],
    dateStart: {
        type: Date,
        timezone: "-0600",
        required: true
    },
    _typeMaintenance: {
        type: Schema.Types.ObjectId,
        ref: 'TypeMaintenance'
    },
    dateEnd: {
        type: Date,
        timezone: "-0600",
        required: false
    },
    detailsV: [{
        _part: {
            type: Schema.Types.ObjectId,
            ref: 'AutoPart'
        },
        quantity: {
            type: Float
        },
        cost: {
            type: Float
        }
    }],
    detailsG: [{
        _part: {
            type: Schema.Types.ObjectId,
            ref: 'AutoPart'
        },
        quantity: {
            type: Float
        },
        cost: {
            type: Float
        }
    }],
    totalV: {
        type: Float,
        required: false
    },
    totalG: {
        type: Float,
        required: false
    },
    detailsRev: {
        type: String,
        requiere: false
    },
    detailsRep: {
        type: String,
        requiere: false
    },
    state: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);