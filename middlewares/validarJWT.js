const { response, request } = require('express');
const jwt = require('jsonwebtoken');


const validarJWT = (req = request, res = response, next) => {

    const token = req.header('x-token'); 
 
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: "No existe token en la petición"
        });
    }

    try {

        const payload = jwt.verify(token, process.env.SECRET_JWT_SEED);
        
        req.id = payload.id;
        req.name = payload.name;
        req.db = payload.db;

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: "Token no validado"
        });
    }
    next();
}

module.exports = {
    validarJWT
};
