const oracledb = require('oracledb');

const dbConfig = {
  user: 'revprd',
  password: 'glAssfish_ora958',
  connectString: '192.168.0.242:1521/termssgm'
};

async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('Connection pool started');
  } catch (err) {
    console.error('Error initializing Oracle connection pool', err);
    throw err;
  }
}

async function close() {
  try {
    await oracledb.getPool().close(10);
    console.log('Connection pool closed');
  } catch (err) {
    console.error('Error closing Oracle connection pool', err);
  }
}

async function simpleExecute(statement, binds = [], opts = {}) {
  let conn;

  opts.outFormat = oracledb.OBJECT;
  opts.autoCommit = true;

  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(statement, binds, opts);
    return result;
  } catch (err) {
    console.error('Error executing statement', err);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error('Error closing connection', err);
      }
    }
  }
}

module.exports = { initialize, close, simpleExecute };
