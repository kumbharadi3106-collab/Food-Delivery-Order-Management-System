const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');

const statuses = ['placed', 'preparing', 'out for delivery', 'delivered'];

const createOrder = async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!customer) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(customer)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    const customerFound = await Customer.findById(customer);
    if (!customerFound) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.menuItem) {
        return res.status(400).json({ message: 'Menu item ID is required for every item' });
      }
      if (!mongoose.Types.ObjectId.isValid(item.menuItem)) {
        return res.status(400).json({ message: 'Invalid menu item ID' });
      }
      if (item.quantity === undefined) {
        return res.status(400).json({ message: 'Quantity is required for every item' });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive whole number' });
      }

      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });
      }
      if (!menuItem.availability) {
        return res.status(400).json({ message: `${menuItem.name} is not available right now` });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });

      totalPrice = totalPrice + menuItem.price * item.quantity;
    }

    const order = await Order.create({
      customer,
      items: orderItems,
      totalPrice
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { status, customer } = req.query;
    const filter = {};

    if (status) {
      if (!statuses.includes(status)) {
        return res.status(400).json({
          message: 'Invalid status. Use placed, preparing, out for delivery or delivered'
        });
      }
      filter.status = status;
    }

    if (customer) {
      if (!mongoose.Types.ObjectId.isValid(customer)) {
        return res.status(400).json({ message: 'Invalid customer ID' });
      }
      filter.customer = customer;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone address')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(id).populate('customer', 'name email phone address');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    if (!statuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Use placed, preparing, out for delivery or delivered'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Order is already delivered' });
    }

    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[currentIndex + 1];

    if (status !== nextStatus) {
      return res.status(400).json({
        message: `Order is "${order.status}". The next status must be "${nextStatus}"`
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus };
