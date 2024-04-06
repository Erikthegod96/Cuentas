const express = require('express')
const app = express()
const Categoria = require('../models/categoria')
const { verificaToken, verificaRol } = require('../middlewares/authenticate')
const _ = require('underscore');

//===========================
//Crea una Categoria
//===========================
app.post('/categoria',(req,res) => {
    let body = req.body
    let categoria = new Categoria({
        nombre: body.nombre,
    })
    categoria.save((err, categoriaDB) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                err:{
                    message: err,
                    codigo: 500
                }
            })
        }
        res.status(200).json({
            categoria: categoriaDB
        })
    })
})

//=============================
//Obtiene categorias por id
//=============================

app.get('/categoria/:id', (req, res) => {
    let idCategoria = req.params.id
    Categoria.findById(idCategoria, (err,categoria) => {
        if (err) {
            return res.status(400).json({
                message: err,
                codigo: 400
            })
        }
        res.status(200).json({
            categoria
        })
    })
})

//=============================
//Obtiene categoria por nombre
//=============================
app.get('/categoria/:nombreCategoria', (req, res) => {
    let nombreCategoria = req.params.nombreCategoria
    Categoria.find(
        { 
            nombre : nombreCategoria
        }
    ).exec((err,categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.status(200).json({
            categoria
        })   
    })
})

//=============================
//Obtiene categorias
//=============================
app.get('/categorias', (req, res) => {
    Categoria.find().exec((err,categorias) => {
        if (err) {
            return res.status(400).json({
                message: err,
                codigo: 400
            })
        }
        res.status(200).json({
            categorias
        })   
    })
})

module.exports =  app