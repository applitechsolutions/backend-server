var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var vehiclesValidos = {
    values: ['camion', 'camionG', 'vehiculo', 'riego', 'stock']
};

var vehicleSchema = new Schema({

    cp: { type: String, unique: true, required: [true, 'El código es necesario'] },
    type: { type: String, required: true, default: 'Camión', enum: vehiclesValidos },
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
    }]
});

vehicleSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Vehicle', vehicleSchema);