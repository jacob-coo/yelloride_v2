const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  booking_number: {
    type: String,
    required: true,
    unique: true
  },
  serviceTypeCode: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true,
    enum: ['LA', 'NY', 'NJ']
  },
  isRoundTrip: {
    type: Boolean,
    default: false
  },
  
  // 여행 정보
  trips: [{
    departure: {
      type: String,
      required: true
    },
    arrival: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    passengers: {
      type: Number,
      required: true,
      min: 1
    },
    luggage: {
      type: Number,
      default: 0
    }
  }],
  
  // 고객 정보
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    kakaoId: String,
    flightInfo: {
      flightNumber: String,
      arrivalTime: String
    }
  },
  
  // 옵션
  options: {
    simCard: {
      type: Boolean,
      default: false
    },
    carSeat: {
      needed: {
        type: Boolean,
        default: false
      },
      type: {
        type: String,
        enum: ['infant', 'regular', 'booster'],
        default: 'regular'
      },
      onSitePayment: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // 결제 정보
  paymentInfo: {
    method: {
      type: String,
      enum: ['deposit', 'full'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    fee: {
      type: Number,
      default: 0
    }
  },
  
  // 특별 요청
  specialRequests: String,
  
  // 가격 정보
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    additionalCharges: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      required: true
    }
  },
  
  // 상태
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// 인덱스
bookingSchema.index({ booking_number: 1 });
bookingSchema.index({ 'customerInfo.phone': 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

module.exports = Booking;