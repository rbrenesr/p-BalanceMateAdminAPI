const sql = require('mssql');


class DatabaseManager {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = await sql.connect(this.config);
      console.log('Conexión a la base de datos establecida.');
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
    }
  }

  async disconnect() {
    try {
      await this.pool.close();
      console.log('Conexión a la base de datos cerrada.');
    } catch (error) {
      console.error('Error al cerrar la conexión:', error);
    }
  }

  async executeQuery(query, params) {
    try {
      const request = this.pool.request();

      if (params) {
        // Agregar los parámetros a la consulta
        Object.keys(params).forEach((name) => {
          request.input(name, params[name]);
        });
      }

      const result = await request.query(query);
      console.log('executeQuery ejecutado.');

      if (result.recordset)
        return result.recordset;

      if (result.recordsets.length > 0)
        return result.recordsets;

      if (result.rowsAffected)
        return result.rowsAffected;

      return result;

    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      throw error;
    }
  }

  async executeProcedure(procedureName, params) {
    try {
      const request = this.pool.request();

      if (params) {
        // Agregar los parámetros al procedimiento almacenado
        Object.keys(params).forEach((name) => {
          request.input(name, params[name]);
        });
      }

      const result = await request.execute(procedureName);
      console.log('executeProcedure ejecutado.')
      return result.recordset;
    } catch (error) {
      console.error('Error al ejecutar el procedimiento almacenado:', error);
      throw error;
    }
  }

  async executeBatch(batchQuery) {
    try {
      const request = this.pool.request();
      const result = await request.batch(batchQuery);
      console.log('executeBatch ejecutado.')
      return result;
    } catch (error) {
      console.error('Error al ejecutar el batch:', error);
      throw error;
    }
  }

  async beginTransaction() {
    try {
      this.transaction = new sql.Transaction(this.pool);
      await this.transaction.begin();
      console.log('Transacción iniciada.');
    } catch (error) {
      console.error('Error al iniciar la transacción:', error);
    }
  }
  async commitTransaction() {
    try {
      await this.transaction.commit();
      console.log('Transacción confirmada.');
    } catch (error) {
      console.error('Error al confirmar la transacción:', error);
    }
  }
  async rollbackTransaction() {
    try {
      await this.transaction.rollback();
      console.log('Transacción revertida.');
    } catch (error) {
      console.error('Error al revertir la transacción:', error);
    }
  }
}

module.exports = DatabaseManager;
