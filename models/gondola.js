var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var gondolaSchema = new Schema({
    plate: { type: String, required: [true, 'La placa es necesaria'] },
    _truck: { type: Schema.Types.ObjectId, ref: 'Vehicle' }
});

module.exports = mongoose.model('Gondola', gondolaSchema);