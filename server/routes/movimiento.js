const express = require('express')
const app = express()
const Movimiento = require('../models/movimiento')
const { verificaToken, verificaRol } = require('../middlewares/authenticate')
const _ = require('underscore');



//===========================
//Crea un movimiento
//===========================
app.post('/movimiento', verificaToken, (req, res) => {
    let body = req.body
    if (body.tipo == "PAGO" && body.beneficiario != null) {
        movimiento = new Movimiento ({
            tipo: body.tipo,
            pagador: body.pagador,
            beneficiario: body.beneficiario,
            importe: body.importe,
            concepto: body.concepto,
            fechaPago: body.fechaPago
        })
    } else if (body.tipo == "GASTO" && body.deudores != null && body.categoria != null) {
        movimiento = new Movimiento({
            tipo: body.tipo,
            pagador: body.pagador,
            deudores: body.deudores,
            importe: body.importe,
            categoria: body.categoria,
            fechaPago: body.fechaPago
        })
    } else {
        return res.status(404).json({
            err: {
                message: "Tipo incorrecto o falta campos por rellenar",
                codigo: 404
            }
        })
    }
    movimiento.save((err, movimientoDB) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                err: {
                    message: err.message,
                    codigo: 500
                },
                ok:false
            })
        }
        res.status(200).json({
            ok:true,
            movimiento: {
                _id: movimientoDB._id,
                tipo: movimientoDB.tipo,
                importe: movimientoDB.importe,
                fechaPago: movimientoDB.fechaPago
            }
        })
    })
})

//=============================
//Obtiene Movimientos
//=============================
app.get('/movimientos', (req, res) => {
    Movimiento.find().exec((err,movimientos) => {
        if (err) {
            return res.status(400).json({
                message: err,
                codigo: 400
            })
        }
        res.status(200).json({
            movimientos
        })   
    })
})


function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}


module.exports = app