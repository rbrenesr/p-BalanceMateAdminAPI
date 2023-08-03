const { response, request } = require("express");
const fs = require('fs');
const { configBD } = require('../database/config');
const DatabaseManager = require('../database/DatabaseManager');

const onNewEmpresa = async (req = request, res = response) => {

  const uid = req.id;

  let { baseDatos, cedula, nombre, correo, telefonoUno, telefonoDos, paginaWeb, direccion,
    repNombre, repCedula, repTelefono, repCorreo, estado } = req.body;

  baseDatos = baseDatos || '';
  telefonoUno = telefonoUno || '';
  telefonoDos = telefonoDos || '';
  paginaWeb = paginaWeb || '';
  direccion = direccion || '';
  repTelefono = repTelefono || '';
  estado = estado || '1';

  if (await findEmpresaByCedula(cedula)) {
    return res.status(409).json({
      ok: false,
      msg: 'La empresa ya se encuentra registrada.'
    });
  }


  let newbaseDatos = '';
  let newEmp = 0;

  const dbManager = new DatabaseManager(configBD);
  await dbManager.connect();

  try {

    await dbManager.beginTransaction();

    const empresaResult = await dbManager.executeQuery(
      `INSERT INTO Empresa ( baseDatos, cedula, nombre, correo, telefonoUno, telefonoDos, paginaWeb, direccion, repNombre, repCedula, repTelefono, repCorreo, estado )
       OUTPUT inserted.id VALUES ( @baseDatos, @cedula,@nombre,@correo,@telefonoUno,@telefonoDos,@paginaWeb,@direccion,@repNombre,@repCedula,@repTelefono,@repCorreo,@estado )`
      , { baseDatos, cedula, nombre, correo, telefonoUno, telefonoDos, paginaWeb, direccion, repNombre, repCedula, repTelefono, repCorreo, estado }
    );

    const newId = empresaResult[0].id;

    await dbManager.executeQuery(
      `INSERT INTO UsuarioEmpresa ( usuarioId, empresaId ) VALUES ( @uid, @newId )`
      , { uid, newId }
    )

    await dbManager.commitTransaction();

    const newbaseDatosResult = await dbManager.executeProcedure('SPCrearEmpresa', { id: newId, cedula });
    newbaseDatos = newbaseDatosResult[0].nombre;

    await dbManager.executeQuery(`UPDATE dbo.Empresa set baseDatos = '${newbaseDatos}' where id = ${newId}`);

    newEmp = (await dbManager.executeQuery(
      `SELECT [id],[baseDatos],[cedula],[nombre],[correo],[telefonoUno],[telefonoDos],[paginaWeb],[direccion],[repNombre],
      [repCedula],[repTelefono],[repCorreo],[estado]
      FROM Empresa WHERE id = ${newId}`
    ))[0];

  } catch (error) {
    console.log(error.message);
    await dbManager.rollbackTransaction();
    res.status(500).json({
      ok: false,
      msg: 'Error al procesar nuevo ingreso.',
      msgSystem: error
    });
  }
  finally {
    await dbManager.disconnect();
  }


  //Nuevo contexto
  const configBDNew = { ...configBD, database: newbaseDatos };
  const dbManagerNewContext = new DatabaseManager(configBDNew);
  await dbManagerNewContext.connect();

  try {
    const sqlBatch = fs.readFileSync("./database/scripts/createDataBase.sql", "utf-8");
    await dbManagerNewContext.executeBatch(sqlBatch);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al procesar nuevo ingreso.',
      msgSystem: error
    });

  }
  finally {
    await dbManagerNewContext.disconnect();
  }

  return res.status(200).json({
    ok: true,
    msg: 'Empresa ingresada correctamente',
    newbaseDatos,
    newEmp
  });

};

