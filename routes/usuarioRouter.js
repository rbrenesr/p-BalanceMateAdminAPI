const express = require('express');
const usuarioRouter = express.Router();

const { validarJWT } = require('../middlewares/validarJWT');
const {
    validateInputDataNuevoUsuario,    
} = require('../middlewares/validateInputData');
const { nuevoUsuario, obtenerUsuario, actualizarUsuario, eliminarUsuario } = require("../controllers/usuarioController");


usuarioRouter.use(validarJWT);

usuarioRouter.post('/', validateInputDataNuevoUsuario, nuevoUsuario);
usuarioRouter.get('/:clave?/:valor?', obtenerUsuario);

module.exports = { usuarioRouter };