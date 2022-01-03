import AWS from 'aws-sdk'
import fs from 'fs'
import { isEmpty } from 'class-validator'
import { decrypt, encrypt } from './services/functions.service'

export const IS_LOCAL: boolean = Boolean(process.env.IS_LOCAL)
export const NODE_ENV: string = process.env.NODE_ENV.trim().toUpperCase()
export const POOL_ALIAS_JA = process.env.POOL_ALIAS ? process.env.POOL_ALIAS.trim() + "_JA" : "POOL_NESTJS_JA"
export const POOL_ALIAS_JP = process.env.POOL_ALIAS ? process.env.POOL_ALIAS.trim() + "_JP" : "POOL_NESTJS_JP"
export const MAX_POOL_CONNECTIONS = process.env.MAX_POOL_CONNECTIONS ? Number(process.env.MAX_POOL_CONNECTIONS) : 10

const SSM = new AWS.SSM({ region: 'us-east-1' })

export async function getEnvironmentParam(name: string, notFoundName: string = name) {
    name = name.trim().toUpperCase()
    notFoundName = notFoundName.trim().toUpperCase()
    let params: any = {
        JAMAR_DB_MEC_EXTENDED_HOST: process.env.JAMAR_DB_MEC_EXTENDED_HOST,
        JAMAR_DB_MEC_EXTENDED_DATABASE: process.env.JAMAR_DB_MEC_EXTENDED_DATABASE,
        JAMAR_DB_MEC_EXTENDED_USER: process.env.JAMAR_DB_MEC_EXTENDED_USER,
        JAMAR_DB_MEC_EXTENDED_PASSWORD: process.env.JAMAR_DB_MEC_EXTENDED_PASSWORD,
        JAMAR_DB_SEUS_HOST: process.env.JAMAR_DB_SEUS_HOST,
        JAMAR_DB_SEUS_DATABASE: process.env.JAMAR_DB_SEUS_DATABASE,
        JAMAR_DB_SEUS_USER: process.env.JAMAR_DB_SEUS_USER,
        JAMAR_DB_SEUS_PASSWORD: process.env.JAMAR_DB_SEUS_PASSWORD,
        JAMAR_DB_SEUS_DATABASE_JP: process.env.JAMAR_DB_SEUS_DATABASE_JP,
        JAMAR_DB_SEUS_HOST_JP: process.env.JAMAR_DB_SEUS_HOST_JP,
        JAMAR_DB_SEUS_PASSWORD_JP: process.env.JAMAR_DB_SEUS_PASSWORD_JP,
        JAMAR_DB_SEUS_USER_JP: process.env.JAMAR_DB_SEUS_USER_JP,
        JAMAR_JWT_KEY: process.env.JAMAR_JWT_KEY,
        JAMAR_APP_KEY: process.env.JAMAR_APP_KEY,
        JAMAR_SECRET_KEY: process.env.JAMAR_SECRET_KEY,
        JAMAR_DOMAIN: process.env.JAMAR_DOMAIN,
    }
    if (IS_LOCAL) {
        try {
            params = getEnvVariables()
        } catch (error) {
            console.error(error)
        }
    }
    if (isEmpty(params[name])) {
        return await getSSMParam(notFoundName, name)
    }
    return params[name]
}

function getEnvVariables() {
    const file = fs.readFileSync(".env", { encoding: "utf8" })
    let params = {}
    if (file) {
        const vars = file.split(/\r\n|\n/).map(value => { return value.split(" = ") })
        vars.forEach(element => {
            if (element[0] && element[1]) params[element[0].trim()] = decrypt(element[1].trim())
        });
    }
    return params
}

async function getSSMParam(Name: string, envName: string) {
    console.debug("Consultando SSM")
    const result = await SSM.getParameter({ Name }, (err, data) => { return { err, data } }).promise()
    if (result.Parameter.Value) {
        try {
            const params = getEnvVariables()
            if (isEmpty(params)) {
                fs.appendFileSync(".env", `${envName} = ${encrypt(result.Parameter.Value)}`)
            } else if (!Object.prototype.hasOwnProperty.call(params, envName)) {
                fs.appendFileSync(".env", `\n${envName} = ${encrypt(result.Parameter.Value)}`)
            }
        } catch (error) {
            console.error("El archivo .env no existe, se creará", error)
            fs.appendFileSync(".env", `${envName} = ${encrypt(result.Parameter.Value)}`)
        }
        return result.Parameter.Value
    }
    console.error(result.$response.error)
    throw new Error(`No se encontró el parametro SSM '${Name}'`);

}

export const environment = {
    name: NODE_ENV + (IS_LOCAL ? "_local" : ""),
    app_port: 3000,
    secret_key: "dff5091000396f57ed039129a4e5472b",
    db: {
        logs: true,
    }
}