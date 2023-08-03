const { configBD } = require('../database/config');
const { generarJWT } = require('../helpers/jwt');
const { response, request } = require("express");
const bcryptjs = require('bcryptjs');
const sql = require('mssql');
const fs = require('fs');


let configBDConn = '';

const onGetCtaContable = async (req, res = response) => {

    try {

        const db = req.db;
        const configBDConn = { ...configBD, database: db };

        let clave = req.params.clave;
        let valor = req.params.valor;
        let where = '';

        if (!valor) valor = '';
        if (!clave) clave = 'descripcion';

        const cols = ['id', 'tipo', 'descripcion'];
        if (!cols.includes(clave)) {
            return res.status(422).json({
                ok: false,
                msg: 'Es requerido una clave de búsqueda válida.',
            });
        }

        if (clave === 'id') {
            if (valor == '') {
                return res.status(422).json({
                    ok: false,
                    msg: 'El código de id es requerido.',
                });
            }
            where = `WHERE ${clave} like '%${valor}%'`;
        }
        else
            where = `WHERE ${clave} like '%${valor}%'`;


        const myquery = `SELECT [id], [tipo], [descripcion] 
        FROM [dbo].[Catalogo] ${where}`;

        await sql.close();
        const pool = await sql.connect(configBDConn);
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
            msg: `Ctas Contables`,
            empresa: recordset,
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
const onNewCtaContable = async (req, res = response) => {

    const db = req.db;
    configBDConn = { ...configBD, database: db };

    const { id, tipo, descripcion } = req.body;

    if (!id || !tipo || !descripcion) {
        return res.status(400).json({
            ok: false,
            msg: 'Valores requeridos no proporcionados { id, tipo, descripcion }.',
        });
    }

    try {

        if (await existeCta(id)) {
            return res.status(409).json({
                ok: false,
                msg: `La cuenta ${id} ya se encuentra registrada.`
            });
        }

        await sql.close();
        const pool = await sql.connect(configBDConn);
        let result = await pool.request()
            .input('id', sql.VarChar, id)
            .input('tipo', sql.VarChar, tipo)
            .input('descripcion', sql.VarChar, descripcion)
            .query('INSERT INTO [dbo].[Catalogo] ( id, tipo, descripcion ) ' +
                'OUTPUT inserted.id VALUES ( @id, @tipo, @descripcion )');

        const newCtaId = result.recordset[0].id;

        return res.status(200).json({
            ok: true,
            msg: 'Cuenta ingresada correctamente.',
            id: newCtaId

        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar el ingreso del nuevo cuenta.',
            msgSystem: error.originalError.info.message
        });
    }


}
const onUpdateCtaContable = async(req, res = response) => {

    const db = req.db;
    const ctaId = req.params.id;
    configBDConn = { ...configBD, database: db };


    const { tipo, descripcion } = req.body;

    if (!tipo || !descripcion) {
        return res.status(400).json({
            ok: false,
            msg: 'Valores requeridos no proporcionados { tipo, descripcion }.',
        });
    }

    try {

        if (!await existeCta(ctaId)) {
            return res.status(409).json({
                ok: false,
                msg: `La cuenta ${ctaId} que desea actualizar no se encuentra registrada.`
            });
        }

        await sql.close();
        const pool = await sql.connect(configBDConn);
        let result = await pool.request()                       
            .query(`UPDATE[dbo].[Catalogo] SET 
                        tipo = '${tipo}', 
                        descripcion = '${descripcion}'
                    WHERE id = '${ctaId}'`);

        return res.status(200).json({
            ok: true,
            msg: 'Cuenta actualizada correctamente.',            

        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar la actualización de la cuenta.',
            msgSystem: error.originalError.info.message
        });
    }
}
const onDeleteCtaContable = async (req, res = response) => {
    const db = req.db;
    const ctaId = req.params.id;
    configBDConn = { ...configBD, database: db };

  

    try {

        if (!await existeCta(ctaId)) {
            return res.status(409).json({
                ok: false,
                msg: `La cuenta ${ctaId} que desea eliminar no se encuentra registrada.`
            });
        }

        await sql.close();
        const pool = await sql.connect(configBDConn);
        let result = await pool.request()                       
            .query(`DELETE FROM [dbo].[Catalogo] 
                    WHERE id = '${ctaId}'`);

        return res.status(200).json({
            ok: true,
            msg: 'Cuenta eliminada correctamente.',            

        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: `Error al procesar la eliminación de la cuenta ${ ctaId }`,
            msgSystem: error.originalError.info.message
        });
    }
}



const existeCta = async (id) => {

    const myquery = `SELECT [id] ,[tipo] ,[descripcion] FROM [dbo].[Catalogo] WHERE id = '${id}'`;

    await sql.close();
    const pool = await sql.connect(configBDConn);
    const result = await pool.request().query(myquery);
    const { recordset } = result;

    if (recordset.length === 1)
        return true;
    else
        return false;
}


module.exports = { onGetCtaContable, onNewCtaContable, onUpdateCtaContable, onDeleteCtaContable, };