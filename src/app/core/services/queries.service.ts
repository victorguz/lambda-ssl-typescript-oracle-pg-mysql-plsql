import { Injectable } from '@nestjs/common';
import { isArray, isEmpty, isNotEmptyObject, isObject, isNotEmpty, isString } from 'class-validator';
import { MAX_RECORDS_TO_TAKE } from 'src/app/core/constants.config';
import { QueryOrderByDto } from '../dtos/query-orderby.dto';
import { BasicResponse } from '../models/basic-response.model';
import { MySqlService } from './mysql.service';
import { OracleService } from './oracle.service';
import { PostgreService } from './postgre.service';

enum CurrentQueryAction {
  SELECT = "SELECT", INSERT = "INSERT", UPDATE = "UPDATE", DELETE = "DELETE", QUERY = "QUERY"
}

@Injectable()
export class QueriesService {
  private _database: "oracle" | "postgre" | "mysql" = "oracle";
  private _table: string;
  private _company: "JA" | "JP";
  private _columns: string[];
  private _where: string;
  private _orderby: QueryOrderByDto[];
  private _values: object;
  private _limit: number;
  private _offset: number;
  private _sqlQuery: string;

  private currentAction: CurrentQueryAction = undefined;
  private getOnlySQL: boolean = false

  ora(company: "JA" | "JP"): QueriesService {
    this.clear()
    this._database = "oracle"
    this._company = company
    this.currentAction = CurrentQueryAction.SELECT
    return this
  }
  oraJP(): QueriesService {
    this.clear()
    this._database = "oracle"
    this._company = "JP"
    this.currentAction = CurrentQueryAction.SELECT
    return this
  }

  oraJA(): QueriesService {
    this.clear()
    this._database = "oracle"
    this._company = "JA"
    this.currentAction = CurrentQueryAction.SELECT
    return this
  }
  pg(): QueriesService {
    this.clear()
    this._database = "postgre"
    this.currentAction = CurrentQueryAction.SELECT
    return this
  }

  mysql(): QueriesService {
    this.clear()
    this._database = "mysql"
    this.currentAction = CurrentQueryAction.SELECT
    return this
  }

  /**
   * Seleccionar nombre de la tabla
   * @param table Nombre de la tabla
   * @returns QueriesService2
   */
  table(table: string): QueriesService {
    this.clear()
    this._table = table.trim()?.toLowerCase()
    this.currentAction = CurrentQueryAction.SELECT
    return this
  }


  /**
   * 
   * @param values nuevos valores
   * @returns QueriesService2
   */
  private setValue(values: object): QueriesService {
    this._values = values
    return this
  }

