import HttpError from '../core/errors/httpError';

export default app => {
  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new HttpError('Not found', 404);

    return next(err);
  });

  // error handler - no stacktraces leaked to user unless development
  app.use((err, req, res, next) => {
    // eslint-disable-line no-unused-vars
    const statusCode = err.status || 500;

    const stacktrace = process.env.NODE_ENV === 'development'
      ? {
        stack: err.stack,
      }
      : {};

    res.status(statusCode).json({
      status: statusCode,
      error: err.error || err.message,
      ...stacktrace,
    });
  });
};
