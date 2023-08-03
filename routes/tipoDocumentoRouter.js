const express = require('express');
tipoDocumentoRouter = express.Router();

const { validarJWT } = require('../middlewares/validarJWT');
const {
    validateInputDataEmpresa,    
} = require('../middlewares/validateInputData');

const {  onGetTipoDocumento,onNewTipoDocumento,onUpdateTipoDocumento,onDeleteTipoDocumento } = require("../controllers/tipoDocumentoController");

tipoDocumentoRouter.use(validarJWT);

tipoDocumentoRouter.get('/:clave?/:valor?', onGetTipoDocumento);
tipoDocumentoRouter.post('/',  onNewTipoDocumento);
tipoDocumentoRouter.put('/:id',  onUpdateTipoDocumento);
tipoDocumentoRouter.delete('/:id',  onDeleteTipoDocumento);

module.exports = { tipoDocumentoRouter };