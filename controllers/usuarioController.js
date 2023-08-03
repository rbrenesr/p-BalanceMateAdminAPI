const { response, request } = require("express");
const { configBD } = require('../database/config');
const DatabaseManager = require('../database/DatabaseManager');
const { generarJWT } = require('../helpers/jwt');

const nuevoUsuario = async (req = request, res = response) => {

  let { correo, contrasena, nombre, direccion, telefono, estado } = req.body;

  if (!direccion) direccion = '';
  if (!telefono) telefono = '';
  if (!estado) estado = 1;

  if (await existeElUsuario(correo)) {
    return res.status(409).json({
      ok: false,
      msg: 'La cuenta ya se encuentra registrada.'
    });
  }

  const dbManager = new DatabaseManager(configBD);
  await dbManager.connect();

  try {


    const result1 = await dbManager.executeQuery(
      `INSERT INTO Usuario ( correo, contrasena, nombre, direccion, telefono, estado ) 
      OUTPUT inserted.id VALUES ( @correo, @contrasena, @nombre, @direccion, @telefono, @estado )`
      , { correo, contrasena, nombre, direccion, telefono, estado }
    );
    const newId = result1[0].id;

    const result2 = await dbManager.executeQuery(
      `SELECT id ,correo ,nombre ,direccion ,telefono ,estado FROM Usuario 
      WHERE id = ${newId}`
    );

    const _id = result2[0].id;
    const _nombre = result2[0].nombre;
    const token = await generarJWT(_id, _nombre);

    return res.status(200).json({
      ok: true,
      msg: 'Usuario ingresado correctamente',
      usuario: result2[0],
      token
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al procesar el ingreso del nuevo usuario.',
      msgSystem: error.originalError.info.message
    });
  } finally {
    await dbManager.disconnect();
  }

}

const obtenerUsuario = async (req = request, res = response) => {

  const dbManager = new DatabaseManager(configBD);
  await dbManager.connect();

  try {

    let clave = req.params.clave;
    let valor = req.params.valor;
    let where = '';

    if (!valor) valor = '';
    if (!clave) clave = 'nombre';

    const cols = ['id', 'correo', 'contrasena', 'nombre', 'direccion', 'telefono', 'estado'];
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


    const result = await dbManager.executeQuery(
      `SELECT id ,correo ,nombre ,direccion ,telefono ,estado 
      FROM Usuario ${where}`
    );

    if (result.length < 1) {
      return res.status(200).json({
        ok: false,
        msg: `No existe datos para la búsqueda proporcionada por = ${valor} en ${clave}`,
        usuario: result[0],
      });
    }

    return res.status(200).json({
      ok: true,
      msg: `Usuario seleccionado`,
      usuario: result,
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al procesar la selección del usuario.',
      msgSystem: error
    });
  } finally {
    await dbManager.disconnect();
  }
}

const existeElUsuario = async (correo) => {

  const dbManager = new DatabaseManager(configBD);
  await dbManager.connect();

  try {
    const result = await dbManager.executeQuery(`SELECT 1 FROM Usuario WHERE correo = '${correo}'`);
    if (result.length === 1)
      return true;
    else
      return false;
  } catch (error) {
    console.log(error)
  } finally {
    dbManager.disconnect();
  }

}

module.exports = { nuevoUsuario, obtenerUsuario };