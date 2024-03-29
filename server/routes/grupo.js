const express = require('express')
const app = express()
const Grupo = require('../models/grupo')
const { verificaToken, verificaRol } = require('../middlewares/authenticate')
const _ = require('underscore');
const { isNull } = require('underscore');
const Usuario = require('../models/usuario');



//===========================
//Crea un grupo
//===========================
app.post('/grupo', verificaToken, (req, res) => {
    let body = req.body
    let balanceEconomico = 0
    var balances = []
    const categorias = []
    const map = new Map()

    let grupo = new Grupo({
        nombre: body.nombre,
        propietario: req.usuario._id,
        miembros: req.usuario._id
    })
    grupo.save((errSave, grupoDB) => {
        if (errSave) {
            return res.status(400).json({
                ok: false,
                errSave
            })
        }
        Grupo.findOne({
            _id: grupoDB._id,
        })
            .populate('miembros')
            .populate({
                path: 'movimientos', populate: { path: 'deudores.usuario beneficiario pagador categoria' }
                , options: { sort: { fechaPago: -1 } }
            })
            .populate('propietario', 'nombre')
            .exec((err, grupo) => {
                if (err) {
                    return res.status(400).json({
                        err
                    })
                }
                movimientos = grupo.movimientos
                miembros = grupo.miembros
    
                for (const item of movimientos) {
                    if (item.categoria == null) {
                    } else {
                        if (!map.has(item.categoria._id)) {
                            map.set(item.categoria._id, true);    // set any value to Map
                            categorias.push({
                                _id: item.categoria._id,
                                nombre: item.categoria.nombre
                            });
                        }
                    }
                }
    
                miembros.forEach(miembro => {
                    balanceEconomico = 0
                    movimientos.forEach(movimiento => {
                        if (movimiento.fechaPago >= fechaInicio && movimiento.fechaPago <= fechaFin) {
                            if (movimiento.tipo == "PAGO") {
                                if (movimiento.pagador.equals(miembro)) {
                                    balanceEconomico = balanceEconomico + movimiento.importe
                                } else if (movimiento.beneficiario.equals(miembro)) {
                                    balanceEconomico = balanceEconomico - movimiento.importe
                                }
                            } else if (movimiento.tipo == "GASTO") {
                                let deudores = movimiento.deudores
                                deudores.forEach(deudor => {
                                    if (deudor.usuario.equals(miembro)) {
                                        balanceEconomico = balanceEconomico - ((movimiento.importe * deudor.porcentaje) / 100)
                                    }
                                })
                                let pagador = movimiento.pagador
                                if (pagador.equals(miembro)) {
                                    balanceEconomico = balanceEconomico + movimiento.importe
                                }
                            }
                        }
                    })
                    var balance = {
                        miembro,
                        balanceEconomico
                    }
                    balances.push(balance)
                })
                res.status(200).json({
                    grupo: {
                        _id: grupo._id,
                        nombre: grupo.nombre,
                        propietario: grupo.propietario,
                        miembros: grupo.miembros,
                        fechaCreacion: grupo.fechaCreacion
                    },
                    balances,
                    categorias,
                    ok:true
                })
            })
    })
})

//=============================================
//Obtiene grupos por id Usuario sin movimientos
//=============================================

app.get('/grupos', verificaToken, (req, res) => {
    Grupo.find(
        {
            miembros: req.usuario._id
        },
        'miembros propietario nombre fechaCreacion'
    )
        .populate('miembros', 'nombre')
        .populate('propietario', 'nombre')
        .exec((err, grupos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            res.status(200).json({
                grupos
            })
        })
})

//=============================
//Obtiene grupo por id Grupo
//=============================

app.get('/grupo/:id', verificaToken, (req, res) => {
    let id = req.params.id
    Grupo.findById(id)
        .exec((err, grupo) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            res.status(200).json({
                grupo
            })
        })
})

