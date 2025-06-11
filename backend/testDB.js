require('dotenv').config();
const mongoose = require('mongoose');
const TaxiItem = require('./models/TaxiItem');

async function testDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yelloride');
    console.log('MongoDB 연결 성공');
    
    // taxi_items 데이터 확인
    const count = await TaxiItem.countDocuments();
    console.log(`\n총 taxi_items 데이터 수: ${count}개`);
    
    // 지역별 데이터 확인
    const regions = await TaxiItem.distinct('region');
    console.log('\n사용 가능한 지역:', regions);
    
    // 각 지역별 출발지 확인
    for (const region of regions) {
      const departures = await TaxiItem.distinct('departure_kor', { region });
      console.log(`\n${region} 지역 출발지:`, departures);
    }
    
    // 샘플 데이터 확인
    const samples = await TaxiItem.find().limit(5);
    console.log('\n샘플 데이터:');
    samples.forEach(item => {
      console.log({
        region: item.region,
        departure: item.departure_kor,
        arrival: item.arrival_kor,
        reservation_fee: item.reservation_fee,
        local_payment_fee: item.local_payment_fee
      });
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('DB 테스트 실패:', error);
    process.exit(1);
  }
}

testDB();