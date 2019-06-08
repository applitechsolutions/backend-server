var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var materialSchema = new Schema({

    code: { type: String, required: false },
    name: { type: String, required: [true, 'El nombre es necesario'] },
    minStock: { type: Schema.Types.Decimal128, required: [true, 'La existencia minima es necesaria'] },
    cellar: [{
        _cellar: { type: Schema.Types.ObjectId, ref: 'MaterialCellar', required: [true, 'La bodega es necesaria'] },
    }]

});

module.exports = mongoose.model('Material', materialSchema);