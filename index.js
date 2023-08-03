const express = require('express');
const cors = require('cors');
require('dotenv').config(); //*Variables de entorno

const { autenticarRouter } = require('./routes/autenticarRouter');
const { usuarioRouter } = require('./routes/usuarioRouter');
const { empresaRouter } = require('./routes/empresaRouter');

const { configuracionRouter } = require('./routes/configuracionRouter');
const { ctaContableRouter } = require('./routes/ctaContableRouter');
const { tipoAsientoRouter } = require('./routes/tipoAsientoRouter');
const { tipoDocumentoRouter } = require('./routes/tipoDocumentoRouter');

const { asientoRouter } = require('./routes/asientoRouter');



const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.use('/api/autenticar', autenticarRouter);
app.use('/api/usuario', usuarioRouter);
app.use('/api/empresa', empresaRouter);

app.use('/api/configuracion', configuracionRouter);
app.use('/api/ctaContable', ctaContableRouter);
app.use('/api/tipoAsiento', tipoAsientoRouter);
app.use('/api/tipoDocumento', tipoDocumentoRouter);
app.use('/api/asiento', asientoRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server running in port ${process.env.PORT}`);
});