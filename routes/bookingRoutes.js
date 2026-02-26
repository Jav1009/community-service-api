const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id/status', bookingController.updateBookingStatus);
router.put('/:id/cancel', bookingController.cancelBooking);

module.exports = router;