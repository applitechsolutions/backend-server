var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var storageSchema = new Schema({

    _material: { type: Schema.Types.ObjectId, ref: 'Material', required: [true, 'El material es requerido'] },
    _cellar: { type: Schema.Types.ObjectId, ref: 'Cellar', required: [true, 'La bodega es necesaria'] },
    stock: { type: Schema.Types.Decimal128, required: [true, 'La cantidad es necesaria'] }

});

module.exports = mongoose.model('Storage', storageSchema);