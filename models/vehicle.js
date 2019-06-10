var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var vehiclesValidos = {
    values: ['camion', 'camionG', 'vehiculo', 'riego', 'stock']
};

var vehicleSchema = new Schema({

    cp: { type: String, unique: true, required: [true, 'El código es necesario'] },
    type: { type: String, required: true, default: 'camion', enum: vehiclesValidos },
    _gondola: { type: Schema.Types.ObjectId, ref: 'Gondola' },
    _make: { type: Schema.Types.ObjectId, ref: 'Make', required: [true, 'La marca es necesaria'] },
    plate: { type: String, unique: true, required: [true, 'La placa es necesaria'] },
    no: { type: Number },
    model: { type: Number },
    km: { type: Schema.Types.Decimal128, default: 0 },
    mts: { type: Schema.Types.Decimal128, default: 0 },
    basics: [{
        code: String,
        name: String,
        description: String
    }],
    pits: [{
        rim: { type: Schema.Types.ObjectId, ref: 'Rim', required: false },
        kmr: { type: Schema.Types.Decimal128 },
        counter: { type: Schema.Types.Decimal128 },
        axis: { type: String, require: false },
        place: { type: String, require: false },
        side: { type: String, require: false },
        date: { type: Date, require: false },
        total: { type: Schema.Types.Decimal128 }
    }]
});

vehicleSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Vehicle', vehicleSchema);