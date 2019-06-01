var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var userSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    lastName: { type: String, required: false },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'ADMIN_ROLE', enum: rolesValidos },
    state: { type: Boolean, required: true, default: false },
    google: { type: Boolean, required: true, default: false }
});

userSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('User', userSchema);