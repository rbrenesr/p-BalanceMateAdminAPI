const express = require('express');
const autenticarRouter = express.Router();

const { validarJWT } = require('../middlewares/validarJWT');
const { validateInputDataLogin, validateInputDataNewUser } = require('../middlewares/validateInputData');
const { autenticar, renovarToken, obtenerEmpresasUsuario } = require("../controllers/autenticarController");

autenticarRouter.post('/',validateInputDataLogin, autenticar);
autenticarRouter.use(validarJWT);
autenticarRouter.get('/renovarToken', renovarToken);
autenticarRouter.get('/empresasUsuario', obtenerEmpresasUsuario);

module.exports = { autenticarRouter };