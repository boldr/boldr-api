/* @flow */

import knex from 'knex';
import * as objection from 'objection';
import * as objectionSoftDelete from 'objection-softdelete';
import config from '../../config';

const knexOpts = {
  client: 'pg',
  connection: config.db.url,
  migrations: {
    tableName: 'migrations',
  },
  debug: config.db.debug,
};

const db = knex(knexOpts);
const { Model } = objection;
// $FlowIssue
Model.knex(db);
objectionSoftDelete.register(objection);

async function disconnect(db: Object) {
  if (!db) {
    return;
  }
  try {
    await db.destroy();
  } catch (err) {
    throw new Error(err);
  }
}
export default db;

export { disconnect };
