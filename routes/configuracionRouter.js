const express = require('express');
const configuracionRouter = express.Router();

const { validarJWT } = require('../middlewares/validarJWT');
const {
    validateInputDataEmpresa,    
} = require('../middlewares/validateInputData');
const {  onGetConfiguracion, onUpdateConfiguracion } = require("../controllers/configuracionController");

configuracionRouter.use(validarJWT);
configuracionRouter.get('/:clave?/:valor?', onGetConfiguracion);
configuracionRouter.put('/',  onUpdateConfiguracion);

module.exports = { configuracionRouter };