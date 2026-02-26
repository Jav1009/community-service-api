const db = require('../config/db');

// Get all bookings
exports.getAllBookings = async (req, res, next) => {
    try {
        const [rows] = await db.query(`
      SELECT b.id, b.booking_date, b.booking_time, b.notes,
             b.created_at, b.updated_at,
             u.id AS user_id, u.name AS user_name, u.email AS user_email,
             s.id AS service_id, s.name AS service_name, s.price AS service_price,
             bs.id AS status_id, bs.status_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN booking_status bs ON b.status_id = bs.id
      ORDER BY b.created_at DESC
    `);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

// Get booking by ID
exports.getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
      SELECT b.id, b.booking_date, b.booking_time, b.notes,
             b.created_at, b.updated_at,
             u.id AS user_id, u.name AS user_name, u.email AS user_email,
             s.id AS service_id, s.name AS service_name, s.price AS service_price,
             bs.id AS status_id, bs.status_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN booking_status bs ON b.status_id = bs.id
      WHERE b.id = ?
    `, [id]);

        if (rows.length === 0) {
            const error = new Error(`Booking with ID ${id} not found`);
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

// Create a new booking
exports.createBooking = async (req, res, next) => {
    try {
        const { service_id, booking_date, booking_time, notes } = req.body;
        const user_id = 1; // Predefined user

        if (!service_id || !booking_date || !booking_time) {
            const error = new Error('service_id, booking_date, and booking_time are required');
            error.statusCode = 400;
            return next(error);
        }

        const [service] = await db.query('SELECT * FROM services WHERE id = ?', [service_id]);
        if (service.length === 0) {
            const error = new Error(`Service with ID ${service_id} not found`);
            error.statusCode = 404;
            return next(error);
        }

        const [statusRows] = await db.query("SELECT id FROM booking_status WHERE status_name = 'Scheduled'");
        const status_id = statusRows[0].id;

        const [result] = await db.query(
            'INSERT INTO bookings (user_id, service_id, status_id, booking_date, booking_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, service_id, status_id, booking_date, booking_time, notes || null]
        );

        const [newBooking] = await db.query(`
      SELECT b.id, b.booking_date, b.booking_time, b.notes,
             b.created_at, b.updated_at,
             u.id AS user_id, u.name AS user_name,
             s.id AS service_id, s.name AS service_name, s.price AS service_price,
             bs.id AS status_id, bs.status_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN booking_status bs ON b.status_id = bs.id
      WHERE b.id = ?
    `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: newBooking[0]
        });
    } catch (err) {
        next(err);
    }
};

// PUT - Update booking status
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status_id } = req.body;

        if (!status_id) {
            const error = new Error('status_id is required');
            error.statusCode = 400;
            return next(error);
        }

        const [existing] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (existing.length === 0) {
            const error = new Error(`Booking with ID ${id} not found`);
            error.statusCode = 404;
            return next(error);
        }

        const [statusCheck] = await db.query('SELECT * FROM booking_status WHERE id = ?', [status_id]);
        if (statusCheck.length === 0) {
            const error = new Error(`Booking status with ID ${status_id} not found`);
            error.statusCode = 404;
            return next(error);
        }

        await db.query(
            'UPDATE bookings SET status_id = ?, updated_at = NOW() WHERE id = ?',
            [status_id, id]
        );

        const [updated] = await db.query(`
      SELECT b.id, b.booking_date, b.booking_time, b.notes,
             b.created_at, b.updated_at,
             u.id AS user_id, u.name AS user_name,
             s.id AS service_id, s.name AS service_name,
             bs.id AS status_id, bs.status_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN booking_status bs ON b.status_id = bs.id
      WHERE b.id = ?
    `, [id]);

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: updated[0]
        });
    } catch (err) {
        next(err);
    }
};

//PUT/cancel - Cancel booking
exports.cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query(`
      SELECT b.*, bs.status_name FROM bookings b
      JOIN booking_status bs ON b.status_id = bs.id
      WHERE b.id = ?
    `, [id]);

        if (existing.length === 0) {
            const error = new Error(`Booking with ID ${id} not found`);
            error.statusCode = 404;
            return next(error);
        }

        if (existing[0].status_name !== 'Scheduled') {
            const error = new Error(`Only scheduled bookings can be cancelled. Current status: ${existing[0].status_name}`);
            error.statusCode = 400;
            return next(error);
        }

        const [cancelStatus] = await db.query("SELECT id FROM booking_status WHERE status_name = 'Cancelled'");
        const cancelStatusId = cancelStatus[0].id;

        await db.query(
            'UPDATE bookings SET status_id = ?, updated_at = NOW() WHERE id = ?',
            [cancelStatusId, id]
        );

        res.status(200).json({
            success: true,
            message: `Booking with ID ${id} has been cancelled`
        });
    } catch (err) {
        next(err);
    }
};