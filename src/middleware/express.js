import compression from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import expressValidator from 'express-validator';
import morgan from 'morgan';
import expressWinston from 'express-winston';
import flash from 'express-flash';
import cors from 'cors';
import responseTime from 'response-time';
import hpp from 'hpp';
import uuid from 'uuid';
import config from '../config';
import winstonInstance from '../services/logger';

export default app => {
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback');
  // enable CORS - Cross Origin Resource Sharing
  // allow for sending credentials (auth token) in the headers.
  app.use(
    cors({
      origin(origin, cb) {
        const whitelist = config.cors.whitelist ? config.cors.whitelist : [];
        cb(null, whitelist.includes(origin));
      },
      credentials: true,
    }),
  );
  app.use(cookieParser(config.token.secret));
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    app.use(morgan('dev'));
  }
  app.use(compression());
  app.use(bodyParser.json({ type: 'application/json' }));
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    bodyParser.text({ type: 'application/graphql' }),
    (req, res, next) => {
      if (req.is('application/graphql')) {
        req.body = { query: req.body };
      }
      next();
    },
  );
  app.use(expressValidator());
  app.use(
    methodOverride((req, res) => {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        const method = req.body._method;
        delete req.body._method;
        return method;
      }
    }),
  );
  app.use(responseTime());
  app.use((req, res, next) => {
    res.set('Request-Id', uuid.v4());
    next();
  });
  app.use(hpp());
  if (process.env.NODE_ENV === 'development') {
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    app.use(
      expressWinston.logger({
        winstonInstance,
        meta: true,
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms', // eslint-disable-line
        colorStatus: true,
      }),
    );
  }
  app.use(flash());
};
