const mongoose = require('mongoose');

const taxiItemSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
    index: true
  },
  departure_kor: {
    type: String,
    required: true,
    index: true
  },
  departure_eng: {
    type: String,
    required: true
  },
  departure_is_airport: {
    type: String,
    enum: ['Y', 'N']
  },
  arrival_kor: {
    type: String,
    required: true,
    index: true
  },
  arrival_eng: {
    type: String,
    required: true
  },
  arrival_is_airport: {
    type: String,
    enum: ['Y', 'N']
  },
  reservation_fee: {
    type: Number,
    required: true
  },
  local_payment_fee: {
    type: Number,
    required: true
  },
  priority: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// 복합 인덱스 - 출발지와 지역으로 빠른 검색
taxiItemSchema.index({ departure_kor: 1, region: 1 });
taxiItemSchema.index({ arrival_kor: 1, region: 1 });

const TaxiItem = mongoose.model('TaxiItem', taxiItemSchema, 'taxi_item');

module.exports = TaxiItem;