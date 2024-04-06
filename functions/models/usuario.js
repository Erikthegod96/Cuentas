const moongose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = moongose.Schema;
let validateRol = {
    values: ['SUPER_ROLE','ADMIN_ROLE','USER_ROLE'],
    message : '{VALUE} no es un rol valido'
}

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Es obligatorio el nombre']
    },
    apellidos: {
        type: String,
    },
    email:{
        type: String,
        required: [true, 'Es obligatorio el email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Es obligatoria el número']
    },
    img: {
        type: String,
        required: false
    },
    estado: {
        type: Boolean,
        required: [true, 'Es obligatorio el estado'],
        default: true
    },
    rol:{
        type: String,
        default: 'USER_ROLE',
        enum: validateRol
    },
    fechaCreacion:{
        type: Date
    },
    grupoFavorito:{
        type: Schema.Types.ObjectId, 
        ref: 'Grupo'
    }
})

usuarioSchema.methods.toJSON = function(){
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

usuarioSchema.plugin(uniqueValidater,{ message: '{PATH} debe de ser único'});

module.exports = moongose.model('Usuario', usuarioSchema);