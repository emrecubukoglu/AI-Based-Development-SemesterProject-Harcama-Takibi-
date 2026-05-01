const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const RecurringInfoSchema = new Schema(
  {
    frequency_days: {
      type: Number,
      min: [1, 'frequency_days must be at least 1'],
      required: [true, 'frequency_days is required when transaction is recurring'],
    },
    last_processed_date: {
      type: Date,
      required: [true, 'last_processed_date is required when transaction is recurring'],
    },
  },
  { _id: false }
);

const transactionSchema = new Schema(
  {
    user_id: {
      type: String,
      required: [true, 'user_id is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'type must be either "income" or "expense"',
      },
    },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0, 'amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'date is required'],
      default: Date.now,
    },
    is_recurring: {
      type: Boolean,
      default: false,
    },
    recurring_info: {
      type: RecurringInfoSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// next parametresini sildik
transactionSchema.pre('validate', function () {
  if (this.is_recurring && !this.recurring_info) {
    this.invalidate('recurring_info', 'recurring_info is required when is_recurring is true');
  }
  // next(); satırını da tamamen sildik
});

const Transaction = model('Transaction', transactionSchema);

module.exports = Transaction;
