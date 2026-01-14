// filepath: /Users/andorazafy/Documents/Wallet/Wallet-back/utils/dbUtils.js
const db = require('../database/database');

exports.runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  }));

exports.allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  }));

exports.getAsync = (sql, params = []) => 
  new Promise((resolve, reject) => db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  }));