/* eslint-disable prefer-destructuring, babel/new-cap */
import http from 'http';
import * as objection from 'objection';
import * as objectionSoftDelete from 'objection-softdelete';
import app from './app';
import { logger, db, disconnect, destroyRedis } from './services';
import config from './config';

const debug = require('debug')('boldrAPI:engine');

const PORT = config.server.port;
const HOST = config.server.host;

const server = http.createServer(app);

server.listen(PORT, HOST);

server.on('error', err => {
  logger.error(`⚠️  ${err}`);
  throw err;
});

server.on('listening', () => {
  debug(config.displayConfig());
  const address = server.address();
  logger.info('🚀  Starting server on %s:%s', address.address, address.port);
});

process.on('SIGINT', () => {
  logger.info('shutting down!');
  disconnect();
  destroyRedis();
  server.close();
  process.exit();
});

process.on('uncaughtException', error => {
  logger.error(`uncaughtException: ${error.message}`);
  logger.error(error.stack);
  debug(error.stack);
  process.exit(1);
});
