import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { isNotEmpty } from 'class-validator';
import * as mysql from 'mysql2';
import { environment } from 'src/app/core/environment';
import { BasicResponse } from '../models/basic-response.model';

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
    let conn
    try {
      query = query.trim()
      if (!isNotEmpty(query)) {
        throw new Error("No se puede ejecutar una consulta vacía.");
      }
      conn = mysql.createPool(this.connection).promise();
      const [rows, fields] = await conn.query(query);
      environment.db.logs ? console.debug(query) : ""
      return new BasicResponse(true, "Consulta exitosa", rows);
    } catch (error) {
      console.error(error, error.stack)
      return new BasicResponse(false, error.message, undefined, error.stack);
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
    return await MySqlService.query(query)
  }
}
