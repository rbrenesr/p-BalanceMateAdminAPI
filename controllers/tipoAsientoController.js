const { configBD } = require('../database/config');
const { response, request } = require("express");
const sql = require('mssql');

let configBDConn = '';

const onGetTipoAsiento = async (req, res = response) => {

    try {

        const db = req.db;
        const configBDConn = { ...configBD, database: db };

        let clave = req.params.clave;
        let valor = req.params.valor;
        let where = '';

        if (!valor) valor = '';
        if (!clave) clave = 'nombre';

        const cols = ['id', 'nombre'];
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


        const myquery = `SELECT [id], [nombre] 
        FROM [dbo].[TipoAsiento] ${where}`;

        await sql.close();
        const pool = await sql.connect(configBDConn);
        const result = await pool.request().query(myquery);
        const rsTipoAsiento = result.recordset;

        if (rsTipoAsiento.length < 1) {
            return res.status(200).json({
                ok: false,
                msg: `No existe datos para la búsqueda proporcionada por = ${valor} en ${clave}`,
                usuario: recordset[0],
            });
        }

        return res.status(200).json({
            ok: true,
            msg: `Tipos de Asiento`,
            tipoAsiento: rsTipoAsiento,
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
const onNewTipoAsiento = async (req, res = response) => {

    const db = req.db;
    configBDConn = { ...configBD, database: db };

    const { id, nombre } = req.body;

    if (!id || !nombre) {
        return res.status(400).json({
            ok: false,
            msg: 'Valores requeridos no proporcionados { id, nombre }.',
        });
    }

    try {

        if (await existeTipoAsiento(id)) {
            return res.status(409).json({
                ok: false,
                msg: `La tipo asiento ${id} ya se encuentra registrada.`
            });
        }

        await sql.close();
        const pool = await sql.connect(configBDConn);
        let result = await pool.request()
            .input('id', sql.VarChar, id)
            .input('nombre', sql.VarChar, nombre)            
            .query('INSERT INTO [dbo].[TipoAsiento] ( id, nombre ) ' +
                'OUTPUT inserted.id VALUES ( @id, @nombre )');

        const newTipoAsientoId = result.recordset[0].id;

        return res.status(200).json({
            ok: true,
            msg: 'Tipo Asiento ingresado correctamente.',
            id: newTipoAsientoId

        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar el ingreso del nuevo tipo de asiento.',
            msgSystem: error.originalError.info.message
        });
    }


}
const onUpdateTipoAsiento = async(req, res = response) => {

    const db = req.db;
    const tipoAsientoId = req.params.id;
    configBDConn = { ...configBD, database: db };


    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({
            ok: false,
            msg: 'Valores requeridos no proporcionados { nombre }.',
        });
    }

    try {

        if (!await existeTipoAsiento(tipoAsientoId)) {
            return res.status(409).json({
                ok: false,
                msg: `El tipo asiento ${tipoAsientoId} que desea actualizar no se encuentra registrado.`
            });
        }

        await sql.close();
        const pool = await sql.connect(configBDConn);
        let result = await pool.request()                       
            .query(`UPDATE[dbo].[TipoAsiento] SET 
                        nombre = '${nombre}'
                    WHERE id = '${tipoAsientoId}'`);

        return res.status(200).json({
            ok: true,
            msg: 'Tipo Asiento actualizado correctamente.',            

        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar la actualización del tipo de asiento.',
            msgSystem: error.originalError.info.message
        });
    }
}
const onDeleteTipoAsiento = async (req, res = response) => {




    const db = req.db;
    const tipoAsientoId = req.params.id;
    configBDConn = { ...configBD, database: db };

    try {

        if (!await existeTipoAsiento(tipoAsientoId)) {
            return res.status(409).json({
                ok: false,
                msg: `El tipo asiento ${tipoAsientoId} que desea eliminar no se encuentra registrado.`
            });
        }

        await sql.close();
        const pool = await sql.connect(configBDConn);
        let result = await pool.request()                       
            .query(`DELETE FROM [dbo].[TipoAsiento] 
                    WHERE id = '${tipoAsientoId}'`);

        return res.status(200).json({
            ok: true,
            msg: 'Tipo Asiento eliminado correctamente.',            

        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar la eliminación del tipo de asiento.',
            msgSystem: error.originalError.info.message
        });
    }

}



const existeTipoAsiento = async (id) => {

    const myquery = `SELECT [id] ,[nombre] FROM [dbo].[TipoAsiento] WHERE id = '${id}'`;

    await sql.close();
    const pool = await sql.connect(configBDConn);
    const result = await pool.request().query(myquery);
    const { recordset } = result;

    if (recordset.length === 1)
        return true;
    else
        return false;
}


module.exports = { onGetTipoAsiento, onNewTipoAsiento, onUpdateTipoAsiento, onDeleteTipoAsiento, };