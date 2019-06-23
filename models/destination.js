var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var destinationSchema = new Schema({

    name: { type: String, required: [true, 'El nombre es necesario'] },
    km: { type: Float, required: [true, 'Los kilometros son necesario'] }

});

module.exports = mongoose.model('Destination', destinationSchema);