//=============================
//Obtiene Grupo Completo
//=============================
app.get('/grupoCompleto/:idGrupo', verificaToken, (req, res) => {
    let idGrupo = req.params.idGrupo
    let fechaInicio = new Date(req.query.fechaInicio)
    let fechaFin = new Date(req.query.fechaFin)
    let balanceEconomico = 0
    var balances = []
    const categorias = []
    const map = new Map()

    if (!isValidDate(fechaInicio)) {
        fechaInicio = new Date("1900-01-01")
    } else {
        fechaInicio.setHours(00, 00, 00)
    }

    if (!isValidDate(fechaFin)) {
        fechaFin = new Date()
        fechaFin.setHours(23, 59, 59)
    } else {
        fechaFin.setHours(23, 59, 59)
    }

    Grupo.findOne({
        _id: idGrupo,
        $or: [
            { miembros: req.usuario._id }
        ]
    })
        .populate('miembros')
        .populate({
            path: 'movimientos', populate: { path: 'deudores.usuario beneficiario pagador categoria' }
            , options: { sort: { fechaPago: -1 } }
        })
        .populate('propietario', 'nombre')
        .exec((err, grupo) => {
            if (err) {
                return res.status(400).json({
                    err
                })
            }
            if (grupo == null) {
                return res.status(400).json({
                    err: "No existe el grupo"
                })
            }
            movimientos = grupo.movimientos
            miembros = grupo.miembros

            for (const item of movimientos) {
                if (item.categoria == null) {
                } else {
                    if (!map.has(item.categoria._id)) {
                        map.set(item.categoria._id, true);    // set any value to Map
                        categorias.push({
                            _id: item.categoria._id,
                            nombre: item.categoria.nombre
                        });
                    }
                }
            }

            miembros.forEach(miembro => {
                balanceEconomico = 0
                movimientos.forEach(movimiento => {
                    if (movimiento.fechaPago >= fechaInicio && movimiento.fechaPago <= fechaFin) {
                        if (movimiento.tipo == "PAGO") {
                            if (movimiento.pagador.equals(miembro)) {
                                balanceEconomico = balanceEconomico + movimiento.importe
                            } else if (movimiento.beneficiario.equals(miembro)) {
                                balanceEconomico = balanceEconomico - movimiento.importe
                            }
                        } else if (movimiento.tipo == "GASTO") {
                            let deudores = movimiento.deudores
                            deudores.forEach(deudor => {
                                if (deudor.usuario.equals(miembro)) {
                                    balanceEconomico = balanceEconomico - ((movimiento.importe * deudor.porcentaje) / 100)
                                }
                            })
                            let pagador = movimiento.pagador
                            if (pagador.equals(miembro)) {
                                balanceEconomico = balanceEconomico + movimiento.importe
                            }
                        }
                    }
                })
                var balance = {
                    miembro,
                    balanceEconomico
                }
                balances.push(balance)
            })
            res.status(200).json({
                grupo: {
                    _id: grupo._id,
                    nombre: grupo.nombre,
                    propietario: grupo.propietario,
                    miembros: grupo.miembros,
                    fechaCreacion: grupo.fechaCreacion
                },
                balances,
                categorias
            })
        })
})

