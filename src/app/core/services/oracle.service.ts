import { Injectable } from '@nestjs/common';
import { isNotEmpty } from 'class-validator';
import { environment, getEnvironmentParam, NODE_ENV } from 'src/app/core/environment';
import oracle from 'oracledb';
import { JSONArrayToLowerCase } from './functions.service';
oracle.poolTimeout = 60 //Duración de la sesión

@Injectable()
export class OracleService {

  private static async getConnectionConfigJA(): Promise<oracle.ConnectionAttributes> {
    const config = {
      connectString: await getEnvironmentParam("JAMAR_DB_SEUS_HOST", `JAMAR_DB_SEUS_HOST_${NODE_ENV}`) + `:1521/` + await getEnvironmentParam("JAMAR_DB_SEUS_DATABASE", `JAMAR_DB_SEUS_DATABASE_${NODE_ENV}`),
      user: await getEnvironmentParam("JAMAR_DB_SEUS_USER", `JAMAR_DB_SEUS_USER_${NODE_ENV}`),
      password: await getEnvironmentParam("JAMAR_DB_SEUS_PASSWORD", `JAMAR_DB_SEUS_PASSWORD_${NODE_ENV}`),
    }
    return config
  }

  private static async getConnectionConfigJP(): Promise<oracle.ConnectionAttributes> {
    const config = {
      connectString: await getEnvironmentParam("JAMAR_DB_SEUS_HOST_JP", `JAMAR_DB_SEUS_HOST_JP_${NODE_ENV}`) + `:1521/` + await getEnvironmentParam("JAMAR_DB_SEUS_DATABASE", `JAMAR_DB_SEUS_DATABASE_${NODE_ENV}`),
      user: await getEnvironmentParam("JAMAR_DB_SEUS_USER_JP", `JAMAR_DB_SEUS_USER_JP_${NODE_ENV}`),
      password: await getEnvironmentParam("JAMAR_DB_SEUS_PASSWORD_JP", `JAMAR_DB_SEUS_PASSWORD_JP_${NODE_ENV}`),
    }
    return config
  }

  /**
   * Execute an Oracle query
   * @param company 
   * @param query 
   * @returns 
   */
  public static async query(company: "JA" | "JP" = "JA", query: string = "SELECT * FROM nits WHERE rownum <= 5") {
    query = query.trim()
    if (!isNotEmpty(query)) {
      throw new Error("No se puede ejecutar una consulta vacía.");
    }
    let config = await this.getConnectionConfigJA()
    if (company == "JP") config = await this.getConnectionConfigJP()
    const conn = await oracle.getConnection(config)
    const result = await conn.execute(query, {}, { outFormat: oracle.OUT_FORMAT_OBJECT, autoCommit: true });
    await conn.close()
    environment.db.logs ? console.debug(query) : ""
    return JSONArrayToLowerCase(result.rows);
  }

  /**
   * Executes a Oracle PL/SQL procedure
   * @param name procedure name (also use package name if necesary)
   * @param params 
   */
  public static async procedure(company: "JA" | "JP" = "JA", name: string, params: object) { }

  /**
   * Executes a Oracle PL/SQL procedure
   * @param name procedure name (also use package name if necesary)
   * @param params 
   */
  public async procedure(company: "JA" | "JP" = "JA", name: string, params: object) { }

  /**
    * Execute an Oracle query
    * @param company 
    * @param query 
    * @returns 
    */
  public async query(company: "JA" | "JP" = "JA", query: string = "SELECT * FROM nits WHERE rownum <= 50000") {
    query = query.trim()
    if (!isNotEmpty(query)) {
      throw new Error("No se puede ejecutar una consulta vacía.");
    }
    let config = await OracleService.getConnectionConfigJA()
    if (company == "JP") config = await OracleService.getConnectionConfigJP()
    const conn = await oracle.getConnection(config)
    const result = await conn.execute(query, {}, { outFormat: oracle.OUT_FORMAT_OBJECT, autoCommit: true });
    await conn.close()
    environment.db.logs ? console.debug(query) : ""
    return JSONArrayToLowerCase(result.rows);
  }
}
