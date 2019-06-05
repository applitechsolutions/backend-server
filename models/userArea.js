var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var userAreaSchema = new Schema({

    _user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'El usuario es requerido'] },
    _area: { type: Schema.Types.ObjectId, ref: 'Area', required: [true, 'El área es necesaria'] }

});

module.exports = mongoose.model('UserArea', userAreaSchema);