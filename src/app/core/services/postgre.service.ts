import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { isNotEmpty } from 'class-validator';
import { Pool, PoolConfig, QueryArrayResult } from 'pg';
import pg from 'pg';
import { environment, getEnvironmentParam, NODE_ENV } from 'src/app/core/environment';
import { BasicResponse } from '../models/basic-response.model';

@Injectable()
export class PostgreService {

  private static async getConnectionConfig(): Promise<PoolConfig> {
    const result: PoolConfig = {
      database: await getEnvironmentParam("JAMAR_DB_MEC_EXTENDED_DATABASE", `JAMAR_DB_MEC_EXTENDED_DATABASE_${NODE_ENV}`),
      port: 5432,
      host: await getEnvironmentParam("JAMAR_DB_MEC_EXTENDED_HOST", `JAMAR_DB_MEC_EXTENDED_HOST_${NODE_ENV}`),
      user: await getEnvironmentParam("JAMAR_DB_MEC_EXTENDED_USER", `JAMAR_DB_MEC_EXTENDED_USER_${NODE_ENV}`),
      password: await getEnvironmentParam("JAMAR_DB_MEC_EXTENDED_PASSWORD", `JAMAR_DB_MEC_EXTENDED_PASSWORD_${NODE_ENV}`),
      //Tiempo maximo de sesión (60 segundos),
      idleTimeoutMillis: 60000,
      query_timeout: 10000, //Los queries están limitados a 10 segundos
      idle_in_transaction_session_timeout: 60000

    }
    return result
  }

  public static async query(query: string = "SELECT * FROM products LIMIT 5") {
    let conn
    try {
      query = query.trim()
      if (!isNotEmpty(query)) {
        throw new Error("No se puede ejecutar una consulta vacía.");
      }
      conn = new Pool(await this.getConnectionConfig())
      const { fields, rows } = await conn.query(query);
      environment.db.logs ? console.debug(query) : ""
      return new BasicResponse(true, "Consulta exitosa", rows);
    } catch (error) {
      console.error(error, error.stack)
      return new BasicResponse(false, "Error en la consulta a postgre", undefined, { stack: error.stack, err: error })
    } finally {
      if (conn) {
        try {
          await conn.end()
        } catch (error) {
          console.error(error, error.stack)
          return new BasicResponse(false, "Error cerrando la sesión de MySQL", undefined, error)
        }
      }
    }
  }

  async query(query: string) {
    return await PostgreService.query(query)
  }
}
