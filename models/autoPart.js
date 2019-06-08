var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var autoPartSchema = new Schema({
    code: { type: String, required: false },
    desc: { type: String, required: false },
    minStock: { type: Number, required: true },
    cellar: [{
        _autoCellar: { type: Schema.Types.ObjectId, ref: 'AutoCellar' }
    }],
    state: { type: Boolean, required: false, default: false }
});

module.exports = mongoose.model('AutoPart', autoPartSchema);