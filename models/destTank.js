var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var destTankSchema = new Schema({

    name: { type: String, required: [true, 'El nombre es necesario'] },
    km: { type: Float, required: [true, 'Los kilometros son necesarios'] },
    state: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('DestTank', destTankSchema);