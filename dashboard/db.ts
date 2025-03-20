const { Pool } = require('pg');
require ('dotenv').config();

const connectionPool = new Pool({
  connectionString: process.env.NODE_ENV === 'production' 
    ? process.env.DATABASE_URL_PROD  // Use production URL in prod
    : process.env.DATABASE_URL,      // Use local URL in dev
});

module.exports = connectionPool;