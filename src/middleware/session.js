/**
 * Session Middleware
 * src/middleware/session
 */

import session from 'express-session';

import { mainRedisClient } from '../services/redis';
import config from '../config';

const RedisStore = require('connect-redis')(session);

const env = config.get('env') || 'development';

const sessionMiddleware = session({
  store: new RedisStore({
    client: mainRedisClient,
    ttl: 60 * 60 * 24,
  }),
  secret: config.get('token.secret'),
  name: 'boldr:sid',
  resave: false,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: true,
  },
});

export default sessionMiddleware;
