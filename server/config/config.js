require ("mongoose");
require('dotenv').config();
//PUERTO
process.env.PORT = process.env.PORT || 3002;

//ENTORNO NODE
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

//URL DB
let urlDB;
if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cuentas'
} else {
    urlDB = process.env.MONGODB_CNN
}
process.env.URLDB = urlDB;

//CADUCIDAD TOKEN
process.env.CADUCIDAD = '80h'

//SEED TOKEN
process.env.SEED = process.env.SEED || 'este-es-el-seed-dev';

module.exports = {process}
