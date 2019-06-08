var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var destinationSchema = new Schema({

    name: { type: String, required: [true, 'El nombre es necesario'] },
    km: { type: Schema.Types.Decimal128, required: [true, 'Los kilometros son necesario'] }

});

module.exports = mongoose.model('Destination', destinationSchema);