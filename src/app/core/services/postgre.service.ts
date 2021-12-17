import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { isNotEmpty } from 'class-validator';
import { Pool, PoolConfig, QueryArrayResult } from 'pg';
import { environment, getEnvironmentParam, NODE_ENV } from 'src/app/core/environment';

@Injectable()
export class PostgreService {

  private static async getConnectionConfig(): Promise<PoolConfig> {
    return {
      database: await getEnvironmentParam("JAMAR_DB_MEC_EXTENDED_DATABASE", `JAMAR_DB_MEC_EXTENDED_DATABASE_${NODE_ENV}`),
      port: 5432,
      host: await getEnvironmentParam("JAMAR_DB_MEC_EXTENDED_HOST", `JAMAR_DB_MEC_EXTENDED_HOST_${NODE_ENV}`),
      user: await getEnvironmentParam("JAMAR_DB_MEC_EXTENDED_USER", `JAMAR_DB_MEC_EXTENDED_USER_${NODE_ENV}`),
      password: await getEnvironmentParam("JAMAR_DB_MEC_EXTENDED_PASSWORD", `JAMAR_DB_MEC_EXTENDED_PASSWORD_${NODE_ENV}`),
      idleTimeoutMillis: 60000, //Tiempo maximo de sesión (60 segundos)
    }
  }

  public static async query(query: string = "SELECT * FROM products LIMIT 5") {
    query = query.trim()
    if (!isNotEmpty(query)) {
      throw new Error("No se puede ejecutar una consulta vacía.");
    }
    const conn = new Pool(await this.getConnectionConfig())
    const { fields, rows } = await conn.query(query);
    await conn.end()
    console.log(rows)
    environment.db.logs ? console.debug(query) : ""
    return rows;
  }

  async query(query: string) {
    query = query.trim()
    if (!isNotEmpty(query)) {
      throw new Error("No se puede ejecutar una consulta vacía.");
    }
    // const conn = mysql.createPool(PostgreService.connection).promise();
    // const [rows, fields] = await conn.query(query);
    // await conn.end()
    // environment.db.logs ? console.debug(query) : ""
    // return rows;
    return [];
  }
}
