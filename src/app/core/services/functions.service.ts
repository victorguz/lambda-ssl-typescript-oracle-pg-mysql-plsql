import * as CryptoJS from 'crypto-js';
import { arrayNotEmpty, isArray, isNotEmpty, isNotEmptyObject, isObject, isString, ValidationOptions } from "class-validator";
import { environment } from 'src/app/core/environment';
import AWS from 'aws-sdk'

const SSM = new AWS.SSM({ region: 'us-east-1' })
///////////////Funciones globales



/**
 * Analiza gramaticalmente el texto plano en formato csv, para luego retornar un arreglo de objetos
 * @param plainText Texto plano del archivo
 * @param separator Separador de las columnas 
 * @param headers Si incluye encabezados
 */
export function parseCsvInfo(plainText: string, separator: ";" | "," = ";", headers: boolean = true): any[] {
    return []
}
/**
 * Se comparan las dos fechas para obtener el tiempo transcurrido o restante en formato 'time ago'
 * @param firstDate 
 * @param secondDate 
 * @returns 
 */
export function timeAgo(firstDate: Date, secondDate: Date): string {
    return ""
}


/**{
 * }
 * Pone en mayusculas la inicial de cada palabra y en minusculas el resto de las letras en una cadena.
 * @param cad
 * @param split
 */
export function toTitleCase(cad: string, split: string = " ") {
    cad = cad.trim().toLocaleLowerCase()
    if (isNotEmpty(cad)) {
        let arr = cad.split(split);
        cad = "";
        arr.forEach(e => {
            if (e) {
                cad += e[0].toUpperCase() + e.substring(1) + " ";
            }
        });
    }
    return cad;
}

/**
* Pone en mayusculas la inicial de cada frase separandola por puntos (.)
* @param cad
*/
export function toPhraseCase(cad: string) {
    return toTitleCase(cad, ".");
}

export function hash256(key) {
    key = CryptoJS.SHA256(key);
    return key.toString();
}
export function hash512(key) {
    key = CryptoJS.SHA512(key);
    return key.toString();
}

export function encrypt(data) {
    data = CryptoJS.AES.encrypt(data, environment.secret_key);
    data = data.toString();
    return data;
}

export function decrypt(data) {
    data = CryptoJS.AES.decrypt(data, environment.secret_key);
    data = data.toString(CryptoJS.enc.Utf8);
    return data;
}

/**
 * Retorna la cadena solamente con numeros y letras
 * @param cad 
 * @returns 
 */
export function ignoreSpecialCharacters(cad: string): string {
    return cad.trim().replaceAll(/[\W]/ig, "")
}

/**
 * Pone comillas al valor
 * @param value 
 * @returns 
 */
export function quote(value: string | number): string {
    return `'${value}'`
}

/**
     * Evalúa si una cadena es una contraseña válida. Esta contraseña debe tener 
     * por lo menos 8 dígitos y 3 de los 4 siguientes tipos de caracter: 
     * minúsculas, mayúsculas, números, especiales
     * @param value cadena a evaluar
     */
export function isPassword(value: string): boolean {
    let regex = /^((?=.*[\d])(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\d\s])|(?=.*[\d])(?=.*[A-Z])(?=.*[^\w\d\s])|(?=.*[\d])(?=.*[a-z])(?=.*[^\w\d\s])).{8,}$/;
    if (value.match(regex) != null) {
        return true;
    }
    return false;
}


export function JSONToLowerCase(json: any) {
    if (isObject(json) && isNotEmptyObject(json)) {
        const newObject: any = {}
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const value = json[key];
                newObject[key.toLowerCase()] = value
            }
        }
        return newObject
    }
    throw new Error("Este objeto está vacío");
}

export function JSONArrayToLowerCase(array: any[]) {
    if (Array.isArray(array) && arrayNotEmpty(array)) {
        const result = array.map(item => { return JSONToLowerCase(item) })
        return result
    }
    throw new Error("Este arreglo está vacío");

}