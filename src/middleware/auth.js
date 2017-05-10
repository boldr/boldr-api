/**
 * Authentication Middleware
 * server/middleware/auth
 */
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/user';
import config from '../config';
import configureJwt from '../services/authentication/providers/jwt';
import configureLocal from '../services/authentication/providers/local';
import { mainRedisClient } from '../services/redis';
import sessionMiddleware from './session';

import rbac from './rbac';

const debug = require('debug')('boldrAPI:authMW');

export default app => {
  configureJwt(User);
  configureLocal(User);
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    const sessionUser = { id: user.id, email: user.email };
    debug('serialize', sessionUser);
    return done(null, sessionUser);
  });

  passport.deserializeUser((sessionUser, done) => {
    if (!sessionUser) {
      return done();
    }
    debug('deserialize', sessionUser);
    done(null, sessionUser);
  });
  /* istanbul ignore next */
  app.use((req, res, next) => {
    // This makes the user object and the roles associated with the user
    // available at res.locals.user
    passport.authenticate('jwt', (err, user) => {
      if (err) {
        return next(err);
      }
      res.locals.user = !!user ? user : null;

      return next();
    })(req, res, next);
  });
  app.use(rbac());
};
