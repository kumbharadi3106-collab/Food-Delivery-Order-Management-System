const mongoose = require('mongoose');
const Customer = require('../models/Customer');

const createCustomer = async (req, res) => {
  try {
    const fields = ['name', 'email', 'phone', 'address'];

    for (const field of fields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Customer ${field} is required` });
      }
    }

    const { name, email, phone, address } = req.body;
    const customer = await Customer.create({ name, email, phone, address });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createCustomer, getCustomers, getCustomer };
