const moongose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = moongose.Schema;

let categoriaSchema = new Schema({
    nombre: {
        type: String, 
        required: [true, 'Es obligatorio el nombre'],
        unique: true
    }
})

categoriaSchema.methods.toJSON = function(){
    let user = this;
    let userObject = user.toObject();
    return userObject;
}

categoriaSchema.plugin(uniqueValidater,{ message: '{PATH} debe de ser único'});
module.exports = moongose.model('Categoria', categoriaSchema);