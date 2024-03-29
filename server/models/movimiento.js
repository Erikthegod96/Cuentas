const moongose = require('mongoose');
let Schema = moongose.Schema;
const uniqueValidater = require('mongoose-unique-validator');
const _ = require('underscore');

let validateTipoMovimiento = {
    values: ['GASTO','PAGO'],
    message : '{VALUE} tipo movimiento no valido'
}

let movimientoSchema = new Schema({
    tipo: {
        type: String,
        enum: validateTipoMovimiento
    },
    pagador: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Es obligatorio el pagador']
    },
    beneficiario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
    },
    deudores: [{
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: [true, 'Es obligatorio el deudor']
        },
        porcentaje: {
            type: Number,
            required: [true, 'Es obligatorio el porcentaje']
        }
    }],
    importe: {
        type: Number,
        required: [true, 'Es obligatorio el importe']
    },
    fechaPago: {
        type: Date,
        default: Date.now
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
    },
    concepto: {
        type: String
    }
})

movimientoSchema.methods.toJSON = function(){
    let user = this;
    let userObject = user.toObject();
    return userObject;
}

movimientoSchema.plugin(uniqueValidater,{ message: '{PATH} debe de ser único'});
module.exports = moongose.model('Movimiento', movimientoSchema);