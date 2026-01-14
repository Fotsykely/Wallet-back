const maintenanceService = require('../services/maintenanceService');

exports.getSettings = async (req, res) => {
  try {
    const settings = await maintenanceService.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveSetting = async (req, res) => {
  try {
    const { key, value } = req.body || {};
    const result = await maintenanceService.saveSetting(key, value);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.exportData = async (req, res) => {
  try {
    const data = await maintenanceService.exportAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.importData = async (req, res) => {
  try {
    const payload = req.body && req.body.data;
    await maintenanceService.importAll(payload);
    res.json({ message: 'Import succeeded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetData = async (req, res) => {
  try {
    const result = await maintenanceService.resetTransactionalData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};