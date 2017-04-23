/* @flow */
require('dotenv').config();

import url from 'url';
import Redis from 'ioredis';
import bluebird from 'bluebird';
import logger from '../logger';
import config from '../../config';

const redisCon = url.parse(config.redis.url);
// $FlowIssue
const hostAddr = redisCon.host.split(':');
const redisOptions = {
  port: redisCon.port,
  host: hostAddr[0],
  db: 0,
};

const mainRedisClient = new Redis(redisOptions);
const pubSubRedisClient = new Redis(redisOptions);
const SHOULD_REFRESH_LUA_SCRIPT = `
-- Checks if we can refresh the source's token
--
-- Return values
--  0: token should be refreshed
--  1: token is already refreshing
local raw_source = redis.call("hget", KEYS[1], KEYS[2])
local json_source = cjson.decode(raw_source)
local source_status = json_source["status"]
if source_status == nil or source_status == "connected" then
    json_source["status"] = "refreshing"
    redis.call('hset', KEYS[1], KEYS[2], cjson.encode(json_source))
    return 0
else
    return 1
end
`;
mainRedisClient.defineCommand('shouldRefresh', {
  numberOfKeys: 2,
  lua: SHOULD_REFRESH_LUA_SCRIPT,
});

function destroyRedis() {
  mainRedisClient.disconnect();
  pubSubRedisClient.disconnect();
}

mainRedisClient.on('connect', () => {
  logger.info('Redis connection has been established!');
});

mainRedisClient.on('error', err => {
  logger.error(`Error while connecting to Redis!!! ${err}`);
  process.exit(1);
});

mainRedisClient.on('close', () => {
  logger.warn('Redis connection has been closed.');
  process.exit(1);
});

mainRedisClient.on('reconnecting', () => {
  logger.info('Redis is attempting to re-connect');
});

mainRedisClient.on('+node', data => {
  logger.info(data, 'node is connected');
});

export { mainRedisClient, pubSubRedisClient, destroyRedis };
