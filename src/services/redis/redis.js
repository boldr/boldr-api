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
  host: redisCon.hostname,
  db: process.env.NODE_ENV === 'test' ? 1 : 0,
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
const SAVE_TOKEN_LUA_SCRIPT = `
  local token = KEYS[1]
  local user_tokens = KEYS[2]
  redis.call("hmset", token, unpack(ARGV))
  redis.call("sadd", user_tokens, token)
  return {token}
`;
const REMOVE_TOKEN_LUA_SCRIPT = `
    local token = KEYS[1]
  redis.log(redis.LOG_NOTICE, "Trying to find userId for " .. token)
  local user_id = redis.call("hget", token, "userId")
  if not userId then
    redis.log(redis.LOG_NOTICE, "Token has already been removed!")
    return
  end
  redis.log(redis.LOG_NOTICE, "Found " .. userId)
  redis.log(redis.LOG_NOTICE, "Removing " .. token)
  redis.call("srem", "{user:" .. userId .. "}:tokens", token)
  redis.call("del", token)
  return {token}
`;

const CACHE_PERM_LUA_SCRIPT = `
    local key = KEYS[1]
  local field = ARGV[1]
  local value = ARGV[2]
  local new_ttl = tonumber(ARGV[3])
  local ttl_now = redis.call("ttl", key)
  redis.call("hset", key, field, value)
  if ttl_now < 0 or ttl_now > new_ttl then
    redis.call("expire", key, new_ttl)
  end
  return 1
`;
mainRedisClient.defineCommand('removeToken', {
  lua: REMOVE_TOKEN_LUA_SCRIPT,
  numberOfKeys: 1,
});

mainRedisClient.defineCommand('saveToken', {
  lua: SAVE_TOKEN_LUA_SCRIPT,
  numberOfKeys: 2,
});

mainRedisClient.defineCommand('cachePermission', {
  lua: CACHE_PERM_LUA_SCRIPT,
  numberOfKeys: 1,
});
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
