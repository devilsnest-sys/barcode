const oracledb = require('oracledb');

const dbConfig = {
    user: '',
    password: '',
    connectString: ''
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
  const { unit, doc, prodCode } = params;

  let baseQuery = `
    SELECT PRODN_SLIP_NO, PART_CODE, '*'||BARCODE_NO||'*' LOT_NO, STORE_CODE, DESCRIPTION, BARCODE_NO, PROD_SUBGROUP
    FROM PROC_LOT_STOCK A, ENG.PRODUCTS
    WHERE A.UNIT_CD = :P_UNIT
    AND PART_CODE = PRODUCT_CODE
  `;

  let unionQuery = `
    UNION ALL
    SELECT PRODN_SLIP_NO, PART_CODE, '*'||BARCODE_NO||'*' LOT_NO, STORE_CODE, DESCRIPTION, BARCODE_NO, PROD_SUBGROUP
    FROM PROC_LOT_STOCK_FG A, ENG.PRODUCTS
    WHERE A.UNIT_CD = :P_UNIT
    AND PART_CODE = PRODUCT_CODE
  `;

  let finalUnionQuery = `
    UNION ALL
    SELECT PRODN_SLIP_NO, PART_CODE, '*'||BARCODE_NO||'*' LOT_NO, STORE_CODE, DESCRIPTION, BARCODE_NO, PROD_SUBGROUP
    FROM MTL.VEN_PORTAL_LOT_STOCK_FG A, ENG.PRODUCTS
    WHERE A.UNIT_CD = :P_UNIT
    AND PART_CODE = PRODUCT_CODE
  `;

  let conditions = [];
  if (doc) {
    conditions.push('PRODN_SLIP_NO = :P_DOC');
  }
  if (prodCode) {
    conditions.push('PART_CODE = :P_PROD_CODE');
  }

  if (conditions.length > 0) {
    baseQuery += ` AND ${conditions.join(' AND ')}`;
    unionQuery += ` AND ${conditions.join(' AND ')}`;
    finalUnionQuery += ` AND ${conditions.join(' AND ')}`;
  }

  const finalQuery = `${baseQuery} ${unionQuery} ${finalUnionQuery}`;

  const binds = {
    P_UNIT: unit,
    ...(doc && { P_DOC: doc }),
    ...(prodCode && { P_PROD_CODE: prodCode })
  };

  const options = {
    outFormat: oracledb.OBJECT,
    autoCommit: true
  };

  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(finalQuery, binds, options);
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
