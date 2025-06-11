require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const TaxiItem = require('../models/TaxiItem');

const seedData = [
  // NYC 지역 데이터
  {
    region: 'NYC',
    departure_kor: '맨해튼',
    departure_eng: 'Manhattan',
    arrival_kor: 'JFK공항',
    arrival_eng: 'JFK Airport',
    reservation_fee: 50,
    local_payment_fee: 80,
    departure_is_airport: false,
    arrival_is_airport: true,
    priority: 1
  },
  {
    region: 'NYC',
    departure_kor: 'JFK공항',
    departure_eng: 'JFK Airport',
    arrival_kor: '맨해튼',
    arrival_eng: 'Manhattan',
    reservation_fee: 50,
    local_payment_fee: 80,
    departure_is_airport: true,
    arrival_is_airport: false,
    priority: 1
  },
  {
    region: 'NYC',
    departure_kor: '맨해튼',
    departure_eng: 'Manhattan',
    arrival_kor: '뉴어크공항',
    arrival_eng: 'Newark Airport',
    reservation_fee: 60,
    local_payment_fee: 90,
    departure_is_airport: false,
    arrival_is_airport: true,
    priority: 2
  },
  {
    region: 'NYC',
    departure_kor: '뉴어크공항',
    departure_eng: 'Newark Airport',
    arrival_kor: '맨해튼',
    arrival_eng: 'Manhattan',
    reservation_fee: 60,
    local_payment_fee: 90,
    departure_is_airport: true,
    arrival_is_airport: false,
    priority: 2
  },
  {
    region: 'NYC',
    departure_kor: '맨해튼',
    departure_eng: 'Manhattan',
    arrival_kor: '라과디아공항',
    arrival_eng: 'LaGuardia Airport',
    reservation_fee: 40,
    local_payment_fee: 60,
    departure_is_airport: false,
    arrival_is_airport: true,
    priority: 3
  },
  {
    region: 'NYC',
    departure_kor: '라과디아공항',
    departure_eng: 'LaGuardia Airport',
    arrival_kor: '맨해튼',
    arrival_eng: 'Manhattan',
    reservation_fee: 40,
    local_payment_fee: 60,
    departure_is_airport: true,
    arrival_is_airport: false,
    priority: 3
  },
  // LA 지역 데이터
  {
    region: 'LA',
    departure_kor: '다운타운',
    departure_eng: 'Downtown',
    arrival_kor: 'LAX공항',
    arrival_eng: 'LAX Airport',
    reservation_fee: 45,
    local_payment_fee: 70,
    departure_is_airport: false,
    arrival_is_airport: true,
    priority: 1
  },
  {
    region: 'LA',
    departure_kor: 'LAX공항',
    departure_eng: 'LAX Airport',
    arrival_kor: '다운타운',
    arrival_eng: 'Downtown',
    reservation_fee: 45,
    local_payment_fee: 70,
    departure_is_airport: true,
    arrival_is_airport: false,
    priority: 1
  },
  {
    region: 'LA',
    departure_kor: '베벌리힐스',
    departure_eng: 'Beverly Hills',
    arrival_kor: 'LAX공항',
    arrival_eng: 'LAX Airport',
    reservation_fee: 40,
    local_payment_fee: 60,
    departure_is_airport: false,
    arrival_is_airport: true,
    priority: 2
  },
  {
    region: 'LA',
    departure_kor: 'LAX공항',
    departure_eng: 'LAX Airport',
    arrival_kor: '베벌리힐스',
    arrival_eng: 'Beverly Hills',
    reservation_fee: 40,
    local_payment_fee: 60,
    departure_is_airport: true,
    arrival_is_airport: false,
    priority: 2
  }
];

async function seedDatabase() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yelloride');
    console.log('MongoDB 연결 성공');

    // 기존 데이터 삭제
    await TaxiItem.deleteMany({});
    console.log('기존 데이터 삭제 완료');

    // 새 데이터 삽입
    await TaxiItem.insertMany(seedData);
    console.log(`${seedData.length}개의 택시 요금 데이터 삽입 완료`);

    // 연결 종료
    await mongoose.connection.close();
    console.log('Seed 완료');
  } catch (error) {
    console.error('Seed 실패:', error);
    process.exit(1);
  }
}

seedDatabase();