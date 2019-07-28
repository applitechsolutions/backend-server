var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 2);
var jobsValidos = {
    values: ['ADMINISTRADOR', 'PLANILLA', 'CD'],
    message: '{VALUE} no es un rol permitido'
};

var Schema = mongoose.Schema;

var employeeSchema = new Schema({
    job: { type: String, required: [true, 'El trabajo es necesario'], enum: jobsValidos },
    entry: { type: Number, unique: true, required: [true, 'El número de entrada es necesario'] },
    account: { type: String },
    name: { type: String },
    datestart: { type: Date },
    pay: { type: Float, required: [true, 'El salario es necesario'] },
    dpi: { type: String },
    address: { type: String },
    mobile: { type: String },
    igss: { type: String },
    state: { type: Boolean, default: false }
});

module.exports = mongoose.model('Employee', employeeSchema);