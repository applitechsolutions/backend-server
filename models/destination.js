var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var tiposValidos = {
    values: ['MIXTO', 'CD', 'PUESTOS'],
    message: '{VALUE} no es un tipo permitido'
}

var destinationSchema = new Schema({

    name: { type: String, required: [true, 'El nombre es necesario'] },
    type: { type: String, required: true, default: 'PUESTO', enum: tiposValidos },
    km: { type: Float, required: [true, 'Los kilometros son necesarios'] },
    tariff: [{
        start: { type: Float, required: [true, 'Es necesario el campo'] },
        end: { type: Float, required: [true, 'Es necesario el campo'] },
        cost: { type: Float, required: [true, 'Es necesario el campo'] }
    }]

});

module.exports = mongoose.model('Destination', destinationSchema);