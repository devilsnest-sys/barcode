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

async function executeQuery(params) {
  let conn;
  const { daNo } = params;

  let query = `
    SELECT DA_NO, QTY, B.PRODUCT_CODE, A.DESCRIPTION, BARCODE_NO, A.STORE_CODE
    FROM ENG.PRODUCTS A, FINANCE.DESPATCH_ADVICE_DETAIL B, SUPER_MKM.PURCHASE_ORDER_HEADER C
    WHERE A.PRODUCT_CODE = B.PRODUCT_CODE
    AND MARKET_TYPE = 'EXP'
    AND PO_ACK_NUMBER = ACK_NUMBER
    AND B.STATUS = 'A' AND BARCODE_NO IS NOT NULL
  `;

  if (daNo) {
    query += ' AND DA_NO = :P_DA_NO';
  }

  query += ' ORDER BY DA_NO DESC';

  const binds = {
    ...(daNo && { P_DA_NO: daNo })
  };

  const options = {
    outFormat: oracledb.OBJECT,
    autoCommit: true
  };

  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(query, binds, options);
    return result.rows;
  } catch (err) {
    console.error('Error executing query', err);
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

module.exports = { initialize, close, executeQuery };
