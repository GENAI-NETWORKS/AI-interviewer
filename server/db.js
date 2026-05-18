const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'srv1128.hstgr.io',
  user: 'u416856653_test',
  password: 'Testai@12',
  database: 'u416856653_test',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

module.exports = pool;
