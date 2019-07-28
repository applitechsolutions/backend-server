var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var vehiclesValidos = {
    values: ['camion', 'camionG', 'vehiculo', 'riego', 'stock']
};

var vehicleSchema = new Schema({

    cp: { type: String, unique: true, required: false },
    type: { type: String, required: true, default: 'camion', enum: vehiclesValidos },
    _gondola: { type: Schema.Types.ObjectId, ref: 'Gondola' },
    _make: { type: Schema.Types.ObjectId, ref: 'Make', required: [true, 'La marca es necesaria'] },
    plate: { type: String, unique: true, required: [true, 'La placa es necesaria'] },
    no: { type: Number },
    model: { type: Number },
    km: { type: Float, default: 0 },
    mts: { type: Float, default: 0 },
    basics: [{
        code: String,
        name: String,
        description: String
    }],
    pits: [{
        rim: { type: Schema.Types.ObjectId, ref: 'Rim', required: false },
        km: { type: Float, default: 0.00 },
        counter: { type: Float, default: 0.00 },
        axis: { type: String, require: false },
        place: { type: String, require: false },
        side: { type: String, require: false },
        date: { type: Date, require: false },
        total: { type: Float }
    }],
    gasoline: [{
        code: { type: String, required: false },
        date: { type: Date, require: false },
        gallons: { type: Number, required: true },
        total: { type: Float, required: true },
        state: { type: Boolean, required: true, default: false }
    }],
    state: { type: Boolean, required: true, default: false }
});


module.exports = mongoose.model('Vehicle', vehicleSchema);