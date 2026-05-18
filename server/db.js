const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'srv1128.hstgr.io',
  user:     process.env.DB_USER     || 'u416856653_test',
  password: process.env.DB_PASS     || 'Testai@12',
  database: process.env.DB_NAME     || 'u416856653_test',
  port:     process.env.DB_PORT     || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 30000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

module.exports = pool;
