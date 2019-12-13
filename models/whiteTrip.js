var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Float = require('mongoose-float').loadType(mongoose, 6);

var Schema = mongoose.Schema;

var whiteTripSchema = new Schema({
    _employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'El empleado es necesario']
    },
    _vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'El vehiculo es necesario']
    },
    _pull: {
        type: Schema.Types.ObjectId,
        ref: 'Pull',
        required: [true, 'El pull es necesario']
    },
    date: {
        type: Date,
        required: [true, 'La fecha es necesaria']
    },
    noTicket: {
        type: String,
        unique: true,
        required: [true, 'El número de documento es necesario']
    },
    noDelivery: {
        type: String,
        required: false
    },
    mts: {
        type: Float,
        required: [true, 'Los metros son necesarios']
    },
    kgB: {
        type: Float,
        required: [true, 'Los kilogramos brutos son necesarios']
    },
    kgT: {
        type: Float,
        required: [true, 'Los kilogramos tara son necesarios']
    },
    kgN: {
        type: Float,
        required: [true, 'Los kilogramos netos son necesarios']
    },
    checkIN: {
        type: Date,
        required: true
    },
    checkOUT: {
        type: Date,
        required: true
    },
    tariff: {
        type: Float,
        required: [true, 'La tarifa es necesaria']
    },
    invoiced: {
        type: Boolean,
        default: false
    },
    state: {
        type: Boolean,
        default: false
    }
});

whiteTripSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser unico'
});

module.exports = mongoose.model('WhiteTrip', whiteTripSchema);