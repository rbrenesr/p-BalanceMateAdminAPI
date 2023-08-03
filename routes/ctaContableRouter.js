const express = require('express');
const ctaContableRouter = express.Router();

const { validarJWT } = require('../middlewares/validarJWT');
const {
    validateInputDataEmpresa,    
} = require('../middlewares/validateInputData');

const {  onGetCtaContable,onNewCtaContable,onUpdateCtaContable,onDeleteCtaContable } = require("../controllers/ctaContableController");

ctaContableRouter.use(validarJWT);

ctaContableRouter.get('/:clave?/:valor?', onGetCtaContable);
ctaContableRouter.post('/',  onNewCtaContable);
ctaContableRouter.put('/:id',  onUpdateCtaContable);
ctaContableRouter.delete('/:id',  onDeleteCtaContable);

module.exports = { ctaContableRouter };