const express = require('express');
asientoRouter = express.Router();

const { validarJWT } = require('../middlewares/validarJWT');
const {
    validateInputDataEmpresa,    
} = require('../middlewares/validateInputData');


const {  onGetAsiento, onNewAsiento, onUpdateAsiento, onDeleteAsiento } = require("../controllers/asientoController");

asientoRouter.use(validarJWT);

asientoRouter.get('/:clave?/:valor?', onGetAsiento);
asientoRouter.post('/',  onNewAsiento);
asientoRouter.put('/:id',  onUpdateAsiento);
asientoRouter.delete('/:id',  onDeleteAsiento);

module.exports = { asientoRouter };