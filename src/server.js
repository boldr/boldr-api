/* eslint-disable prefer-destructuring, babel/new-cap */
import http from 'http';
import app from './app';
import { logger, initializeDb, disconnect, destroyRedis } from './services';
import config from './config';

const Promise = require('bluebird');
const debug = require('debug')('boldrAPI:engine');

const PORT = config.server.port;
const HOST = config.server.host;

const server = http.createServer(app);

global.Promise = Promise;
Promise.longStackTraces();

initializeDb()
  .then(() => {
    logger.info('Database connected successfully');
    server.listen(PORT, HOST);

    server.on('listening', () => {
      const address = server.address();
      logger.info(
        '🚀  Starting server on %s:%s',
        address.address,
        address.port,
      );
    });
    server.on('error', err => {
      logger.error(`⚠️  ${err}`);
      throw err;
    });
  })
  .catch(err => {
    logger.error(err);
    process.exit(1);
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
