require('./config/config')
const express = require('express')
const mongoose = require('mongoose');
const body_parser = require('body-parser')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const app = express()

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }))
// parse application/json
app.use(body_parser.json())
//Configuración global de rutas
app.use(require('./routes/index'))

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) {
        throw err;
    } else {
        console.log('BBDD connect');
    }
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT)
})