const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true, // Her kategori için tek bir limit olsun
    trim: true
  },
  limitAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);