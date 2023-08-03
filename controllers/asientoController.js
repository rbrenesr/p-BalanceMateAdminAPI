const { configBD } = require('../database/config');
const { response, request } = require("express");
const sql = require('mssql');

let configBDConn = '';


const onGetAsiento = async (req, res = response) => {

    try {

        const db = req.db;
        const configBDConn = { ...configBD, database: db };

        let clave = req.params.clave;
        let valor = req.params.valor;
        let where = '';

        if (!valor) valor = '';
        if (!clave) clave = 'id';

        const cols = ['id', 'idTipoAsiento', 'fecha', 'concepto', 'idMoneda'];
        if (!cols.includes(clave)) {
            return res.status(422).json({
                ok: false,
                msg: 'Es requerido una clave de búsqueda válida.',
            });
        }

        where = `WHERE A.${clave} like '%${valor}%'`;

        const myquery = `SELECT 
                            A.[id] Eid
                            ,A.[idTipoAsiento] EidTipoAsiento
                            ,A.[fecha] Efecha
                            ,A.[concepto] Econcepto
                            ,A.[idMoneda] EidMoneda
                            ,A.[tipoTasa] EtipoTasa
                            ,A.[tasa] Etasa
                            ,A.[totalDebe]	EtotalDebe
                            ,A.[totalHaber]	EtotalHaber
                            ,A.[totalDebeL]	EtotalDebeL
                            ,A.[totalHaberL] EtotalHaberL
                            ,A.[idUsuario] EidUsuario
                            ,D.[id]
                            ,D.[idAsiento]
                            ,D.[idCatalogo]
                            ,D.[observaciones]
                            ,D.[idTipoDocumento]
                            ,D.[numeroDocumento]
                            ,D.[idTercero]
                            ,D.[moneda]
                            ,D.[tipoTasa]
                            ,D.[tasa]
                            ,D.[totalDebe]
                            ,D.[totalHaber]
                            ,D.[totalDebeL]
                            ,D.[totalHaberL]
                            ,D.[idUsuario]
                        FROM [dbo].[Asiento] A
                        INNER JOIN [dbo].[AsientoDetalle] D
                        ON A.id = D.idAsiento ${where}
                        ORDER BY Efecha DESC, Eid ASC`;

        await sql.close();
        const pool = await sql.connect(configBDConn);
        const result = await pool.request().query(myquery);
        const rsAsientos = result.recordset;

        if (rsAsientos.length < 1) {
            return res.status(200).json({
                ok: false,
                msg: `No existe datos para la búsqueda proporcionada por = ${valor} en ${clave}`,
                usuario: recordset[0],
            });
        }

        const asientos = [];
        let currentAsientoId = null;
        let currentAsiento = null;

        for (const row of rsAsientos) {
            if (row.Eid !== currentAsientoId) {
                // If a new order is found, create a new order object
                if (currentAsiento) {
                    asientos.push(currentAsiento);
                }

                currentAsientoId = row.Eid;
                currentAsiento = {
                    Eid: row.Eid
                    , EidTipoAsiento: row.EidTipoAsiento
                    , Efecha: row.Efecha
                    , Econcepto: row.Econcepto
                    , EidMoneda: row.EidMoneda
                    , EtipoTasa: row.EtipoTasa
                    , Etasa: row.Etasa
                    , EtotalDebe: row.EtotalDebe
                    , EtotalHaber: row.EtotalHaber
                    , EtotalDebeL: row.EtotalDebeL
                    , EtotalHaberL: row.EtotalHaberL
                    , EidUsuario: row.EidUsuario
                    , items: [],
                };
            }


            // Add the order item to the current order's items array
            currentAsiento.items.push({
                id: row.id
                , idAsiento: row.idAsiento
                , idCatalogo: row.idCatalogo
                , observaciones: row.observaciones
                , idTipoDocumento: row.idTipoDocumento
                , numeroDocumento: row.numeroDocumento
                , idTercero: row.idTercero
                , moneda: row.moneda
                , tipoTasa: row.tipoTasa
                , tasa: row.tasa
                , totalDebe: row.totalDebe
                , totalHaber: row.totalHaber
                , totalDebeL: row.totalDebeL
                , totalHaberL: row.totalHaberL
                , idUsuario: row.idUsuario
            });
        }

        // Push the last order into the orders array (if it exists)
        if (currentAsiento) {
            asientos.push(currentAsiento);
        }



        return res.status(200).json({
            ok: true,
            msg: `Asientos`,
            Asientos: asientos,
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

const onNewAsiento = async (req, res = response) => {

    const db = req.db;
    configBDConn = { ...configBD, database: db };
    const asiento = req.body;



    if (
        !asiento.Eid ||
        !asiento.EidTipoAsiento ||
        !asiento.Efecha ||
        !asiento.Econcepto ||
        !asiento.EidMoneda ||
        !asiento.EtipoTasa ||
        !asiento.Etasa ||
        !asiento.EtotalDebe ||
        !asiento.EtotalHaber ||
        !asiento.EtotalDebeL ||
        !asiento.EtotalHaberL ||
        !asiento.EidUsuario ||
        !asiento.items
    ) {
        return res.status(400).json({
            ok: false,
            msg: 'Valores requeridos no proporcionados { Eid, EidTipoAsiento, Efecha, Econcepto, EidMoneda, EtipoTasa, Etasa, EtotalDebe, EtotalHaber, EtotalDebeL, EtotalHaberL, EidUsuario, items }.'
        });
    }

    await sql.close();
    const dbConn = new sql.ConnectionPool(configBDConn);
    await dbConn.connect();
    const transaction = new sql.Transaction(dbConn);
    await transaction.begin();

    try {

        const asientoResult = await new sql.Request(transaction)
            .input('id', sql.VarChar, asiento.Eid)
            .input('idTipoAsiento', sql.VarChar, asiento.EidTipoAsiento)
            .input('fecha', sql.DateTime, asiento.Efecha)
            .input('concepto', sql.VarChar, asiento.Econcepto)
            .input('idMoneda', sql.VarChar, asiento.EidMoneda)
            .input('tipoTasa', sql.VarChar, asiento.EtipoTasa)
            .input('tasa', sql.Decimal, asiento.Etasa)
            .input('totalDebe', sql.Decimal, asiento.EtotalDebe)
            .input('totalHaber', sql.Decimal, asiento.EtotalHaber)
            .input('totalDebeL', sql.Decimal, asiento.EtotalDebeL)
            .input('totalHaberL', sql.Decimal, asiento.EtotalHaberL)
            .input('idUsuario', sql.Int, asiento.EidUsuario)
            .query(`INSERT INTO [dbo].[Asiento]([id],[idTipoAsiento],[fecha],[concepto],[idMoneda],[tipoTasa],[tasa],[totalDebe],[totalHaber],[totalDebeL],[totalHaberL],[idUsuario]) 
                    OUTPUT inserted.id VALUES ( @id,@idTipoAsiento,@fecha,@concepto,@idMoneda,@tipoTasa,@tasa,@totalDebe,@totalHaber,@totalDebeL,@totalHaberL,@idUsuario)`);


        const recordset = asientoResult.recordset;
        const newId = recordset[0].id;

        for (const item of asiento.items) {
            const query = `
            INSERT INTO [dbo].[AsientoDetalle]([id],[idAsiento],[idCatalogo],[observaciones],[idTipoDocumento],[numeroDocumento],[idTercero],[moneda],[tipoTasa],[tasa],[totalDebe],[totalHaber],[totalDebeL],[totalHaberL],[idUsuario])
            VALUES (${item.id}, '${item.idAsiento}', '${item.idCatalogo}', '${item.observaciones}', '${item.idTipoDocumento}', '${item.numeroDocumento}', ${item.idTercero}, '${item.moneda}', '${item.tipoTasa}', ${item.tasa}, ${item.totalDebe}, ${item.totalHaber}, ${item.totalDebeL}, ${item.totalHaberL}, ${item.idUsuario});`;

            await transaction.request().query(query);
        }

        await transaction.commit();

        return res.status(200).json({
            ok: true,
            msg: 'Registro ingresada correctamente',

        });

    } catch (error) {

        console.log("Error occurred during database insertion:", error.message);

        try {
            if (transaction) {
                // Rollback the transaction if it exists
                await transaction.rollback();
                console.log("Transaction rolled back successfully!");
            }
        } catch (rollbackError) {
            console.error("Error occurred during transaction rollback:", rollbackError.message);
        }

        // Respond with an error message
        return res.status(500).json({
            ok: false,
            msg: 'Error al procesar nuevo ingreso.',
            msgSystem: error.originalError ? error.originalError.info.message : "Unknown error occurred."
        });

    }
    finally {
        await dbConn.close();
    }
}

const onUpdateAsiento = async (req, res = response) => {

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
const onDeleteAsiento = async (req, res = response) => {




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


module.exports = { onGetAsiento, onGetAsiento, onNewAsiento, onUpdateAsiento, onDeleteAsiento, };