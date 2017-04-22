const BoldrConfig = require('boldr-config');
const pkg = require('../package.json');

const config = new BoldrConfig('boldr', {
  server: {
    port: 2121,
    host: '127.0.0.1',
    apiPrefix: '/api/v1',
    siteUrl: 'http://localhost:3000',
  },
  logging: {
    level: 'debug',
    file: {
      enable: true,
      dir: 'logs',
      level: 'info',
      filename: 'boldr.api',
    },
  },
  db: {
    url: 'postgres://postgres:password@db:5432/boldr',
    name: 'boldr',
    debug: false,
  },
  redis: {
    url: 'redis://127.0.0.1:6379/0',
  },
  token: {
    secret: 'b0ldrk3kwi11s15',
  },
  mail: {
    host: 'smtp.example',
    port: 465,
    ssl: true,
    user: 'hello@boldr.io',
    password: 'password',
    from: 'hello@boldr.io',
  },
  cors: {
    whitelist: ['http://localhost:2121', 'http://localhost:3000'],
  },
});
export default config;
