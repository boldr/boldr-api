/* @flow */

import knex from 'knex';
import config from '../../config';

const db = knex({
  client: 'pg',
  connection: config.db.url,
  migrations: {
    tableName: 'migrations',
  },
  debug: config.db.debug,
});

async function disconnect(db: Object) {
  try {
    await db.destroy();
  } catch (err) {
    throw new Error(err);
  }
}

export default db;

export { db, disconnect };
