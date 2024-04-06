const jwt = require ('jsonwebtoken')

//Verificar token
let verificaToken = (req,res,next) => {
    let token = req.get('token')
     jwt.verify( token, process.env.SEED, (err, decoded) => {
        if(err){
            return res.status(401).json({
                ok:false,
                err
            })
        }

        req.usuario = decoded.usuario
        next()
     })


} 

//Verifica rol
let verificaRol = (req,res,next) => {
    let usuario = req.usuario
    if(usuario.role === 'ADMIN_ROLE'){
        next()
    } else {
        return res.status(401).json({
            ok:false,
            err :{
                message : 'El usuario no tiene permiso por su rol'
            }
        })
    }
}

module.exports={
    verificaToken,
    verificaRol
}