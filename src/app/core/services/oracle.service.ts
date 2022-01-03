import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { isNotEmpty } from 'class-validator';
import { environment, getEnvironmentParam, IS_LOCAL, MAX_POOL_CONNECTIONS, NODE_ENV, POOL_ALIAS_JA, POOL_ALIAS_JP } from 'src/app/core/environment';
import oracle, { getPool } from 'oracledb';
import { JSONArrayToLowerCase } from './functions.service';
import { BasicResponse } from '../models/basic-response.model';

@Injectable()
export class OracleService {

  private static async getConnectionConfigJA(procedure: boolean = false): Promise<oracle.PoolAttributes> {
    const config: oracle.PoolAttributes = {
      connectString: await getEnvironmentParam("JAMAR_DB_SEUS_HOST", `JAMAR_DB_SEUS_HOST_${NODE_ENV}`) + `:1521/` + await getEnvironmentParam("JAMAR_DB_SEUS_DATABASE", `JAMAR_DB_SEUS_DATABASE_${NODE_ENV}`),
      user: await getEnvironmentParam("JAMAR_DB_SEUS_USER", `JAMAR_DB_SEUS_USER_${NODE_ENV}`),
      password: await getEnvironmentParam("JAMAR_DB_SEUS_PASSWORD", `JAMAR_DB_SEUS_PASSWORD_${NODE_ENV}`),
      poolAlias: POOL_ALIAS_JA,
      poolMax: MAX_POOL_CONNECTIONS,
      poolTimeout: procedure ? 900 : 60
    }
    return config
  }

  private static async getConnectionConfigJP(procedure: boolean = false): Promise<oracle.PoolAttributes> {
    const config = {
      connectString: await getEnvironmentParam("JAMAR_DB_SEUS_HOST_JP", `JAMAR_DB_SEUS_HOST_JP_${NODE_ENV}`) + `:1521/` + await getEnvironmentParam("JAMAR_DB_SEUS_DATABASE", `JAMAR_DB_SEUS_DATABASE_${NODE_ENV}`),
      user: await getEnvironmentParam("JAMAR_DB_SEUS_USER_JP", `JAMAR_DB_SEUS_USER_JP_${NODE_ENV}`),
      password: await getEnvironmentParam("JAMAR_DB_SEUS_PASSWORD_JP", `JAMAR_DB_SEUS_PASSWORD_JP_${NODE_ENV}`),
      poolAlias: POOL_ALIAS_JP,
      poolMax: MAX_POOL_CONNECTIONS,
      poolTimeout: procedure ? 900 : 60
    }
    return config
  }

  private static async getConnectionConfig(company: "JA" | "JP", procedure: boolean = false): Promise<oracle.PoolAttributes> {
    switch (company) {
      case "JA": return await this.getConnectionConfigJA(procedure)
      case "JP": return await this.getConnectionConfigJP(procedure)
      default: throw new Error("Esta compañia no está permitida para conectarse a Oracle");
    }
  }

