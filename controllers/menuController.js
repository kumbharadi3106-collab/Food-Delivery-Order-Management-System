const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

const checkMenuData = (data, isNew) => {
  if (isNew || data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      return 'Menu item name is required';
    }
  }

  if (isNew || data.price !== undefined) {
    if (data.price === undefined) {
      return 'Price is required';
    }
    if (typeof data.price !== 'number' || data.price <= 0) {
      return 'Price must be a number greater than 0';
    }
  }

  if (isNew || data.category !== undefined) {
    if (typeof data.category !== 'string' || data.category.trim() === '') {
      return 'Category is required';
    }
  }

  if (data.availability !== undefined && typeof data.availability !== 'boolean') {
    return 'Availability must be true or false';
  }

  return null;
};

const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const errorMessage = checkMenuData(req.body, true);
    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    const { name, price, category, availability } = req.body;
    const item = await MenuItem.create({ name, price, category, availability });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const errorMessage = checkMenuData(req.body, false);
    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    const updates = {};
    const fields = ['name', 'price', 'category', 'availability'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Send at least one field to update' });
    }

    const item = await MenuItem.findByIdAndUpdate(id, updates, { new: true });
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
