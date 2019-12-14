var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var whiteBillSchema = new Schema({
    _CPcustomer: {
        type: Schema.Types.ObjectId,
        ref: 'CPcustomer',
        required: [true, 'El cliente es necesario']
    },
    bill: {
        type: String,
        unique: true,
        required: [true, 'El número de factura es necesario']
    },
    serie: {
        type: String,
        required: [true, 'El número de serie es necesario']
    },
    date: {
        type: Date,
        required: [true, 'La fecha es necesaria']
    },
    oc: {
        type: String,
        unique: true
    },
    ac: {
        type: String,
        unique: true
    },
    details: [{
        _material: {
            type: Schema.Types.ObjectId,
            ref: 'Material',
            required: [true, 'El material es necesario']
        },
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
            },
            mts: {
                type: Float
            },
            kgB: {
                type: Float
            },
            kgT: {
                type: Float
            },
            kgN: {
                type: Float
            }
        }],
        totalM: {
            type: Float,
            required: [true, 'El total del material es necesario']
        },
        totalQ: {
            type: Float,
            required: [true, 'El total es necesario']
        }
    }],
    total: {
        type: Float
    },
    paid: {
        type: Boolean,
        default: false
    },
    state: {
        type: Boolean,
        default: false
    }
});

whiteBillSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser unico'
});

module.exports = mongoose.model('WhiteBill', whiteBillSchema);