import logger from './logger';
import { mainRedisClient, pubSubRedisClient, destroyRedis } from './redis';
import db, { disconnect } from './postgres';
import isAuthenticated from './authentication/isAuthenticated';
import signToken from './authentication/signToken';
import { generateHash, randomString, SALT } from './hashing';
import mailer from './mailer';

export {
  logger,
  db,
  mainRedisClient,
  pubSubRedisClient,
  disconnect,
  isAuthenticated,
  signToken,
  generateHash,
  randomString,
  SALT,
  mailer,
  destroyRedis,
};