//=============================
//Obtiene Balances por Categorias de un grupo
//=============================
app.get('/grupoCategoriasBalance/:idGrupo', verificaToken, (req, res) => {
    let idGrupo = req.params.idGrupo
    let fechaInicio = new Date(req.query.fechaInicio)
    let fechaFin = new Date(req.query.fechaFin)
    const categoriasGrupo = []
    const map = new Map()

    if (!isValidDate(fechaInicio)) {
        fechaInicio = new Date("1900-01-01")
    } else {
        fechaInicio.setHours(00, 00, 00)
    }

    if (!isValidDate(fechaFin)) {
        fechaFin = new Date()
        fechaFin.setHours(23, 59, 59)
    } else {
        fechaFin.setHours(23, 59, 59)
    }

    Grupo.findOne({
        _id: idGrupo,
        $or: [
            { miembros: req.usuario._id }
        ]
    })
        .populate({
            path: 'movimientos', populate: { path: 'categoria' }
            , options: { sort: { fechaPago: -1 } }
        }).exec((err, grupo) => {
            if (err) {
                return res.status(400).json({
                    err
                })
            }
            if (grupo == null) {
                return res.status(400).json({
                    err: "No existe el grupo"
                })
            }
            var balancesCategorias = []
            movimientos = grupo.movimientos
            for (const item of movimientos) {
                if (item.categoria == null) {
                } else {
                    if (!map.has(item.categoria._id)) {
                        map.set(item.categoria._id, true);    // set any value to Map
                        categoriasGrupo.push({
                            _id: item.categoria._id,
                            nombre: item.categoria.nombre
                        });
                    }
                }
            }

            categoriasGrupo.forEach(categoria => {
                var balanceEconomico = 0
                movimientos.forEach(movimiento => {
                    if (movimiento.fechaPago >= fechaInicio && movimiento.fechaPago <= fechaFin) {
                        if (movimiento.tipo == "GASTO" && movimiento.categoria != null) {
                            if (movimiento.categoria._id == categoria._id) {
                                balanceEconomico = movimiento.importe + balanceEconomico
                            }
                        }
                    }
                })
                var balanceCategoria = {
                    balanceEconomico,
                    categoria
                }
                balancesCategorias.push(balanceCategoria)
            })
            res.status(200).json({
                balancesCategorias
            })
        })
})

//=============================
//Obtiene movimientos de un grupo idGrupo
//=============================
app.get('/grupoMovimientos/:idGrupo', verificaToken, (req, res) => {
    let idGrupo = req.params.idGrupo
    var desde = req.query.desde
    var numeroMovimientos = req.query.numeroMovimientos
    let categoria = req.query.categoria
    let fechaInicio = new Date(req.query.fechaInicio)
    let fechaFin = new Date(req.query.fechaFin)

    if (!isValidDate(fechaInicio)) {
        fechaInicio = new Date("1900-01-01")
    } else {
        fechaInicio.setHours(00, 00, 00)
    }

    if (!isValidDate(fechaFin)) {
        fechaFin = new Date()
        fechaFin.setHours(23, 59, 59)
    } else {
        fechaFin.setHours(23, 59, 59)
    }

    var queryCategoria = {};
    if (categoria && categoria.length > 0) queryCategoria = {
        categoria: categoria,
        fechaPago: {
            $gte: fechaInicio,
            $lte: fechaFin
        }
    }
    if (desde && desde.length > 0) { } else { desde = 0 };
    if (numeroMovimientos && numeroMovimientos.length > 0) { } else { numeroMovimientos = 100 };

    Grupo.find(
        {
            _id: idGrupo,
            miembros: req.usuario._id

        },
        //Indicamos los campos a mostrar
        'movimientos'
    )
        //Sacamos los campos nombre de los usuarios relacionados en pagos
        .populate({
            path: 'movimientos', populate:
            {
                path: 'deudores.usuario beneficiario pagador categoria'
            },
            match: queryCategoria,
            options: {
                sort: { fechaPago: -1 },
                skip: Number(desde),
                limit: numeroMovimientos
            }
        })
        //.lean()
        .exec((err, grupo) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            if (grupo == null) {
                return res.status(400).json({
                    err: "No existe el grupo"
                })
            }
            let movimientos = grupo.map((grupo) => { return grupo.movimientos })
            res.status(200).json({
                movimientos: movimientos[0]
            })
        })
})