  /**
   * Execute an Oracle query
   * @param company 
   * @param query 
   * @returns 
   */
  public static async query(company: "JA" | "JP" = "JA", query: string = "SELECT * FROM nits WHERE rownum <= 5"): Promise<BasicResponse> {
    let conn: oracle.Connection | undefined = undefined
    let pool: oracle.Pool
    query = query.trim()
    if (!isNotEmpty(query)) {
      throw new Error("No has especificado el query a ejecutar.");
    }
    try {
      pool = await this.getPool(company);
      conn = await pool.getConnection()
      const result = await conn.execute(query, {}, { outFormat: oracle.OUT_FORMAT_OBJECT, autoCommit: true });
      environment.db.logs ? console.debug(query) : ""
      return new BasicResponse(true, "Consulta exitosa", result.rows.length > 0 ? JSONArrayToLowerCase(result.rows) : result.rows);
    } catch (error) {
      error = this.getOracleError(error)
      return new BasicResponse(false, error.message, undefined, error)
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (error) {
          console.error(error)
          return new BasicResponse(false, "Error al finalizar la sesión de oracle", undefined, error)
        }
      }
    }
  }

  /**
   * 
   * Ejecutar Oracle PL/SQL procedure
   * 
   * Example:
   * 
   * procedureDeclaration = "fvcbuscarparamsicf(:pe_vcemp, :pe_vcmodulo, :pe_vccodparamred, :ps_vcerrorm)"
   * bindParameters = {
   *     pe_vcemp:  'JA', //Primera forma de especificarlo
   *     pe_vcmodulo: { val: '0002', dir: oracledb.BIND_IN }, ---//segunda forma de especificarlo
   *     pe_vccodparamred: 'GC_DIAS_HIST',
   *     ps_vcerrorm:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
   * }
   * @param company 
   * @param procedureDeclaration procedure name with params (also use package name if necesary)
   * @param bindParameters --> use node-oracledb documentation to know about bind parameters oracle.BindParameters
   * @returns 
   */
  public static async procedure(company: "JA" | "JP" = "JA", procedureDeclaration: string, bindParameters: oracle.BindParameters): Promise<BasicResponse> {
    let conn: oracle.Connection | undefined = undefined
    let pool: oracle.Pool
    if (!isNotEmpty(procedureDeclaration)) {
      throw new Error("No has especificado el procedimiento a ejecutar.");
    }
    try {
      const query = `BEGIN
          ${procedureDeclaration};
       END;`

      pool = await this.getPool(company);
      conn = await pool.getConnection()

      const result = await conn.execute(query, bindParameters, { outFormat: oracle.OUT_FORMAT_OBJECT, autoCommit: true });
      environment.db.logs ? console.debug(query) : ""
      return new BasicResponse(true, "Consulta exitosa", result);
    } catch (error) {
      console.error(error, error.stack)
      error = this.getOracleError(error)
      return new BasicResponse(false, error.message, undefined, error)
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (error) {
          console.error(error, error.stack)
          return new BasicResponse(false, "Error al finalizar la sesión de oracle", undefined, error)
        }
      }
    }
  }

  /**
     * 
     * Ejecutar Oracle PL/SQL procedure
     * 
     * Example:
     * 
     * functionDeclaration = "fvcbuscarparamsicf(:pe_vcemp, :pe_vcmodulo, :pe_vccodparamred, :ps_vcerrorm)"
     * bindParameters = {
     *     pe_vcemp:  'JA', //Primera forma de especificarlo
     *     pe_vcmodulo: { val: '0002', dir: oracledb.BIND_IN }, ---//segunda forma de especificarlo
     *     pe_vccodparamred: 'GC_DIAS_HIST',
     *     ps_vcerrorm:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
     * }
     * @param company 
     * @param functionDeclaration function name with params (also use package name if necesary)
     * @param bindParameters --> use node-oracledb documentation to know about bind parameters oracle.BindParameters
     * @returns 
     */
  public static async function(company: "JA" | "JP" = "JA", functionDeclaration: string, bindParameters: oracle.BindParameters): Promise<BasicResponse> {
    let conn: oracle.Connection | undefined = undefined
    let pool: oracle.Pool
    if (!isNotEmpty(functionDeclaration)) {
      throw new Error("No has especificado el procedimiento a ejecutar.");
    }
    try {
      const query = `BEGIN
         :result := ${functionDeclaration};
       END;`

      pool = await this.getPool(company);
      conn = await pool.getConnection()

      const response = await conn.execute(query, { ...bindParameters, result: { dir: OracleService.BIND_OUT } }, { outFormat: oracle.OUT_FORMAT_OBJECT, autoCommit: true });
      environment.db.logs ? console.debug(query) : ""
      return new BasicResponse(true, "Consulta exitosa", response);
    } catch (error) {
      console.error(error, error.stack)
      error = this.getOracleError(error)
      return new BasicResponse(false, error.message, undefined, error)
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (error) {
          console.error(error, error.stack)
          return new BasicResponse(false, "Error al finalizar la sesión de oracle", undefined, error)
        }
      }
    }
  }

  private static getPoolAlias(company: string = "JA") {
    switch (company) {
      case "JA": return POOL_ALIAS_JA
      case "JP": return POOL_ALIAS_JP
      default: throw new Error(`No se reconoce esta compañia: '${company}'`);
    }
  }

  /**
   * Gestiona la creacion o reutilizacion del pool de conexion
   * @param company 
   * @returns 
   */
  private static async getPool(company: "JA" | "JP" = "JA", procedure: boolean = false): Promise<oracle.Pool> {
    const pool_alias = this.getPoolAlias(company)
    try {
      const pool = oracle.getPool(pool_alias)
      console.debug("Reutilizando Pool de Oracle")
      return pool
    } catch (error) {
      const err = this.getOracleError(error)
      if (err.message.includes("No se encontró el POOL")) {
        const pool = oracle.createPool(await this.getConnectionConfig(company, procedure))
        console.debug("Creando Pool de Oracle")
        return pool
      } else {
        console.error(err,error, error.stack)
        throw new InternalServerErrorException(err);
      }
    }
  }

  /**
   * 
   * Ejecutar Oracle PL/SQL procedure
   * 
   * Example:
   * 
   * procedureDeclaration = "fvcbuscarparamsicf(:pe_vcemp, :pe_vcmodulo, :pe_vccodparamred, :ps_vcerrorm)"
   * bindParameters = {
   *     pe_vcemp:  'JA', //Primera forma de especificarlo
   *     pe_vcmodulo: { val: '0002', dir: oracledb.BIND_IN }, ---//segunda forma de especificarlo
   *     pe_vccodparamred: 'GC_DIAS_HIST',
   *     ps_vcerrorm:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
   * }
   * @param company 
   * @param procedureDeclaration procedure name with params (also use package name if necesary)
   * @param bindParameters --> use node-oracledb documentation to know about bind parameters oracle.BindParameters
   * @returns 
   */
  public async procedure(company: "JA" | "JP" = "JA", procedureDeclaration: string, bindParameters: oracle.BindParameters) {
    return await OracleService.procedure(company, procedureDeclaration, bindParameters)
  }


  /**
    * Execute an Oracle query
    * @param company 
    * @param query 
    * @returns 
    */
  public async query(company: "JA" | "JP" = "JA", query: string = "SELECT * FROM nits WHERE rownum <= 50000") {
    return await OracleService.query(company, query)
  }

  private static getOracleError(error, company: "JA" | "JP" = "JA"): { message, err, stack } {
    let message = "ORACLE: Error al consultar la base de datos"
    if (error.stack.includes("TNS:Se ha producido un timeout de conexión")) message = IS_LOCAL ? "ORACLE: Es probable que no esté conectado a la VPN o que esta consulta esté tardando más de lo normal" : error.stack
    if (error.stack.includes("not found in the connection pool cache")) message = `ORACLE: No se encontró el POOL de conexión llamado '${this.getPoolAlias(company)}' en el caché de conexiones.`
    const newError = {
      message,
      err: error,
      stack: error.stack,
    }
    return newError
  }

  public static BIND_OUT = oracle.BIND_OUT
  public static BIND_IN = oracle.BIND_IN
  public static BIND_INOUT = oracle.BIND_INOUT
}
