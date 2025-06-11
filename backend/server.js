const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./database');
const TaxiItem = require('./models/TaxiItem');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB 연결
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 기본 라우트
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'YelloRide API Server' });
});

// 사용 가능한 지역 목록 조회
app.get('/api/regions', async (req, res) => {
  try {
    // taxi_items 컬렉션에서 고유한 지역 목록을 조회
    const regions = await TaxiItem.distinct('region');
    
    // 지역 목록을 정렬하여 반환
    res.json(regions.sort());
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ message: '지역 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 지역별 출발지 목록 조회
app.get('/api/routes/:region/departures', async (req, res) => {
  try {
    const { region } = req.params;
    
    // 해당 지역의 모든 고유 출발지 조회 (한국어)
    const departures = await TaxiItem.distinct('departure_kor', { 
      region: region.toUpperCase()
    });
    
    res.json(departures.sort());
  } catch (error) {
    console.error('Error fetching departures:', error);
    res.status(500).json({ message: '출발지 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 출발지 기준 도착지 목록 조회
app.get('/api/routes/:region/arrivals', async (req, res) => {
  try {
    const { region } = req.params;
    const { departure } = req.query;
    
    if (!departure) {
      return res.status(400).json({ message: '출발지를 선택해주세요.' });
    }
    
    // 선택한 출발지에서 갈 수 있는 도착지만 조회 (한국어)
    const routes = await TaxiItem.find({ 
      region: region.toUpperCase(),
      departure_kor: departure
    }).select('arrival_kor').lean();
    
    const arrivals = [...new Set(routes.map(r => r.arrival_kor))].sort();
    
    res.json(arrivals);
  } catch (error) {
    console.error('Error fetching arrivals:', error);
    res.status(500).json({ message: '도착지 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 경로 검색 (MongoDB에서)
app.get('/api/route', async (req, res) => {
  try {
    const { departure, arrival, region } = req.query;
    
    if (!departure || !arrival || !region) {
      return res.status(400).json({ message: '출발지, 도착지, 지역을 모두 입력해주세요.' });
    }
    
    const route = await TaxiItem.findOne({
      departure_kor: departure,
      arrival_kor: arrival,
      region: region.toUpperCase()
    });
    
    if (!route) {
      return res.status(404).json({ message: '해당 경로의 요금 정보가 없습니다.' });
    }
    
    // 실제 DB 구조에 맞게 응답
    res.json({
      departure: route.departure_kor,
      arrival: route.arrival_kor,
      reservation_fee: route.reservation_fee,
      local_payment_fee: route.local_payment_fee,
      total_price: route.reservation_fee + route.local_payment_fee,
      departure_is_airport: route.departure_is_airport,
      arrival_is_airport: route.arrival_is_airport,
      priority: route.priority
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ message: '경로 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 예약 생성
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // 예약 번호 생성
    const bookingId = 'YR' + Date.now().toString().slice(-8);
    
    // 새로운 예약 생성
    const newBooking = new Booking({
      ...bookingData,
      bookingId
    });
    
    // 데이터베이스에 저장
    const savedBooking = await newBooking.save();
    
    res.json({
      success: true,
      bookingId,
      message: '예약이 완료되었습니다.',
      data: savedBooking
    });
  } catch (error) {
    console.error('예약 저장 실패:', error);
    res.status(500).json({ 
      success: false,
      message: '예약 저장 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`YelloRide server is running on port ${PORT}`);
});