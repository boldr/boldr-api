/* eslint-disable no-confusing-arrow */
import winston from 'winston';

import config from '../../config';

const isProductionEnv = process.env.NODE_ENV === 'production';

const formatter = options =>
  options.meta && options.meta.requestId ? `[RQID=${options.meta.requestId}] ${options.message}` : `${options.message}`;

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'silly',
      colorize: !isProductionEnv,
      json: isProductionEnv,
      prettyPrint: !isProductionEnv,
      humanReadableUnhandledException: !isProductionEnv,
      formatter,
    }),
  ],
});
logger.stream = {
  write(message) {
    logger.info(message);
  },
};
export default logger;
