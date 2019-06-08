var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var materialCellarSchema = new Schema({

    name: { type: String, required: [true, 'El nombre es necesario'] },
    storage: [{
        _material: { type: Schema.Types.ObjectId, ref: 'Material' },
        stock: { type: Number, required: true }
    }],
    state: { type: Boolean, required: true, default: false }

});

module.exports = mongoose.model('MaterialCellar', materialCellarSchema);