const { Pool } = require('pg');
require ('dotenv').config();

const connectionPool = new Pool({
  connectionString: "postgresql://myuser:mypassword@localhost:5432/mydatabase?schema=myschema",
  user: "myuser",
  host: "localhost",
  database: "mydatabase",
  password: "mypassword",
  port: 5432,
});

module.exports = connectionPool;