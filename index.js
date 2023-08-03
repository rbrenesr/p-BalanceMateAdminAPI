const express = require('express');
const cors = require('cors');
require('dotenv').config(); //*Variables de entorno

const { autenticarRouter } = require('./routes/autenticarRouter');
const { usuarioRouter } = require('./routes/usuarioRouter');
const { empresaRouter } = require('./routes/empresaRouter');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.use('/api/autenticar', autenticarRouter);
app.use('/api/usuario', usuarioRouter);
app.use('/api/empresa', empresaRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server running in port ${process.env.PORT}`);
});