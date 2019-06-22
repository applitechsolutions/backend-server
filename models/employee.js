var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Float = require('mongoose-float').loadType(mongoose, 2);

var Schema = mongoose.Schema;

var employeeSchema = new Schema({
    _job: { type: Schema.Types.ObjectId, ref: 'Job', required: [true, 'El tipo de trabajador es necesario'] },
    entry: { type: Number, unique: true, required: [true, 'El número de entrada es necesario'] },
    account: { type: String },
    name: { type: String },
    dateStart: { type: Date },
    pay: { type: Float, required: [true, 'El salario es necesario'] },
    dpi: { type: String }
});

module.exports = mongoose.model('Employee', employeeSchema);