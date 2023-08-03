const { configBD } = require('../database/config');
const { generarJWT } = require('../helpers/jwt');
const { response, request } = require("express");
const bcryptjs = require('bcryptjs');
const sql = require('mssql');
const fs = require('fs');





const onGetConfiguracion = async (req = request, res = response) => {

  try {

    const db = req.db;
    const configBDNew = { ...configBD, database: db };

    const myquery = `SELECT [id], [valor]
                      FROM [dbo].[Configuracion]`;

    await sql.close();
    const pool = await sql.connect(configBDNew);
    const result = await pool.request().query(myquery);
    const recordset = result.recordset;

    if (recordset.length < 1) {
      return res.status(200).json({
        ok: false,
        msg: `No existe datos para la búsqueda proporcionada por = ${valor} en ${clave}`,
        usuario: recordset[0],
      });
    }

    return res.status(200).json({
      ok: true,
      msg: `Empresas seleccionadas`,
      configuracion: recordset,
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al procesar la selección del datos.',
      msgSystem: error.originalError.info.message
    });
  }
}

const onUpdateConfiguracion = async (req = request, res = response) => {

  try {
    const db = req.db;
    const configuraciones = req.body;
    let myquery = '';

    for (let i = 0; i < configuraciones.length; i++) {
      const id = configuraciones[i].id;
      const valor = configuraciones[i].valor;
      myquery += `UPDATE [dbo].[Configuracion] SET [valor] = '${valor}' WHERE [id] = '${id}';
`;
    }

    const configBDNew = { ...configBD, database: db };
    await sql.close();
    const pool = await sql.connect(configBDNew);

    await pool.request().query(myquery);

    return res.status(200).json({
      ok: true,
      msg: `onUpdateConfiguracion`,
      configuraciones
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al procesar la actualización de datos.',
      msgSystem: error.originalError.info.message
    });
  }

};


const findEmpresaById = async (id) => {
  const myquery = `SELECT 1 FROM Empresa WHERE id = '${id}'`;
  await sql.close();
  const pool = await sql.connect(configBD);
  const result = await pool.request().query(myquery);
  const { recordset } = result;

  if (recordset.length === 1)
    return true;
  else
    return false;
}

module.exports = { onGetConfiguracion, onUpdateConfiguracion };