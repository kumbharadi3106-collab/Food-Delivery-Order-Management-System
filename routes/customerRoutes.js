const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomer
} = require('../controllers/customerController');

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomer);

module.exports = router;
