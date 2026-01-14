const db = require('../database/database');

const ALLOWED_TABLES = [
  'accounts',
  'transactions',
  'incomes',
  'expenses',
  'debts',
  'recurring_operations',
  'budgets',
  'settings'
];

const transactionalTables = [
  'transactions',
  'incomes',
  'expenses',
  'debts',
  'recurring_operations',
  'budgets'
];

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  }));

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  }));

async function ensureSettingsTable() {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
}

async function getSettings() {
  await ensureSettingsTable();
  const rows = await allAsync('SELECT key, value FROM settings');
  return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
}

async function saveSetting(key, value) {
  if (!key || typeof key !== 'string') throw new Error('Invalid key');
  await ensureSettingsTable();
  // SQLite friendly "INSERT OR REPLACE"
  await runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  return { key, value };
}

async function exportAll() {
  const exportData = { version: 1.0, date: new Date().toISOString(), data: {} };
  for (const table of ALLOWED_TABLES) {
    const rows = await allAsync(`SELECT * FROM ${table}`);
    exportData.data[table] = rows;
  }
  return exportData;
}

async function importAll(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid payload');
  const incomingTables = Object.keys(payload);
  for (const t of incomingTables) {
    if (!ALLOWED_TABLES.includes(t)) throw new Error(`Table not allowed: ${t}`);
  }

  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        await runAsync('PRAGMA foreign_keys = OFF');
        await runAsync('BEGIN TRANSACTION');

        for (const table of incomingTables) {
          const rows = Array.isArray(payload[table]) ? payload[table] : [];
          // Clear table
          await runAsync(`DELETE FROM ${table}`);

          if (rows.length === 0) continue;

          const cols = Object.keys(rows[0]).filter(c => /^[a-zA-Z0-9_]+$/.test(c));
          if (cols.length === 0) throw new Error(`No valid columns for ${table}`);

          const placeholders = cols.map(() => '?').join(',');
          const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`;
          const stmt = db.prepare(sql);

          for (const row of rows) {
            const values = cols.map(c => (Object.prototype.hasOwnProperty.call(row, c) ? row[c] : null));
            await new Promise((res, rej) => stmt.run(values, (err) => err ? rej(err) : res()));
          }
          stmt.finalize();
        }

        await runAsync('PRAGMA foreign_keys = ON');
        await runAsync('COMMIT');
        resolve({ message: 'Import succeeded' });
      } catch (err) {
        try { await runAsync('ROLLBACK'); } catch (_) {}
        reject(err);
      }
    });
  });
}

async function resetTransactionalData() {
  await runAsync('BEGIN TRANSACTION');
  try {
    for (const table of transactionalTables) {
      await runAsync(`DELETE FROM ${table}`);
    }
    await runAsync('COMMIT');
    return { message: 'Transactional data cleared' };
  } catch (err) {
    await runAsync('ROLLBACK');
    throw err;
  }
}

module.exports = {
  getSettings,
  saveSetting,
  exportAll,
  importAll,
  resetTransactionalData
};