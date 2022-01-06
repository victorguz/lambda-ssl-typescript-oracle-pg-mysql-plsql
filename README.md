## Description

Proyecto realizado con [Nest JS](https://github.com/nestjs/nest).

Para ejecutar este proyecto es necesario tener instalado NestJS Cli de forma global `npm i -g @nestjs/cli`.

## Running the app

Para ejecutar el proyecto en local, utilice `npm install` y luego `npm run start` o `nest start --watch`.

## build

Este proyecto utiliza Serverless para hacer deploy en AWS Lambda.
Por lo cual requiere que instale `AWS Cli` (vea la documentación web) y `serverless` de manera global.

También debe contar credenciales de acceso IAM proporcionadas por AWS y los roles de permisos necesarios.

Utilice `npm run deploy:dev:force` para publicar sus cambios la primera vez (esto creará una lambda, api gateway y le asignará el layer adecuado). Luego utilice símplemente `npm run deploy:dev` dado que el comando anterior sobre escribe todas las funciones de la lambda.

## A tener en cuenta:

- **Pool Timeout:** Nos conectamos a `oracle` a traves de un pool que tiene un timeout de 60 segundos. Lo que quiere decir que si la conexión no está en uso, transcurridos los 60 segundos se cerrará la sesión del pool.
- **:**
