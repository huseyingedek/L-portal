import mysql from 'mysql2/promise';

const sikayetPool = mysql.createPool({
  host:     process.env.SIKAYET_DB_HOST     || '94.73.150.21',
  port:     Number(process.env.SIKAYET_DB_PORT) || 3306,
  user:     process.env.SIKAYET_DB_USER     || 'u8559882_userliz',
  password: process.env.SIKAYET_DB_PASSWORD || '770hA6k5x894DBT7goD5',
  database: process.env.SIKAYET_DB_NAME     || 'u8559882_db9lizk',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
  timezone: '+03:00',
});

export default sikayetPool;
