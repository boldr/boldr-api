if (process.env.NODE_ENV !== 'production') {
  require('@glimpse/glimpse').init();
}
require('./server');
