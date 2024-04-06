const express = require('express')
const app = express()
const Usuario = require('../models/usuario')
const bcrypt = require('bcrypt')
const _ = require('underscore')
const jwt = require('jsonwebtoken')
const { verificaToken, verificaRol } = require('../middlewares/authenticate')

//============================
//Muestra todas los usuarios
//============================
app.get('/usuarios', (req, res) => {
    Usuario.find((err, usuarios) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: {
                    message: err,
                    codigo: 400
                }
            })
        }
        res.status(200).json({
            usuarios
        })
    })
})

//============================
//Muestra un usuario por ID
//============================
app.get('/usuarioId/:id', (req, res) => {
    let id = req.params.id
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(400).json({
                err: {
                    message: err,
                    codigo: 400
                }
            })
        }
        res.status(200).json({
            usuario
        })
    })
})

//============================
//Muestra un usuario por email
//============================
app.get('/usuarioEmail/:email', verificaToken, (req, res) => {
    let email = req.params.email
    Usuario.find({ email: email }).
        exec((err, usuario) => {
            if (err) {
                return res.status(400).json({
                    err: {
                        message: err,
                        codigo: 400
                    }
                })
            }
            res.json({
                usuario
            })
        })
})


//============================
//Crea un usuario
//============================
app.post('/usuario', (req, res) => {
    let body = req.body
    let usuario = new Usuario({
        nombre: body.nombre,
        apellidos: body.apellidos,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        estado: true,
        rol: "USER_ROLE",
        fechaCreacion: new Date()
    })
    usuario.save((err, usuarioDB) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                err: {
                    message: err,
                    codigo: 400
                }
            })
        }
        let token = jwt.sign(
            { usuario: usuarioDB },
            process.env.SEED,
            { expiresIn: process.env.CADUCIDAD }
        )

        res.json({
            usuario: usuarioDB,
            token
        })
    })
})

app.put('/usuario/:id', [verificaToken, verificaRol], function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'numero', 'img', 'estado', 'publico', 'entrenador']);
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                err: {
                    message: err,
                    codigo: 400
                }
            })
        }
        res.json({
            usuario: usuarioDB
        });
    })
})

app.put('/usuarioGrupoFavorito', verificaToken, function (req, res) {
    let id = req.usuario._id
    let body = _.pick(req.body, 'grupoFavorito');
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                err: {
                    message: err,
                    codigo: 400
                }
            })
        }
        res.json({
            usuario: usuarioDB
        });
    })
})

module.exports = app