import pool, { query } from '../db.js';

async function main() {
  const emails = process.argv.slice(2);

  const result = emails.length > 0
    ? await query(
        'DELETE FROM users WHERE email = ANY($1::text[]) RETURNING email',
        [emails]
      )
    : await query(
        "DELETE FROM users WHERE email LIKE 'smoketest%' RETURNING email"
      );

  console.log(JSON.stringify({
    deleted: result.rows.map((row) => row.email),
    count: result.rowCount
  }, null, 2));
}

try {
  await main();
} finally {
  await pool.end();
}