const onGetEmpresa = async (req = request, res = response) => {

  try {

    let clave = req.params.clave;
    let valor = req.params.valor;
    let where = '';

    if (!valor) valor = '';
    if (!clave) clave = 'nombre';

    const cols = ['id', 'cedula', 'nombre', 'direccion', 'baseDatos', 'estado'];
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
      where = `WHERE ${clave} = ${valor}`;
    }
    else
      where = `WHERE ${clave} like '%${valor}%'`;


    const myquery = `SELECT [id],[baseDatos],[cedula],[nombre],[correo],[telefonoUno],[telefonoDos],[paginaWeb],
                        [direccion],[repNombre],[repCedula],[repTelefono],[repCorreo],[estado]
                      FROM [dbo].[Empresa] ${where}`;


    const dbManager = new DatabaseManager(configBD);
    await dbManager.connect();
    const result = await dbManager.executeQuery(myquery);
    await dbManager.disconnect();


    if (result.length < 1) {
      return res.status(200).json({
        ok: false,
        msg: `No existe datos para la búsqueda proporcionada por = ${valor} en ${clave}`,
        usuario: recordset[0],
      });
    }

    return res.status(200).json({
      ok: true,
      msg: `Empresas seleccionadas`,
      empresa: result,
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al procesar la selección del datos.',
      msgSystem: error
    });
  }
}

const onUpdateEmpresa = async (req = request, res = response) => {

  const id = req.params.id;
  let { nombre, correo, telefonoUno, telefonoDos, paginaWeb, direccion, repNombre, repCedula, repTelefono, repCorreo } = req.body;

  telefonoUno = telefonoUno || '';
  telefonoDos = telefonoDos || '';
  paginaWeb = paginaWeb || '';
  direccion = direccion || '';
  repTelefono = repTelefono || '';

  if (!id) {
    return res.status(400).json({
      ok: false,
      msg: `EL id es requerido.`
    });
  }

  if (!await findEmpresaById(id)) {
    return res.status(404).json({
      ok: false,
      msg: `No se encuentran datos con el id ${id}`
    });
  }

  const dbManager = new DatabaseManager(configBD);
  await dbManager.connect();

  try {

    await dbManager.beginTransaction();

    const result = await dbManager.executeQuery(
      `UPDATE [dbo].[Empresa]
      SET [nombre] = @nombre
        ,[correo] = @correo
        ,[telefonoUno] = @telefonoUno
        ,[telefonoDos] = @telefonoDos
        ,[paginaWeb] = @paginaWeb
        ,[direccion] = @direccion
        ,[repNombre] = @repNombre
        ,[repCedula] = @repCedula
        ,[repTelefono] = @repTelefono
        ,[repCorreo] =    @repCorreo   
      WHERE id = ${id}`
      , { nombre, correo, telefonoUno, telefonoDos, paginaWeb, direccion, repNombre, repCedula, repTelefono, repCorreo }
    );
    
  
    if (result != 1) {
      return res.status(400).json({
        ok: false,
        msg: `No se actualizaron registros en la base de datos para ${id}.`,
        empresa: newEmp,
      });
    }

    const empUpdated = (await dbManager.executeQuery(
      `SELECT [id],[baseDatos],[cedula],[nombre],[correo],[telefonoUno],[telefonoDos],[paginaWeb],
      [direccion],[repNombre],[repCedula],[repTelefono],[repCorreo],[estado]
      FROM [dbo].[Empresa]
      WHERE id = ${id}`))[0];
    

    await dbManager.commitTransaction();

    return res.status(200).json({
      ok: true,
      msg: 'Empresa actualizada correctamente.',
      empUpdated: empUpdated,
    });

  } catch (error) {
    await dbManager.rollbackTransaction();
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al procesar actualización de empresa.',
      msgSystem: error
    });

  } finally {
    await dbManager.disconnect();
  }
};


const findEmpresaByCedula = async (cedula) => {

  const dbManager = new DatabaseManager(configBD);
  await dbManager.connect();
  const result = await dbManager.executeQuery(`SELECT 1 FROM Empresa WHERE cedula = '${cedula}'`);
  await dbManager.disconnect();

  if (result.length === 1)
    return true;
  else
    return false;
}

const findEmpresaById = async (id) => {

  const dbManager = new DatabaseManager(configBD);
  await dbManager.connect();
  const result = await dbManager.executeQuery(`SELECT 1 FROM Empresa WHERE id = '${id}'`);
  await dbManager.disconnect();

  if (result.length === 1)
    return true;
  else
    return false;

}

module.exports = { onNewEmpresa, onGetEmpresa, onUpdateEmpresa };