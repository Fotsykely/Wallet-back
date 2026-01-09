const RecurringOperation = require('../models/recurringOperationModel');
const Transaction = require('../models/transactionModel');

function isTodayRecurring(rec) {
  const today = new Date();
  if (rec.recurrence === 'monthly') {
    return today.getDate() === rec.recurrence_date;
  }
  if (rec.recurrence === 'weekly') {
    return today.getDay() === rec.recurrence_date;
  }
  if (rec.recurrence === 'daily') {
    return true; // Tous les jours
  }
  return false;
}

exports.executeTodayRecurrings = (callback) => {
  RecurringOperation.getAll((err, recurrings) => {
    if (err) return callback(err);

    recurrings.forEach(rec => {
      if (isTodayRecurring(rec)) {
        const transaction = {
          account_id: rec.account_id,
          date: new Date().toISOString().slice(0, 10),
          category: rec.type, // ex: 'expense' or 'income'
          description: rec.description,
          // Gestion du signe selon le type
          amount: rec.type === 'income' ? Math.abs(rec.amount) : -Math.abs(rec.amount),
          is_recurring: 1 // Marked transaction as recurring
        };
        
        Transaction.create(transaction, (err) => {
          if (err) console.error('Erreur création transaction récurrente:', err);
        });
      }
    });

    callback(null, { executed: true });
  });
};

// Calculate all occurrence dates of a recurring between two dates (inclusive)
function getOccurrencesBetween(rec, startDateStr, endDateStr) {
  const occurrences = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const pad = n => String(n).padStart(2, '0');
  const toYMD = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  if (start > end) return occurrences;

  const recType = rec.recurrence;
  const recDay = rec.recurrence_date; // number: day of month or weekday

  if (recType === 'daily') {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) occurrences.push(toYMD(new Date(d)));
    return occurrences;
  }

  if (recType === 'weekly') {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
      if (d.getDay() === Number(recDay)) occurrences.push(toYMD(new Date(d)));
    }
    return occurrences;
  }

  if (recType === 'monthly') {
    for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d.setMonth(d.getMonth()+1)) {
      const year = d.getFullYear(), month = d.getMonth();
      const day = Number(recDay);
      const candidate = new Date(year, month, day);
      if (candidate >= start && candidate <= end && candidate.getMonth() === month) occurrences.push(toYMD(candidate));
    }
    return occurrences;
  }

  // yearly or unknown: try yearly on same month/day if recurrence_date stored accordingly
  if (recType === 'yearly') {
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      const base = new Date(rec.recurrence_date); // if stored as full date
      if (isNaN(base)) continue;
      const candidate = new Date(y, base.getMonth(), base.getDate());
      if (candidate >= start && candidate <= end) occurrences.push(toYMD(candidate));
    }
  }

  return occurrences;
}

// Execute missed recurrings since a given date (or default 30 days)
exports.executeMissedRecurrings = (sinceDateStr, callback) => {
  RecurringOperation.getAll((err, recurrings) => {
    if (err) return callback(err);

    const todayStr = new Date().toISOString().slice(0,10);
    const defaultSince = (() => {
      const d = new Date(); d.setDate(d.getDate() - 30); // par défaut 30 jours
      return d.toISOString().slice(0,10);
    })();
    const sinceGlobal = sinceDateStr || defaultSince;

    let pending = 0;
    let errors = [];

    recurrings.forEach(rec => {
      // Start = max(sinceGlobal, date de création de la récurrence)
      const createdDate = rec.created_at ? new Date(rec.created_at).toISOString().slice(0,10) : sinceGlobal;
      const startDate = createdDate > sinceGlobal ? createdDate : sinceGlobal;

      // Ne pas générer pour dates antérieures à creation
      const occs = getOccurrencesBetween(rec, startDate, todayStr);

      occs.forEach(dateStr => {
        pending++;
        // Eviter doublons : vérifier si transaction existante
        Transaction.existsForRecurring(rec.account_id, dateStr, rec.description, rec.type === 'income' ? Math.abs(rec.amount) : -Math.abs(rec.amount), (errExist, exists) => {
          if (errExist) errors.push(errExist);
          else if (!exists) {
            const transaction = {
              account_id: rec.account_id,
              date: dateStr,
              category: rec.type,
              description: rec.description,
              amount: rec.type === 'income' ? Math.abs(rec.amount) : -Math.abs(rec.amount),
              is_recurring: 1
            };
            Transaction.create(transaction, (errCreate) => {
              if (errCreate) errors.push(errCreate);
              pending--;
              if (pending === 0) callback(errors.length ? errors : null, { executed: true });
            });
            return;
          }
          pending--;
          if (pending === 0) callback(errors.length ? errors : null, { executed: true });
        });
      });

    });

    // Aucun pending (pas d'occurrences) => retourner immédiatement
    if (pending === 0) callback(null, { executed: true });
  });
};