//=============================
//Obtiene deuda total usuario en un grupo
//=============================
app.get('/grupoUsuarioBalance/:idGrupo', verificaToken, (req, res) => {
    let idGrupo = req.params.idGrupo
    let fechaInicio = new Date(req.query.fechaInicio)
    let fechaFin = new Date(req.query.fechaFin)
    let usuarioID = req.usuario._id
    let balance = 0

    if (!isValidDate(fechaInicio)) {
        fechaInicio = new Date("1900-01-01")
    } else {
        fechaInicio.setHours(00, 00, 00)
    }

    if (!isValidDate(fechaFin)) {
        fechaFin = new Date()
        fechaFin.setHours(23, 59, 59)
    } else {
        fechaFin.setHours(23, 59, 59)
    }

    Grupo.findOne({
        _id: idGrupo,
        $or: [
            { miembros: req.usuario._id }
        ]
    })
        .populate('miembros', 'nombre')
        .populate({ path: 'movimientos', populate: { path: 'pagador' } })
        .populate({ path: 'movimientos', populate: { path: 'beneficiario' } })
        .populate({ path: 'movimientos', populate: { path: 'deudores.usuario' } })
        .populate({ path: 'movimientos', populate: { path: 'categoria', select: 'nombre' } })
        .exec((err, grupo) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            if (grupo == null) {
                return res.status(400).json({
                    err: "No existe el grupo"
                })
            }
            movimientos = grupo.movimientos
            movimientos.forEach(movimiento => {
                if (movimiento.fechaPago >= fechaInicio && movimiento.fechaPago <= fechaFin) {
                    if (movimiento.tipo == "PAGO") {
                        if (movimiento.pagador.equals(usuarioID)) {
                            balance = balance + movimiento.importe
                        } else if (movimiento.beneficiario.equals(usuarioID)) {
                            balance = balance - movimiento.importe
                        }
                    } else if (movimiento.tipo == "GASTO") {
                        deudores = movimiento.deudores
                        deudores.forEach(deudor => {
                            if (deudor.usuario.equals(usuarioID)) {
                                balance = balance - ((movimiento.importe * deudor.porcentaje) / 100)
                            }
                        })
                        let pagador = movimiento.pagador
                        if (pagador.equals(usuarioID)) {
                            balance = balance + movimiento.importe
                        }
                    }
                }
            })
            res.status(200).json({
                balance
            })
        })
})

//=============================
//Añadir nuevo movimiento a Grupo
//=============================
app.put('/grupoMovimiento/:idGrupo/:idMovimiento', verificaToken, function (req, res) {
    let idGrupo = req.params.idGrupo;
    let idMovimiento = req.params.idMovimiento;
    Grupo.findById(idGrupo, (err, grupoDB) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                err: {
                    message: err.message,
                    codigo: 500
                },
                ok: false
            })
        }
        if (grupoDB == null) {
            return res.status(400).json({
                err: "No existe el grupo"
            })
        }
        grupoDB.movimientos.push(idMovimiento)
        grupoDB.save((err, grupoDBActualizado) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    err: {
                        message: err.message,
                        codigo: 500
                    },
                    ok: false
                })
            }
            res.status(200).json({
                ok: true
            })
        })
    })
})

//=============================
//Añadir nuevo miembro
//=============================
app.put('/grupoUsuario/:idGrupo/:idUsuario', verificaToken, function (req, res) {
    let idGrupo = req.params.idGrupo
    let idUsuario = req.params.idUsuario;
    Grupo.findOne(
        {
            _id: idGrupo,
            miembros: req.usuario._id
        },
        (err, grupo) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    err: {
                        message: "Error al encontrar el grupo",
                        codigo: 500
                    },
                    ok:false
                })
            }
            if (grupo.miembros.includes(idUsuario)) {
                return res.status(200).json({
                    err: {
                        message: "Usuario ya pertenece al grupo",
                        codigo: 500
                    },
                    ok:false
                })
            }
            grupo.miembros.push(idUsuario)
            grupo.save((err, grupoDBActualizado) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        err,
                        ok:false
                    })
                }
                res.status(200).json({
                    grupo: grupoDBActualizado
                })
            })
        })
})

