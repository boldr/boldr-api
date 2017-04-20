import compression from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import expressValidator from 'express-validator';
import morgan from 'morgan';
import expressWinston from 'express-winston';
import flash from 'express-flash';
import hpp from 'hpp';
import config from '../config';
import winstonInstance from '../services/logger';
import cors from './cors';

export default app => {
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback');
  // enable CORS - Cross Origin Resource Sharing
  // allow for sending credentials (auth token) in the headers.
  app.use(cors);
  app.use(cookieParser(config.get('token.secret')));
  if (
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  ) {
    app.use(morgan('dev'));
  }
  app.use(compression());
  app.use(bodyParser.json({ type: 'application/json' }));
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));
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
  // must be right after bodyParser
  app.use(expressValidator());
  app.use(hpp());
  if (process.env.NODE_ENV === 'development') {
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    app.use(
      expressWinston.logger({
        winstonInstance,
        meta: true,
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorStatus: true,
      }),
    );
  }
  app.use(flash());
};
