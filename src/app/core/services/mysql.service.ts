import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { isNotEmpty } from 'class-validator';
import * as mysql from 'mysql2';
import { environment } from 'src/app/core/environment';

@Injectable()
export class MySqlService {

  private static connection = {
    charset: "environment.db.mysql.charset",
    host: "environment.db.mysql.host",
    port: 2020,
    user: "environment.db.mysql.user",
    password: "environment.db.mysql.password",
    database: "environment.db.mysql.database",
  }

  public static async query(query: string) {
    query = query.trim()
    if (!isNotEmpty(query)) {
      throw new Error("No se puede ejecutar una consulta vacía.");
    }
    const conn = mysql.createPool(this.connection).promise();
    const [rows, fields] = await conn.query(query);
    await conn.end()
    environment.db.logs ? console.debug(query) : ""
    return rows;
  }

  async query(query: string) {
    query = query.trim()
    if (!isNotEmpty(query)) {
      throw new Error("No se puede ejecutar una consulta vacía.");
    }
    const conn = mysql.createPool(MySqlService.connection).promise();
    const [rows, fields] = await conn.query(query);
    await conn.end()
    environment.db.logs ? console.debug(query) : ""
    return rows;
  }
}
