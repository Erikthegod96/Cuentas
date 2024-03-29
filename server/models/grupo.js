const moongose = require('mongoose');
let Schema = moongose.Schema;
const uniqueValidater = require('mongoose-unique-validator');
const _ = require('underscore');

let grupoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Es obligatorio el nombre']
    },
    propietario: {
        type: Schema.Types.ObjectId, 
        ref: 'Usuario',
        required: [true, 'Es obligatorio el propietario']
    },
    fechaCreacion: {
        type: Date,           
        default: Date.now
    },
    miembros: [{
        type: Schema.Types.ObjectId, 
        ref: 'Usuario'
    }],
    movimientos: [{
        type: Schema.Types.ObjectId,
        ref: 'Movimiento'
    }]
})

grupoSchema.methods.toJSON = function(){
    let user = this;
    let userObject = user.toObject();
    return userObject;
}

grupoSchema.plugin(uniqueValidater,{ message: '{PATH} debe de ser único'});
module.exports = moongose.model('Grupo', grupoSchema);