  /**
   * Seleccionar columnas a buscar
   * @param columns Nombres de las columnas
   * @returns QueriesService2
   */
  select(...columns: string[]): QueriesService {
    if (this.currentAction != CurrentQueryAction.SELECT) {
      throw new Error("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
    }
    this.currentAction = CurrentQueryAction.SELECT
    this._columns = columns
    return this
  }

  /**
       * Seleccionar columnas a buscar
       * @param columns Nombres de las columnas
       * @returns QueriesService2
       */
  selectWithArray(columns: string[]): QueriesService {
    if (this.currentAction != CurrentQueryAction.SELECT) {
      throw new Error("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
    }
    this.currentAction = CurrentQueryAction.SELECT
    this._columns = columns
    return this
  }
  /**
   * Asigna los valores a actualizar
   * @param values json con campos a actualizar
   * @param where json con campos a incluir en clausula where AND
   * @param limit numero maximo de registros actualizados, por defecto 1, no puede ser 0
   * @returns QueriesService2
   */
  update(values: object, where: object, limit: number = 1): QueriesService {
    if (this.currentAction != CurrentQueryAction.SELECT) {
      throw new Error("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
    }
    this.currentAction = CurrentQueryAction.UPDATE
    this.setValue(values)
    this.where(where)
    this.limit(limit)
    return this
  }

  /**
   * Asigna los valores a insertar (los que no estén en el objeto tendrán sus valores por defecto o null)
   * @param columns Nombres de las columnas
   * @returns QueriesService2
   */
  insert(values: object): QueriesService {
    if (this.currentAction != CurrentQueryAction.SELECT) {
      throw new Error("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
    }
    this.currentAction = CurrentQueryAction.INSERT
    this.setValue(values)
    return this
  }

  /**
   * Seleccionar columnas a buscar
   * @param columns Nombres de las columnas
   * @returns QueriesService2
   */
  delete(where: object, limit: number): QueriesService {
    if (this.currentAction != CurrentQueryAction.SELECT) {
      throw new Error("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
    }
    this.currentAction = CurrentQueryAction.DELETE
    this.where(where)
    this.limit(limit)
    return this
  }

  /**
   * Seleccionar el numero de registros
   * @param limit numero de registros
   * @returns QueriesService2
   */
  limit(limit: number, offset: number = 0): QueriesService {
    this._limit = limit
    if (this.isOracle() && offset > 0) {
      console.error("Para utilizar un offset en Oracle debes realizar tu consulta por el método 'query'.");
    }
    this._offset = offset
    return this
  }

  /**
   * Selecciona una clausula where
   * @param where QueryWhere
   * @returns QueriesService2
   */
  where(where: object): QueriesService {
    if (isObject(where)) {
      if (isNotEmptyObject(where) && isNotEmpty(where)) {
        this._where = QueriesService.objectToSetSentenceSQL(where, "AND")
      } else {
        throw new Error("La clausula where de tipo objeto debe tener clave-valor");
      }
    } else if (isString(where)) {
      this._where = where
    } else {
      throw new Error("Esta clausula where no está permitida");
    }

    return this
  }

  /**
     * Selecciona una clausula order by
     * @param orderby QueryOrderBy[]
     * @returns QueriesService2
     */
  orderBy(orderby: QueryOrderByDto[] | QueryOrderByDto | object): QueriesService {
    if (Array.isArray(orderby)) {
      this._orderby = orderby
    } else if (orderby instanceof QueryOrderByDto && !Array.isArray(orderby)) {
      this._orderby = [orderby]
    } else if (isNotEmptyObject(orderby) && isNotEmpty(orderby)) {
      let newOrderBy: QueryOrderByDto = { column: "", order: "" };
      for (const key in orderby) {
        if (Object.prototype.hasOwnProperty.call(orderby, key)) {
          const value = orderby[key];
          newOrderBy.column = key
          newOrderBy.order = value
          if (this._orderby) {
            this._orderby.push(newOrderBy)
          } else {
            this._orderby = [newOrderBy]
          }
        }
      }
    } else {
      throw new Error("Esta clausula orderby tiene un parámetro vacío o invalido");
    }
    return this
  }

  /**
   * Utilice un query personalizado
   * @param query 
   * @returns QueriesService2
   */
  query(query: string): QueriesService {
    this.clear();
    this.currentAction = CurrentQueryAction.QUERY
    this._sqlQuery = query
    return this
  }

  /**
   * Esta opcion habilita que se retornará solo la consulta SQL formada
   * @returns QueriesService2
   */
  sql(): QueriesService {
    this.getOnlySQL = true
    return this
  }

  /**
   * Limpia la consulta
   */
  clear() {
    this._table = "";
    this._columns = ["*"];
    this._orderby = []
    this._where = "";
    this._values = {};
    this._limit = 0;
    this._offset = 0;
    this._sqlQuery = "";
    this.currentAction = undefined;
    this.getOnlySQL = false
    return this
  }

  private checkTable() {
    if (isEmpty(this._table)) {
      throw new Error("Debe seleccionar una tabla primero");
    }
  }

  private checkWhere() {
    if (isEmpty(this._where)) {
      throw new Error("Esta consulta no se ejecutará sin una clausula where");
    }
  }

  private checkQuery() {
    if (isEmpty(this._sqlQuery)) {
      throw new Error("No se puede realizar un query si no nos das el query :c");
    }
  }

  private checkLimit() {
    if (this._limit <= 0) {
      this._limit = MAX_RECORDS_TO_TAKE
    }
  }

  private checkValueForUpdate() {
    if (isObject(this._values) && !isNotEmptyObject(this._values)) {
      throw new Error("Esta consulta no se ejecutará con objetos undefined, null o vacíos");
    }
  }

  private checkValueForInsert() {
    if ((isObject(this._values) && !isNotEmptyObject(this._values)) || isArray(this._values)) {
      throw new Error("Esta consulta no se ejecutará con si el objeto es un array, undefined, null o está vacío");
    }
  }

  /**
   * Ejecuta la consulta construida
   */
  async execute(): Promise<BasicResponse> {
    let result: any
    switch (this.currentAction) {
      case CurrentQueryAction.SELECT: this.checkTable(); result = await this._select(); this.clear(); return result;
      case CurrentQueryAction.INSERT: this.checkTable(); result = await this._insert(); this.clear(); return result;
      case CurrentQueryAction.UPDATE: this.checkTable(); result = await this._update(); this.clear(); return result;
      case CurrentQueryAction.DELETE: this.checkTable(); result = await this._delete(); this.clear(); return result;
      case CurrentQueryAction.QUERY: result = await this._query(); this.clear(); return result;
      default: new BasicResponse(false, "Debe seleccionar primero alguna acción");
    }
  }
  private isOracle() {
    return ["oracle", "datamart"].includes(this._database)
  }

  private async _select(): Promise<BasicResponse> {
    const orderbyString = isArray(this._orderby) ? this._orderby.map(v => QueryOrderByDto.asString(v)).join(", ").trim() : ""
    const selectString = this._columns.length > 0 ? this._columns.join(", ").trim() : "*"

    //En caso de ser oracle y tener limit
    if (this.isOracle() && this._limit > 0) {
      this._where += this._where.toLowerCase().trim().includes("and rownum = ") ? "" : " AND rownum = " + this._limit
    }

    const query = ` SELECT ${selectString} ` +
      ` FROM ${this._table} ` +
      ` ${isNotEmpty(this._where) ? `WHERE ${this._where}` : ""} ` +
      ` ORDER BY ${orderbyString != "" ? orderbyString : "id desc"} ` +
      (this.isOracle() ? "" : ` ${this._limit && this._limit > 0 ? ` LIMIT ${this._limit}` : ""} 
        ${this._offset && this._offset > 0 ? ` OFFSET ${this._offset}` : ""} `);
    if (this.getOnlySQL) {
      return new BasicResponse(true, "Consulta exitosa", query.trim())
    } else {
      const result = await this._makeQuery(query.trim());
      if (result.success) {
        result.data = this._limit == 1 && Array.isArray(result.data) && result.data.length == 1 ? result.data[0] : result.data
      }
      return result
    }
  }



  private async _insert() {
    this.checkValueForInsert()
    const queryInsert = ` INSERT INTO ${this._table} SET ${QueriesService.objectToSetSentenceSQL(this._values, ",")} `.trim();
    const querySelect = ` SELECT * FROM ${this._table} WHERE ${QueriesService.objectToSetSentenceSQL(this._values, "AND")}`.trim();
    if (this.getOnlySQL) {
      return new BasicResponse(true, "Consulta exitosa", queryInsert.trim())
    } else {
      await this._makeQuery(queryInsert.trim())
      const result = await this._makeQuery(querySelect.trim());
      if (result.success) {
        result.data = result.data && Array.isArray(result.data) && result.data.length == 1 ? result.data[0] : result.data
      }
      return result
    }
  }

  private async _update() {
    this.checkValueForUpdate()
    this.checkWhere()
    this.checkLimit()
    const query = ` UPDATE ${this._table} SET ${QueriesService.objectToSetSentenceSQL(this._values, ",")} WHERE ${this.isOracle() ? (this._where.toLowerCase().trim().includes("and rownum = ") ? "" : " AND rownum = " + this._limit) : " LIMIT " + this._limit} `.trim();
    const querySelect = ` SELECT * FROM ${this._table} WHERE ${(this._where.trim() != "" ? this._where + " AND " : "") + QueriesService.objectToSetSentenceSQL(this._values, "AND")}`.trim();
    if (this.getOnlySQL) {
      return new BasicResponse(true, "Consulta exitosa", query)
    } else {
      await this._makeQuery(query)
      const result = await this._makeQuery(querySelect.trim());
      if (result.success) {
        result.data = result.data && Array.isArray(result.data) && result.data.length == 1 ? result.data[0] : result.data
      }
      return result
    }
  }

  private async _delete() {
    this.checkWhere()
    this.checkLimit()
    const query = ` DELETE FROM ${this._table} WHERE ${this._where} ${this.isOracle() ? (this._where.toLowerCase().trim().includes("and rownum = ") ? "" : " AND rownum = " + this._limit) : " LIMIT " + this._limit} `.trim();
    if (this.getOnlySQL) {
      return new BasicResponse(true, "Consulta exitosa", query.trim())
    } else {
      const result = await this._makeQuery(query.trim());
      if (result.success) {
        result.data = this._limit == 1 && Array.isArray(result.data) && result.data.length == 1 ? result.data[0] : result.data
      }
      return result
    }
  }

  private async _makeQuery(query: string) {
    query = query.trim()
    switch (this._database) {
      case 'mysql': return await MySqlService.query(query);
      case 'oracle': return await OracleService.query(this._company, query);
      case 'postgre': return await PostgreService.query(query);
      case 'mysql': return await MySqlService.query(query);
      default: return new BasicResponse(false, `Base de datos seleccionada es incorrecta '${this._database}'`)
    }
  }
  private async _query() {
    this.checkQuery()
    if (this.getOnlySQL) {
      return this._sqlQuery
    } else {
      return await this._makeQuery(this._sqlQuery);
    }
  }

  private static objectToSetSentenceSQL(values: object, separator: string): string {
    let where: string[] = []
    for (const key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        let value = values[key];
        if (isString(value)) {
          //Validaremos si es un SQL porque tiene el formato '#{}'
          if (value.startsWith("#{") && value.endsWith("}")) {
            value = `(${value.substring(2, value.length - 1)})`
          } else {
            value = `'${value}'`
          }
        }
        where.push(` ${key} = ${value} `)

      }
    }
    return where.join(separator)
  }
}