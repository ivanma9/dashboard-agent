const { Pool } = require('pg');
require ('dotenv').config();

const connectionPool = new Pool({
  connectionString: process.env.DATABASE_URL,      // Use local URL in dev
});

module.exports = connectionPool;