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

async function executeQuery(unit, doc, prodCode) {
  let conn;
  console.log(`Executing query with unit: ${unit}, doc: ${doc}, prodCode: ${prodCode}`);

  const query = `
    SELECT PRODN_SLIP_NO, PART_CODE, '*'||BARCODE_NO||'*' LOT_NO, STORE_CODE, DESCRIPTION, BARCODE_NO, PROD_SUBGROUP
    FROM PROC_LOT_STOCK A, ENG.PRODUCTS
    WHERE A.UNIT_CD = :P_UNIT
    AND PART_CODE = PRODUCT_CODE
    AND PRODN_SLIP_NO = :P_DOC
    AND PART_CODE = :P_PROD_CODE
    UNION ALL
    SELECT PRODN_SLIP_NO, PART_CODE, '*'||BARCODE_NO||'*' LOT_NO, STORE_CODE, DESCRIPTION, BARCODE_NO, PROD_SUBGROUP
    FROM PROC_LOT_STOCK_FG A, ENG.PRODUCTS
    WHERE A.UNIT_CD = :P_UNIT
    AND PART_CODE = PRODUCT_CODE
    AND PRODN_SLIP_NO = :P_DOC
    AND PART_CODE = :P_PROD_CODE
    UNION ALL
    SELECT PRODN_SLIP_NO, PART_CODE, '*'||BARCODE_NO||'*' LOT_NO, STORE_CODE, DESCRIPTION, BARCODE_NO, PROD_SUBGROUP
    FROM MTL.VEN_PORTAL_LOT_STOCK_FG A, ENG.PRODUCTS
    WHERE A.UNIT_CD = :P_UNIT
    AND PART_CODE = PRODUCT_CODE
    AND PRODN_SLIP_NO = :P_DOC
    AND PART_CODE = :P_PROD_CODE
    UNION ALL
    SELECT ASS_PRODN_SLIP, A.PRODUCT_CODE, '*'||BARCODE_NO||'*' LOT_NO, STORE_CODE, DESCRIPTION, BARCODE_NO, PROD_SUBGROUP
    FROM REVPRD.ASSY_PRODN_SLIP A, ENG.PRODUCTS B
    WHERE A.UNIT_CD = :P_UNIT
    AND A.PRODUCT_CODE = B.PRODUCT_CODE
    AND A.PRODUCT_CODE = :P_PROD_CODE
  `;

  const binds = {
    P_UNIT: unit,
    P_DOC: doc,
    P_PROD_CODE: prodCode
  };

  const options = {
    outFormat: oracledb.OBJECT,
    autoCommit: true
  };

  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(query, binds, options);
    console.log(`Query executed successfully, rows fetched: ${result.rows.length}`);
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

async function executeSlipNoQuery(unit) {
  let conn;
  console.log(`Executing slip number query with unit: ${unit}`);

  const query = `
  SELECT PRODN_SLIP_NO
  FROM PROC_LOT_STOCK A, ENG.PRODUCTS
  WHERE A.UNIT_CD = :P_UNIT
  AND PART_CODE = PRODUCT_CODE
  UNION ALL
  SELECT PRODN_SLIP_NO
  FROM PROC_LOT_STOCK_FG A, ENG.PRODUCTS
  WHERE A.UNIT_CD = :P_UNIT
  AND PART_CODE = PRODUCT_CODE
  UNION ALL
  SELECT PRODN_SLIP_NO
  FROM MTL.VEN_PORTAL_LOT_STOCK_FG A, ENG.PRODUCTS
  WHERE A.UNIT_CD = :P_UNIT
  AND PART_CODE = PRODUCT_CODE
  UNION ALL
  SELECT ASS_PRODN_SLIP AS PRODN_SLIP_NO
  FROM REVPRD.ASSY_PRODN_SLIP A, ENG.PRODUCTS B
  WHERE A.UNIT_CD = :P_UNIT
  AND A.PRODUCT_CODE = B.PRODUCT_CODE
  `;

  const binds = {
    P_UNIT: unit
  };

  const options = {
    outFormat: oracledb.OBJECT,
    autoCommit: true
  };

  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(query, binds, options);
    console.log(`Slip number query executed successfully, rows fetched: ${result.rows.length}`);
    return result.rows;
  } catch (err) {
    console.error('Error executing slip number query', err);
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

module.exports = { initialize, close, executeQuery, executeSlipNoQuery };
