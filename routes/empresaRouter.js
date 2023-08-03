const express = require('express');
const empresaRouter = express.Router();

const { validarJWT } = require('../middlewares/validarJWT');
const {
    validateInputDataEmpresa,    
} = require('../middlewares/validateInputData');
const { onNewEmpresa, onGetEmpresa, onUpdateEmpresa } = require("../controllers/empresaController");

empresaRouter.use(validarJWT);
empresaRouter.post('/', validateInputDataEmpresa, onNewEmpresa);
empresaRouter.get('/:clave?/:valor?', onGetEmpresa);
empresaRouter.put('/:id',validateInputDataEmpresa,  onUpdateEmpresa);

module.exports = { empresaRouter };