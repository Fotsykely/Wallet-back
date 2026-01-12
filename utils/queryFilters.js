function buildDateFilters(query, dateField = 'date') {
  const filters = [];
  const params = [];

  // Filtre par mois (YYYY-MM)
  if (query.month) {
    filters.push(`${dateField} LIKE ?`);
    params.push(`${query.month}-%`);
  }
  
  // Filter by year if month is not provided (YYYY)
  else if (query.year) {
    filters.push(`${dateField} LIKE ?`);
    params.push(`${query.year}-%`);
  }

  // Filter by exact date
  if (query.date) {
    filters.push(`${dateField} = ?`);
    params.push(query.date);
  }

  // Filter for last N days
  if (query.maxDate) {
    const maxDate = parseInt(query.maxDate, 10);
    if (!isNaN(maxDate)) {
      filters.push(`${dateField} >= date('now', '-${maxDate} days')`);
    }
  }

  // Filter startDate / minDate
  if (query.startDate || query.minDate) {
    const startDate = query.startDate || query.minDate;
    filters.push(`${dateField} >= ?`);
    params.push(startDate);
  }

  // Filter endDate
  if (query.endDate) {
    filters.push(`${dateField} <= ?`);
    params.push(query.endDate);
  }

  return { filters, params };
}

module.exports = { buildDateFilters };