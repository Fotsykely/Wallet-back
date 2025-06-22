function buildDateFilters(query, dateField = 'date') {
  const filters = [];
  const params = [];

  // maxDate = nombre de jours dans le passé (ex: 5 => du 12 au 16 si on est le 17)
  if (query.maxDate) {
    filters.push(`${dateField} >= date('now', ?)`);
    params.push(`-${parseInt(query.maxDate, 10)} days`);
    filters.push(`${dateField} <= date('now')`);
    // pas de paramètre pour date('now')
  }
  // minDate = nombre de jours dans le futur (optionnel)
  if (query.minDate) {
    filters.push(`${dateField} >= date('now', ?)`);
    params.push(`+${parseInt(query.minDate, 10)} days`);
  }
  // date exacte (optionnel)
  if (query.date) {
    filters.push(`${dateField} = ?`);
    params.push(query.date);
  }

  return { filters, params };
}

module.exports = { buildDateFilters };