//===================================
//Añadir nuevo miembro mediante email
//===================================
app.put('/grupoUsuario/:idGrupo', verificaToken, function (req, res) {
    let body = req.body
    let balanceEconomico = 0
    var balances = []
    const categorias = []
    const map = new Map()

    let idGrupo = req.params.idGrupo
    let idUsuarioAgregante = req.usuario._id
    let emailUsuario = body.email;
    Usuario.findOne({
        email : emailUsuario
    }).exec((err,usuarioNuevo) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                err: {
                    message: "Error al encontrar al usuario",
                    codigo: 500
                },
                ok:false
            })
        }
        if (usuarioNuevo === null){
            return res.status(400).json({
                err: {
                    message: "Usuario no encontrado",
                    codigo: 400
                },
                ok:false
            })
        }
        Grupo.findOne(
            {
                _id: idGrupo,
                propietario: idUsuarioAgregante
            },
            (err, grupo) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        err: {
                            message: "Error al encontrar el grupo",
                            codigo: 500
                        },
                        ok:false
                    })
                }
                if(grupo === null){
                    return res.status(400).json({
                        err: {
                            message: "Grupo no encontrado o no eres el propietario",
                            codigo: 400
                        },
                        ok:false
                    })
                }
                if (grupo.miembros.includes(usuarioNuevo._id)) {
                    return res.status(200).json({
                        err: {
                            message: "Ya existe este usuario en el grupo",
                            codigo: 200
                        },
                        ok:false
                    })
                }
                grupo.miembros.push(usuarioNuevo._id)
                grupo.save((errSave, grupoDBActualizado) => {
                    if (errSave) {
                        return res.status(400).json({
                            err: {
                                message: errSave,
                                codigo: 500
                            },
                            ok:false
                        })
                    }
                    Grupo.findOne({
                        _id: grupoDBActualizado._id,
                    })
                        .populate('miembros')
                        .populate({
                            path: 'movimientos', populate: { path: 'deudores.usuario beneficiario pagador categoria' }
                            , options: { sort: { fechaPago: -1 } }
                        })
                        .populate('propietario', 'nombre')
                        .exec((err, grupo) => {
                            if (err) {
                                return res.status(400).json({
                                    err: {
                                        message: err,
                                        codigo: 400
                                    },
                                    ok:false
                                })
                            }
                            movimientos = grupo.movimientos
                            miembros = grupo.miembros
                
                            for (const item of movimientos) {
                                if (item.categoria == null) {
                                } else {
                                    if (!map.has(item.categoria._id)) {
                                        map.set(item.categoria._id, true);    // set any value to Map
                                        categorias.push({
                                            _id: item.categoria._id,
                                            nombre: item.categoria.nombre
                                        });
                                    }
                                }
                            }
                
                            miembros.forEach(miembro => {
                                balanceEconomico = 0
                                movimientos.forEach(movimiento => {
                                    if (movimiento.fechaPago >= fechaInicio && movimiento.fechaPago <= fechaFin) {
                                        if (movimiento.tipo == "PAGO") {
                                            if (movimiento.pagador.equals(miembro)) {
                                                balanceEconomico = balanceEconomico + movimiento.importe
                                            } else if (movimiento.beneficiario.equals(miembro)) {
                                                balanceEconomico = balanceEconomico - movimiento.importe
                                            }
                                        } else if (movimiento.tipo == "GASTO") {
                                            let deudores = movimiento.deudores
                                            deudores.forEach(deudor => {
                                                if (deudor.usuario.equals(miembro)) {
                                                    balanceEconomico = balanceEconomico - ((movimiento.importe * deudor.porcentaje) / 100)
                                                }
                                            })
                                            let pagador = movimiento.pagador
                                            if (pagador.equals(miembro)) {
                                                balanceEconomico = balanceEconomico + movimiento.importe
                                            }
                                        }
                                    }
                                })
                                var balance = {
                                    miembro,
                                    balanceEconomico
                                }
                                balances.push(balance)
                            })
                            res.status(200).json({
                                grupo: {
                                    _id: grupo._id,
                                    nombre: grupo.nombre,
                                    propietario: grupo.propietario,
                                    miembros: grupo.miembros,
                                    fechaCreacion: grupo.fechaCreacion
                                },
                                balances,
                                categorias,
                                ok:true
                            })
                        })
                })
            })
    })
})



function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

module.exports = app