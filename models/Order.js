const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
      },
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['placed', 'preparing', 'out for delivery', 'delivered'],
    default: 'placed'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
