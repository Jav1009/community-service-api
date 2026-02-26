const db = require('../config/db');

// Get all services
exports.getAllServices = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM services ORDER BY created_at DESC');
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

// Get services by ID
exports.getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [id]);

    if (rows.length === 0) {
      const error = new Error(`Service with ID ${id} not found`);
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// POST - Create service
exports.createService = async (req, res, next) => {
  try {
    const { name, description, price, estimated_duration, is_available } = req.body;

    if (!name || !description || price === undefined || !estimated_duration) {
      const error = new Error('name, description, price, and estimated_duration are required');
      error.statusCode = 400;
      return next(error);
    }

    if (isNaN(price) || price < 0) {
      const error = new Error('price must be a valid non-negative number');
      error.statusCode = 400;
      return next(error);
    }

    const availability = is_available !== undefined ? is_available : true;

    const [result] = await db.query(
      'INSERT INTO services (name, description, price, estimated_duration, is_available) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, estimated_duration, availability]
    );

    const [newService] = await db.query('SELECT * FROM services WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService[0]
    });
  } catch (err) {
    next(err);
  }
};

// PUT - Update service
exports.updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, estimated_duration, is_available } = req.body;

    const [existing] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      const error = new Error(`Service with ID ${id} not found`);
      error.statusCode = 404;
      return next(error);
    }

    if (price !== undefined && (isNaN(price) || price < 0)) {
      const error = new Error('price must be a valid non-negative number');
      error.statusCode = 400;
      return next(error);
    }

    const updatedName = name || existing[0].name;
    const updatedDesc = description || existing[0].description;
    const updatedPrice = price !== undefined ? price : existing[0].price;
    const updatedDuration = estimated_duration || existing[0].estimated_duration;
    const updatedAvail = is_available !== undefined ? is_available : existing[0].is_available;

    await db.query(
      'UPDATE services SET name = ?, description = ?, price = ?, estimated_duration = ?, is_available = ?, updated_at = NOW() WHERE id = ?',
      [updatedName, updatedDesc, updatedPrice, updatedDuration, updatedAvail, id]
    );

    const [updated] = await db.query('SELECT * FROM services WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updated[0]
    });
  } catch (err) {
    next(err);
  }
};

// Delete a service
exports.deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      const error = new Error(`Service with ID ${id} not found`);
      error.statusCode = 404;
      return next(error);
    }

    await db.query('DELETE FROM services WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: `Service with ID ${id} deleted successfully`
    });
  } catch (err) {
    next(err);
  }
};