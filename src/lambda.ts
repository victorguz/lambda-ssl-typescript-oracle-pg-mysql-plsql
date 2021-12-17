import { Server } from 'http';
import { Context } from 'aws-lambda';
import { createServer, proxy, Response } from 'aws-serverless-express';
import { createApp } from './main';
import { IS_LOCAL } from './app/core/environment';

const express = require('express');
let cachedServer: Server;

async function bootstrap(): Promise<Server> {
    const expressApp = express();
    const app = await createApp(expressApp);
    await app.init();
    return createServer(expressApp);
}

export async function handler(event: any, context: Context): Promise<Response> {
    if (!cachedServer) {
        const server = await bootstrap();
        cachedServer = server;
    }
    return proxy(cachedServer, event, context, 'PROMISE').promise;
}