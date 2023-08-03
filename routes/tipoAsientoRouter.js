const express = require('express');
tipoAsientoRouter = express.Router();

const { validarJWT } = require('../middlewares/validarJWT');
const {
    validateInputDataEmpresa,    
} = require('../middlewares/validateInputData');

const {  onGetTipoAsiento,onNewTipoAsiento,onUpdateTipoAsiento,onDeleteTipoAsiento } = require("../controllers/tipoAsientoController");

tipoAsientoRouter.use(validarJWT);

tipoAsientoRouter.get('/:clave?/:valor?', onGetTipoAsiento);
tipoAsientoRouter.post('/',  onNewTipoAsiento);
tipoAsientoRouter.put('/:id',  onUpdateTipoAsiento);
tipoAsientoRouter.delete('/:id',  onDeleteTipoAsiento);

module.exports = { tipoAsientoRouter };