require ("mongoose");

//PUERTO
process.env.PORT = process.env.PORT || 3002;

//ENTORNO NODE
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

//URL DB
let urlDB;
if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb+srv://ericmartingalan:Bizcocho16@cluster0.bqpvd9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
} else {
    urlDB = process.env.URL_PROD
}
process.env.URLDB = urlDB;

//CADUCIDAD TOKEN
process.env.CADUCIDAD = '80h'

//SEED TOKEN
process.env.SEED = process.env.SEED || 'este-es-el-seed-dev';

module.exports = {process}