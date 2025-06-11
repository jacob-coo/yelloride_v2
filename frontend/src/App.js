/**
 * YelloRide - 토스/쏘카 스타일 택시예약 앱
 * 깔끔하고 직관적인 F형 레이아웃
 */
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Luggage, 
  Phone, 
  MessageCircle,
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Smartphone,
  Baby,
  AlertCircle
} from 'lucide-react';
import HeroImageSlider from './components/HeroImageSlider';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// API Service
class APIService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getLocations(region) {
    return this.request(`/routes/${region}`);
  }

  async getDepartures(region) {
    return this.request(`/routes/${region}/departures`);
  }

  async getArrivals(region, departure) {
    const params = new URLSearchParams({ departure });
    return this.request(`/routes/${region}/arrivals?${params}`);
  }

  async searchRoute(departure, arrival, region) {
    const params = new URLSearchParams({ departure, arrival, region });
    return this.request(`/route?${params}`);
  }

  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async getRegions() {
    return this.request('/regions');
  }
}

const api = new APIService();

function App() {
  // URL 파라미터로 단계 관리
  const [step, setStep] = useState('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  // URL 파라미터 관리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    const validSteps = ['landing', 'region', 'route', 'passengers', 'customer', 'airport', 'options', 'payment', 'complete'];
    
    if (stepParam && validSteps.includes(stepParam)) {
      setStep(stepParam);
    } else {
      setStep('landing');
    }
  }, []);

  // 랜딩 페이지일 때만 body 클래스 추가
  useEffect(() => {
    if (step === 'landing') {
      document.body.classList.add('landing-mode');
    } else {
      document.body.classList.remove('landing-mode');
    }
    
    return () => {
      document.body.classList.remove('landing-mode');
    };
  }, [step]);

  // 단계 변경 시 URL 업데이트 및 스크롤 최상단 이동
  const updateStep = (newStep) => {
    setStep(newStep);
    const url = new URL(window.location);
    if (newStep === 'landing') {
      url.searchParams.delete('step');
    } else {
      url.searchParams.set('step', newStep);
    }
    window.history.pushState({}, '', url);
    
    // 페이지 변경 시 스크롤 최상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 지역별 위치 데이터
  const [departures, setDepartures] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [returnArrivals, setReturnArrivals] = useState([]);
  
  // 예약 데이터
  const [booking, setBooking] = useState({
    region: '',
    serviceType: 'taxi', // taxi or charter
    isRoundTrip: false,
    
    // 편도/왕복 경로
    outbound: { departure: '', arrival: '', route: null },
    return: { departure: '', arrival: '', route: null },
    
    // 승객/짐
    passengers: 1,
    luggage: 0,
    returnPassengers: 1,
    returnLuggage: 0,
    
    // 고객 정보
    customer: {
      name: '',
      phone: '',
      kakaoId: '',
      email: ''
    },
    
    // 공항 정보
    airport: {
      pickupDate: '',
      arrivalTime: '',
      flightNumber: '',
      address: ''
    },
    returnAirport: {
      pickupDate: '',
      arrivalTime: '',
      flightNumber: '',
      address: ''
    },
    
    // 옵션
    options: {
      sim: false,
      carSeat: false,
      carSeatType: 'regular' // infant, regular, booster
    },
    
    // 결제
    payment: {
      method: 'deposit', // deposit or full
      billing: {
        name: '',
        company: '',
        email: ''
      }
    }
  });

  // 가격 계산
  const calculatePrice = () => {
    let total = 0;
    let details = [];
    
    // 편도 요금 (DB에서 가져온 reservation_fee + local_payment_fee 사용)
    if (booking.outbound.route) {
      const basePrice = (booking.outbound.route.reservation_fee || 0) + (booking.outbound.route.local_payment_fee || 0);
      total += basePrice;
      details.push({ label: '편도 기본요금', amount: basePrice });
      
      // 승객 추가 요금
      if (booking.passengers >= 5) {
        const extra = booking.passengers === 5 ? 5 : 10;
        total += extra;
        details.push({ label: `승객 추가 (${booking.passengers}명)`, amount: extra });
      }
      
      // 짐 추가 요금
      if (booking.luggage >= 3) {
        const extra = 5 + (booking.luggage - 3) * 5;
        total += extra;
        details.push({ label: `짐 추가 (${booking.luggage}개)`, amount: extra });
      }
    }
    
    // 왕복 요금 (DB에서 가져온 reservation_fee + local_payment_fee 사용)
    if (booking.isRoundTrip && booking.return.route) {
      const basePrice = (booking.return.route.reservation_fee || 0) + (booking.return.route.local_payment_fee || 0);
      total += basePrice;
      details.push({ label: '왕복 기본요금', amount: basePrice });
      
      // 왕복 승객 추가 요금
      if (booking.returnPassengers >= 5) {
        const extra = booking.returnPassengers === 5 ? 5 : 10;
        total += extra;
        details.push({ label: `왕복 승객 추가 (${booking.returnPassengers}명)`, amount: extra });
      }
      
      // 왕복 짐 추가 요금
      if (booking.returnLuggage >= 3) {
        const extra = 5 + (booking.returnLuggage - 3) * 5;
        total += extra;
        details.push({ label: `왕복 짐 추가 (${booking.returnLuggage}개)`, amount: extra });
      }
      
      // 왕복 10% 할인
      const discount = Math.round(total * 0.1);
      total -= discount;
      details.push({ label: '왕복 할인 (10%)', amount: -discount });
    }
    
    // 옵션 요금
    if (booking.options.sim) {
      total += 32;
      details.push({ label: '유심 (+$32)', amount: 32 });
    }
    
    if (booking.options.carSeat) {
      const carSeatFee = booking.isRoundTrip ? 20 : 10;
      details.push({ label: `카시트 (현장결제 $${carSeatFee})`, amount: 0, note: '현장결제' });
    }
    
    const reservationFee = booking.isRoundTrip ? 30 : 20;
    const fullPaymentFee = Math.round(total * 0.2);
    
    return {
      total,
      details,
      reservationFee,
      fullPaymentFee: total + fullPaymentFee,
      finalAmount: booking.payment.method === 'deposit' ? reservationFee : total + fullPaymentFee
    };
  };

  // 출발지 목록 로드
  const loadDepartures = async (region) => {
    try {
      setLoading(true);
      const departureList = await api.getDepartures(region);
      setDepartures(departureList);
    } catch (err) {
      console.error('Failed to load departures:', err);
      setError('출발지 목록을 불러오는데 실패했습니다.');
      setDepartures([]);
    } finally {
      setLoading(false);
    }
  };

  // 도착지 목록 로드
  const loadArrivals = async (region, departure) => {
    try {
      setLoading(true);
      const arrivalList = await api.getArrivals(region, departure);
      return arrivalList;
    } catch (err) {
      console.error('Failed to load arrivals:', err);
      setError('도착지 목록을 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 경로 검색
  const searchRoute = async (departure, arrival, region) => {
    try {
      const response = await api.searchRoute(departure, arrival, region);
      return response;
    } catch (err) {
      console.error('Route search failed:', err);
      return null;
    }
  };

  // 새로운 디자인 네비게이션
  const TopNav = ({ title, onBack, showBack = true }) => (
    <div className="nav-container">
      <div className="nav-content">
        {showBack && onBack ? (
          <button className="nav-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="nav-action"></div>
        )}
        <h1 className="nav-title">{title}</h1>
        <div className="nav-action"></div>
      </div>
    </div>
  );

  // 공통 푸터
  const AppFooter = () => (
    <div className="app-footer">
      <div className="footer-content">
        <div className="company-info">
          <strong>Yellow Travel LLC</strong> · 미국 정식 등록 업체
        </div>
        <div className="copyright">
          © 2025 YelloRide. All rights reserved.
        </div>
      </div>
    </div>
  );

  // 심플 로고 (최소한 사용)
  const YelloRideLogo = ({ size = 16, className = "logo-icon", variant = "simple" }) => {
    // 기본적으로 작은 심플 버전만 사용
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="24" height="24" rx="6" fill="currentColor"/>
        <path d="M6 18V9L9 6H15L18 9V12H15V15H12V18H6Z" fill="white"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
      </svg>
    );
  };

  // 스크롤 함수
  const scrollToRegionSelection = () => {
    const element = document.getElementById('region-selection');
    if (element) {
      const offset = element.offsetTop - 80; // 헤더 높이 고려
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    }
  };

  // 새로운 디자인 랜딩 페이지
  const LandingPage = () => {
    if (step !== 'landing') return null;

    const handleStartBooking = () => {
      updateStep('region');
    };

    return <HeroImageSlider onBookingClick={handleStartBooking} />;
  };

  // 새로운 디자인 지역 선택 화면
  const RegionStep = () => {
    const [availableRegions, setAvailableRegions] = useState([]);
    
    useEffect(() => {
      const loadRegions = async () => {
        try {
          const regions = await api.getRegions();
          setAvailableRegions(regions);
        } catch (err) {
          console.error('Failed to load regions:', err);
          setError('지역 목록을 불러오는데 실패했습니다.');
        }
      };
      
      if (step === 'region') {
        loadRegions();
      }
    }, [step]);

    if (step !== 'region') return null;

    return (
      <div className="page-container">
        <TopNav 
          title="어디로 떠나시나요?" 
          onBack={() => updateStep('landing')}
        />
        
        <div className="page-content">
          <h1 className="heading-1">어디로 떠나시나요?</h1>
          <p className="body-1">미국 전역 안전한 단독차량 서비스</p>

          {/* 지역 선택 카드들 */}
          <div className="flex flex-col gap-4">
            {availableRegions.map((region) => {
              const regionNames = { 'NY': '뉴욕', 'NJ': '뉴저지' };
              const regionName = regionNames[region] || region;
              const regionIcons = { 'NY': '🗽', 'NJ': '🌉' };
              const regionIcon = regionIcons[region] || '🚗';
              const airportInfo = {
                'NY': 'JFK • LGA • EWR 공항',
                'NJ': 'EWR • 뉴저지 전역'
              };
              const regionDesc = airportInfo[region] || '공항 및 시내 전역';
              
              return (
                <div 
                  key={region}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={async () => {
                    setLoading(true);
                    setBooking(prev => ({ ...prev, region }));
                    await loadDepartures(region);
                    updateStep('route');
                    setLoading(false);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div style={{ fontSize: '32px' }}>{regionIcon}</div>
                    <div className="flex-1">
                      <h3 className="heading-3">{regionName} 택시 예약</h3>
                      <p className="body-2">{regionDesc}</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 특징 */}
          <div className="mt-6">
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span className="caption">실시간 픽업</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span className="caption">한국어 지원</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span className="caption">투명한 요금</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // RouteStep - 경로 선택 화면
  const RouteStep = () => {
    if (step !== 'route') return null;

    return (
      <div className="step-container">
        <TopNav 
          title="어디로 모셔드릴까요?" 
          onBack={() => updateStep('region')}
        />
        <div className="step-content-top">
            {/* Grid Layout - 타이틀 섹션 */}
            <div className="grid-section title-section">
              <h1 className="main-title-unified">어디로 모셔드릴까요?</h1>
              <p className="main-subtitle-unified">{booking.region === 'NY' ? '뉴욕' : 'LA'} 출발지와 도착지를 선택해주세요</p>
            </div>

            {/* Grid Layout - 왕복 토글 섹션 */}
            <div className="grid-section toggle-section">
              <div className="trip-toggle-unified">
                <div className="toggle-content-grid">
                  <div className="toggle-info-section">
                    <span className="toggle-label-unified">왕복 예약</span>
                    {booking.isRoundTrip && <span className="discount-tag-unified">10% 할인</span>}
                  </div>
                  <div className="toggle-control-section">
                    <label className="switch-unified">
                      <input 
                        type="checkbox"
                        checked={booking.isRoundTrip}
                        onChange={(e) => setBooking(prev => ({ ...prev, isRoundTrip: e.target.checked }))}
                      />
                      <span className="slider-unified"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Layout - 편도 경로 섹션 */}
            <div className="grid-section route-section">
              <div className="route-card-unified">
                <div className="route-header-grid">
                  <h3 className="route-title-unified">편도</h3>
                </div>
                
                <div className="location-inputs-grid">
                  <div className="input-row-grid">
                    <div className="input-group-unified departure-section">
                      <label className="input-label-unified">출발지</label>
                      <select 
                        className="location-select-unified"
                        value={booking.outbound.departure}
                        onChange={async (e) => {
                          const departure = e.target.value;
                          setBooking(prev => ({ 
                            ...prev, 
                            outbound: { ...prev.outbound, departure, arrival: '', route: null }
                          }));
                          
                          if (departure) {
                            setLoading(true);
                            const availableArrivals = await loadArrivals(booking.region, departure);
                            setArrivals(availableArrivals);
                            setLoading(false);
                          } else {
                            setArrivals([]);
                          }
                        }}
                      >
                        <option value="">선택해주세요</option>
                        {departures.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="route-arrow-section">
                      <div className="route-arrow-unified">→</div>
                    </div>
                    
                    <div className="input-group-unified arrival-section">
                      <label className="input-label-unified">도착지</label>
                      <select 
                        className="location-select-unified"
                        value={booking.outbound.arrival}
                        onChange={async (e) => {
                          const arrival = e.target.value;
                          setBooking(prev => ({ 
                            ...prev, 
                            outbound: { ...prev.outbound, arrival, route: null }
                          }));
                          
                          if (booking.outbound.departure && arrival) {
                            setLoading(true);
                            const route = await searchRoute(booking.outbound.departure, arrival, booking.region);
                            if (route) {
                              setBooking(prev => ({ 
                                ...prev, 
                                outbound: { ...prev.outbound, route }
                              }));
                            }
                            setLoading(false);
                          }
                        }}
                        disabled={!booking.outbound.departure}
                      >
                        <option value="">선택해주세요</option>
                        {arrivals.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
            
                {booking.outbound.route && (
                  <div className="price-card-unified">
                    <div className="price-header-grid">
                      <div className="price-status-section">
                        <CheckCircle size={16} color="#10b981" />
                        <span className="price-status-text">경로 확인</span>
                      </div>
                    </div>
                    <div className="price-details-grid">
                      <div className="price-main-section">
                        <div className="total-price-unified">
                          총 ${booking.outbound.route.reservation_fee + booking.outbound.route.local_payment_fee}
                        </div>
                        <div className="price-breakdown-unified">
                          <span>예약금 ${booking.outbound.route.reservation_fee} + 현장결제 ${booking.outbound.route.local_payment_fee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          
            {/* Grid Layout - 왕복 경로 섹션 */}
            {booking.isRoundTrip && (
              <div className="grid-section route-section">
                <div className="route-card-unified">
                  <div className="route-header-grid">
                    <h3 className="route-title-unified">왕복</h3>
                  </div>
                  
                  <div className="location-inputs-grid">
                    <div className="input-row-grid">
                      <div className="input-group-unified departure-section">
                        <label className="input-label-unified">출발지</label>
                        <select 
                          className="location-select-unified"
                          value={booking.return.departure}
                          onChange={async (e) => {
                            const departure = e.target.value;
                            setBooking(prev => ({ 
                              ...prev, 
                              return: { ...prev.return, departure, arrival: '', route: null }
                            }));
                            
                            if (departure) {
                              setLoading(true);
                              const availableArrivals = await loadArrivals(booking.region, departure);
                              setReturnArrivals(availableArrivals);
                              setLoading(false);
                            } else {
                              setReturnArrivals([]);
                            }
                          }}
                        >
                          <option value="">선택해주세요</option>
                          {departures.map(location => (
                            <option key={location} value={location}>{location}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="route-arrow-section">
                        <div className="route-arrow-unified">→</div>
                      </div>
                      
                      <div className="input-group-unified arrival-section">
                        <label className="input-label-unified">도착지</label>
                        <select 
                          className="location-select-unified"
                          value={booking.return.arrival}
                          onChange={async (e) => {
                            const arrival = e.target.value;
                            setBooking(prev => ({ 
                              ...prev, 
                              return: { ...prev.return, arrival, route: null }
                            }));
                            
                            if (booking.return.departure && arrival) {
                              setLoading(true);
                              const route = await searchRoute(booking.return.departure, arrival, booking.region);
                              if (route) {
                                setBooking(prev => ({ 
                                  ...prev, 
                                  return: { ...prev.return, route }
                                }));
                              }
                              setLoading(false);
                            }
                          }}
                          disabled={!booking.return.departure}
                        >
                          <option value="">선택해주세요</option>
                          {returnArrivals.map(location => (
                            <option key={location} value={location}>{location}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {booking.return.route && (
                    <div className="price-card-unified">
                      <div className="price-header-grid">
                        <div className="price-status-section">
                          <CheckCircle size={16} color="#10b981" />
                          <span className="price-status-text">왕복 경로 확인</span>
                        </div>
                      </div>
                      <div className="price-details-grid">
                        <div className="price-main-section">
                          <div className="total-price-unified">
                            총 ${booking.return.route.reservation_fee + booking.return.route.local_payment_fee}
                          </div>
                          <div className="price-breakdown-unified">
                            <span>예약금 ${booking.return.route.reservation_fee} + 현장결제 ${booking.return.route.local_payment_fee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        <div className="app-footer-unified">
          <div className="footer-content-unified">
            <button 
              className="primary-btn-unified"
              disabled={!booking.outbound.route || (booking.isRoundTrip && !booking.return.route)}
              onClick={() => updateStep('passengers')}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    );
  };


  // 인원/짐 선택 화면
  const PassengersStep = () => (
    <div className="step-container">
      <TopNav 
        title="인원 및 짐 개수"
        onBack={() => setStep('route')}
      />
      <div className="step-content">
      
      <div className="passengers-selection">
        {/* 차량 배정 안내 */}
        <div className="vehicle-info">
          <h4>고객님 선택에 따라 차량이 배정됩니다</h4>
          <ul>
            <li><strong>승용차:</strong> 1-3인 캐리어 1-3개</li>
            <li><strong>SUV:</strong> 1-3인 캐리어 3-4개</li>
            <li><strong>미니밴:</strong> 1-6인 캐리어 5-10개</li>
          </ul>
          
          <div className="luggage-notes">
            <p>• 캐리어는 기내용, 수화물 사이즈 상관없이 1개</p>
            <p>• 3단 이민가방/대형 유모차/골프가방은 2개로 선택</p>
            <p>• 기내용 캐리어 사이즈(20인치) 미만의 핸드백/백팩/쇼핑백 등 무료</p>
            {booking.region === 'LA' && (
              <p>• <strong>LA지역 예약시 4인 이상은 반드시 짐갯수 5개 임의 선택필수</strong></p>
            )}
          </div>
        </div>
        
        {/* 편도 인원/짐 - 개선된 카드 레이아웃 */}
        <div className="passengers-cards">
          <h4 className="section-title">편도</h4>
          
          <div className="counter-cards-grid">
            {/* 승객 수 카드 */}
            <div className="counter-card">
              <div className="counter-card-header">
                <Users size={20} className="counter-icon" />
                <span className="counter-title">승객 수</span>
              </div>
              <div className="counter-controls">
                <button 
                  className="counter-btn"
                  onClick={() => setBooking(prev => ({ ...prev, passengers: Math.max(1, prev.passengers - 1) }))}
                  disabled={booking.passengers <= 1}
                >
                  <Minus size={18} />
                </button>
                <div className="counter-display">
                  <span className="counter-value">{booking.passengers}</span>
                  <span className="counter-unit">명</span>
                </div>
                <button 
                  className="counter-btn"
                  onClick={() => setBooking(prev => ({ ...prev, passengers: Math.min(6, prev.passengers + 1) }))}
                  disabled={booking.passengers >= 6}
                >
                  <Plus size={18} />
                </button>
              </div>
              {booking.passengers >= 5 && (
                <div className="surcharge-note">
                  <span className="surcharge-text">추가 요금: +${booking.passengers === 5 ? 5 : 10}</span>
                  <small>5명부터 추가요금 발생</small>
                </div>
              )}
            </div>

            {/* 짐 개수 카드 */}
            <div className="counter-card">
              <div className="counter-card-header">
                <Luggage size={20} className="counter-icon" />
                <span className="counter-title">짐 개수</span>
              </div>
              <div className="counter-controls">
                <button 
                  className="counter-btn"
                  onClick={() => setBooking(prev => ({ ...prev, luggage: Math.max(0, prev.luggage - 1) }))}
                  disabled={booking.luggage <= 0}
                >
                  <Minus size={18} />
                </button>
                <div className="counter-display">
                  <span className="counter-value">{booking.luggage}</span>
                  <span className="counter-unit">개</span>
                </div>
                <button 
                  className="counter-btn"
                  onClick={() => setBooking(prev => ({ ...prev, luggage: Math.min(10, prev.luggage + 1) }))}
                  disabled={booking.luggage >= 10}
                >
                  <Plus size={18} />
                </button>
              </div>
              {booking.luggage >= 3 && (
                <div className="surcharge-note">
                  <span className="surcharge-text">추가 요금: +${5 + (booking.luggage - 3) * 5}</span>
                  <small>3개부터 추가요금 발생</small>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 왕복 인원/짐 - 개선된 카드 레이아웃 */}
        {booking.isRoundTrip && (
          <div className="passengers-cards">
            <h4 className="section-title">왕복</h4>
            
            <div className="counter-cards-grid">
              {/* 왕복 승객 수 카드 */}
              <div className="counter-card">
                <div className="counter-card-header">
                  <Users size={20} className="counter-icon" />
                  <span className="counter-title">승객 수</span>
                </div>
                <div className="counter-controls">
                  <button 
                    className="counter-btn"
                    onClick={() => setBooking(prev => ({ ...prev, returnPassengers: Math.max(1, prev.returnPassengers - 1) }))}
                    disabled={booking.returnPassengers <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <div className="counter-display">
                    <span className="counter-value">{booking.returnPassengers}</span>
                    <span className="counter-unit">명</span>
                  </div>
                  <button 
                    className="counter-btn"
                    onClick={() => setBooking(prev => ({ ...prev, returnPassengers: Math.min(6, prev.returnPassengers + 1) }))}
                    disabled={booking.returnPassengers >= 6}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {booking.returnPassengers >= 5 && (
                  <div className="surcharge-note">
                    <span className="surcharge-text">추가 요금: +${booking.returnPassengers === 5 ? 5 : 10}</span>
                    <small>5명부터 추가요금 발생</small>
                  </div>
                )}
              </div>

              {/* 왕복 짐 개수 카드 */}
              <div className="counter-card">
                <div className="counter-card-header">
                  <Luggage size={20} className="counter-icon" />
                  <span className="counter-title">짐 개수</span>
                </div>
                <div className="counter-controls">
                  <button 
                    className="counter-btn"
                    onClick={() => setBooking(prev => ({ ...prev, returnLuggage: Math.max(0, prev.returnLuggage - 1) }))}
                    disabled={booking.returnLuggage <= 0}
                  >
                    <Minus size={18} />
                  </button>
                  <div className="counter-display">
                    <span className="counter-value">{booking.returnLuggage}</span>
                    <span className="counter-unit">개</span>
                  </div>
                  <button 
                    className="counter-btn"
                    onClick={() => setBooking(prev => ({ ...prev, returnLuggage: Math.min(10, prev.returnLuggage + 1) }))}
                    disabled={booking.returnLuggage >= 10}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {booking.returnLuggage >= 3 && (
                  <div className="surcharge-note">
                    <span className="surcharge-text">추가 요금: +${5 + (booking.returnLuggage - 3) * 5}</span>
                    <small>3개부터 추가요금 발생</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* LA 4인 이상 경고 */}
        {booking.region === 'LA' && booking.passengers >= 4 && booking.luggage < 5 && (
          <div className="warning">
            <AlertCircle size={16} />
            LA지역 4인 이상 예약시 짐 개수를 최소 5개로 선택해주세요
          </div>
        )}
        
        </div>
        
        {/* Sticky 다음 버튼 */}
        <div className="sticky-next-section">
          <button 
            className="next-btn-enhanced"
            disabled={booking.region === 'LA' && booking.passengers >= 4 && booking.luggage < 5}
            onClick={() => setStep('customer')}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );

  // 고객 정보 입력 화면
  const CustomerStep = () => (
    <div className="step-container">
      <TopNav 
        title="탑승자 정보"
        onBack={() => setStep('passengers')}
      />
      <div className="step-content">
      
      <div className="customer-form">
        {/* 개인정보 보안 안내 */}
        <div className="privacy-assurance">
          <div className="security-header">
            <span className="security-icon">🔒</span>
            <h3>개인정보는 안전하게 보호됩니다</h3>
          </div>
          <div className="security-features">
            <div className="security-item">
              <CheckCircle size={14} color="#00C851" />
              <span>SSL 암호화 전송</span>
            </div>
            <div className="security-item">
              <CheckCircle size={14} color="#00C851" />
              <span>예약 목적만 사용</span>
            </div>
            <div className="security-item">
              <CheckCircle size={14} color="#00C851" />
              <span>제3자 제공 금지</span>
            </div>
          </div>
        </div>

        <div className="form-notice">
          <div className="notice-header">
            <span>📞</span>
            <h4>원활한 서비스를 위한 연락처 안내</h4>
          </div>
          <div className="notice-content">
            <p>• 픽업 당일 기사님이 도착 후 개별 연락드립니다</p>
            <p>• 미국 번호가 없으신 경우 카카오톡 연결된 한국 번호를 작성해주세요</p>
            <p>• 카카오톡 ID는 대화명이 아닌 검색 가능한 ID를 입력해주세요</p>
            
            <div className="example-box">
              <strong>올바른 예시:</strong>
              <div className="examples">
                <span className="correct">✓ 카카오톡 ID: kim85</span>
                <span className="incorrect">✗ 이메일 주소: kim@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-fields">
          <div className="form-group">
            <label>이름 (한글) *</label>
            <input 
              type="text"
              value={booking.customer.name}
              onChange={(e) => setBooking(prev => ({ 
                ...prev, 
                customer: { ...prev.customer, name: e.target.value }
              }))}
              placeholder="홍길동"
            />
          </div>
          
          <div className="form-group">
            <label>전화번호 *</label>
            <input 
              type="tel"
              value={booking.customer.phone}
              onChange={(e) => setBooking(prev => ({ 
                ...prev, 
                customer: { ...prev.customer, phone: e.target.value }
              }))}
              placeholder="+1-555-1234 또는 010-1234-5678"
            />
          </div>
          
          <div className="form-group">
            <label>카카오톡 ID *</label>
            <input 
              type="text"
              value={booking.customer.kakaoId}
              onChange={(e) => setBooking(prev => ({ 
                ...prev, 
                customer: { ...prev.customer, kakaoId: e.target.value }
              }))}
              placeholder="kim85 (대화명이 아닌 ID)"
            />
          </div>
        </div>
        </div>
      
      <div className="bottom-section">
        <button 
          className="next-btn"
          disabled={!booking.customer.name || !booking.customer.phone || !booking.customer.kakaoId}
          onClick={() => {
            // 공항 정보가 필요한지 체크
            const needsAirportInfo = 
              booking.outbound.route?.departure_is_airport || 
              booking.outbound.route?.arrival_is_airport ||
              (booking.isRoundTrip && (booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport));
            
            setStep(needsAirportInfo ? 'airport' : 'options');
          }}
        >
          다음
        </button>
      </div>
      </div>
    </div>
  );

  // 공항 정보 입력 화면 (공항 경로가 있을 때만)
  const AirportStep = () => (
    <div className="step-container">
      <TopNav 
        title="픽업을 위한 추가정보"
        onBack={() => setStep('customer')}
      />
      <div className="step-content">
      
      <div className="airport-form">
        <div className="form-notice">
          <p>정확한 정보기입을 위해 작성시 안내되는 내용을 꼭 확인해 주세요.</p>
          
          <div className="notice-section">
            <h4>비행기 도착시간</h4>
            <ul>
              <li>공항 픽업의 경우 비행편명을 조회하여 실제 비행기 도착시간부터 [국제선:1시간30분], [국내선:1시간] 무료대기이며, 이후 30분당 $15 추가됩니다.</li>
              <li>주의 24시간 형식! 밤 9시 55분 도착 비행기는 21:50 선택(반내림)</li>
              <li>시간 선택시 24시간제입니다. (예시) 4PM은 16:00선택해야 하며 04:00 선택시 새벽 4시에 배차되어 노쇼시 현장결제금 전액이 자동 결제되니 주의해 주세요.</li>
              <li>탑승 4시간 전의 긴급 예약일 경우 배차 가능 차량 여부에 따라 대기 시간 발생 및 예약이 취소 될 수 있습니다.</li>
            </ul>
          </div>
          
          <div className="notice-section">
            <h4>공항/편명</h4>
            <ul>
              <li>편명을 실시간 조회하여 실제 도착시간을 확인합니다.</li>
              <li>조회 안되는 경우 픽업이 지연되니 정확히 기입해 주세요.</li>
            </ul>
          </div>
        </div>
        
        {/* 편도 공항 정보 */}
        {(booking.outbound.route?.departure_is_airport || booking.outbound.route?.arrival_is_airport) && (
          <div className="airport-section">
            <h4>편도 공항 정보</h4>
            <div className="form-fields">
              <div className="form-group">
                <label>픽업 요청날짜 *</label>
                <input 
                  type="date"
                  value={booking.airport.pickupDate}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    airport: { ...prev.airport, pickupDate: e.target.value }
                  }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label>비행기 도착시간 *</label>
                <input 
                  type="time"
                  value={booking.airport.arrivalTime}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    airport: { ...prev.airport, arrivalTime: e.target.value }
                  }))}
                />
              </div>
              
              <div className="form-group">
                <label>공항/편명 *</label>
                <input 
                  type="text"
                  value={booking.airport.flightNumber}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    airport: { ...prev.airport, flightNumber: e.target.value }
                  }))}
                  placeholder="예: KE001, AA123"
                />
              </div>
              
              <div className="form-group">
                <label>목적지 상세 주소</label>
                <textarea 
                  value={booking.airport.address}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    airport: { ...prev.airport, address: e.target.value }
                  }))}
                  placeholder="상세 주소를 입력해주세요"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* 왕복 공항 정보 */}
        {booking.isRoundTrip && (booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport) && (
          <div className="airport-section">
            <h4>왕복 공항 정보</h4>
            <div className="form-fields">
              <div className="form-group">
                <label>픽업 요청날짜 *</label>
                <input 
                  type="date"
                  value={booking.returnAirport.pickupDate}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    returnAirport: { ...prev.returnAirport, pickupDate: e.target.value }
                  }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label>비행기 도착시간 *</label>
                <input 
                  type="time"
                  value={booking.returnAirport.arrivalTime}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    returnAirport: { ...prev.returnAirport, arrivalTime: e.target.value }
                  }))}
                />
              </div>
              
              <div className="form-group">
                <label>공항/편명 *</label>
                <input 
                  type="text"
                  value={booking.returnAirport.flightNumber}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    returnAirport: { ...prev.returnAirport, flightNumber: e.target.value }
                  }))}
                  placeholder="예: KE001, AA123"
                />
              </div>
              
              <div className="form-group">
                <label>목적지 상세 주소</label>
                <textarea 
                  value={booking.returnAirport.address}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    returnAirport: { ...prev.returnAirport, address: e.target.value }
                  }))}
                  placeholder="상세 주소를 입력해주세요"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
        
        <button 
          className="next-btn"
          onClick={() => setStep('options')}
        >
          다음
        </button>
        </div>
      </div>
    </div>
  );

  // 옵션 선택 화면
  const OptionsStep = () => {
    // 카시트 타입 변경 핸들러
    const handleCarSeatTypeChange = (value) => {
      setBooking(prev => ({ 
        ...prev, 
        options: { ...prev.options, carSeatType: value }
      }));
    };

    return (
      <div className="step-container">
        <TopNav 
          title="옵션 상품"
          onBack={() => {
            const needsAirportInfo = 
              booking.outbound.route?.departure_is_airport || 
              booking.outbound.route?.arrival_is_airport ||
              (booking.isRoundTrip && (booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport));
            
            setStep(needsAirportInfo ? 'airport' : 'customer');
          }}
        />
        <div className="step-content">
        
        <div className="options-form">
          <div className="option-cards">
            {/* 유심 옵션 */}
            <div className={`option-card ${booking.options.sim ? 'selected' : ''}`}>
              <div className="option-header">
                <div className="option-icon">
                  <Smartphone size={24} />
                </div>
                <div className="option-info">
                  <h4>유심 (+$32)</h4>
                  <p>사전결제: 개통하여 택시에서 전달해 드립니다</p>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox"
                    checked={booking.options.sim}
                    onChange={(e) => setBooking(prev => ({ 
                      ...prev, 
                      options: { ...prev.options, sim: e.target.checked }
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              {booking.options.sim && (
                <div className="option-details">
                  <h5>유심 정보</h5>
                  <ul>
                    <li>미국전역 사용 / 국제전화 무제한</li>
                    <li>데이터 무제한 (12gb LTE 이후 2/3g 무제한)</li>
                    <li>첫 택시탑승일 수령</li>
                  </ul>
                  <div className="device-compatibility">
                    <p><strong>사용가능기종:</strong> 아이폰 8 이상 상위 기종, 삼성 갤럭시S,노트,Z플립, Z폴드</p>
                    <p><strong>사용불가능 기종:</strong> 삼성 겔럭시A, J, LG 전기종, 샤오미등 해외브렌드</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* 카시트 옵션 */}
            <div className={`option-card ${booking.options.carSeat ? 'selected' : ''}`}>
              <div className="option-header">
                <div className="option-icon">
                  <Baby size={24} />
                </div>
                <div className="option-info">
                  <h4>카시트 (+$10)</h4>
                  <p>현장 추가결제: 차량에 미리 준비됩니다</p>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox"
                    checked={booking.options.carSeat}
                    onChange={(e) => setBooking(prev => ({ 
                      ...prev, 
                      options: { ...prev.options, carSeat: e.target.checked }
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              {booking.options.carSeat && (
                <div className="option-details">
                  <h5>카시트 종류</h5>
                  <div className="car-seat-types">
                    <label className="radio-option">
                      <input 
                        type="radio"
                        name="carSeatType"
                        value="infant"
                        checked={booking.options.carSeatType === 'infant'}
                        onChange={() => handleCarSeatTypeChange('infant')}
                        disabled={booking.region !== 'LA'}
                      />
                      <span>영유아: 1세 미만 {booking.region !== 'LA' ? '(LA지역만)' : ''}</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio"
                        name="carSeatType"
                        value="regular"
                        checked={booking.options.carSeatType === 'regular'}
                        onChange={() => handleCarSeatTypeChange('regular')}
                      />
                      <span>일반: 1-6세 미만</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio"
                        name="carSeatType"
                        value="booster"
                        checked={booking.options.carSeatType === 'booster'}
                        onChange={() => handleCarSeatTypeChange('booster')}
                      />
                      <span>부스터: 6세 이상</span>
                    </label>
                  </div>
                  
                  <div className="car-seat-notes">
                    <p>• 카시트는 한 차량당 1개까지만 가능</p>
                    <p>• 비용은 택시요금에 포함되지 않으니 택시이용시 기사님께 따로 지불해 주세요</p>
                    <p>• 뉴저지 출발 구간 이동은 카시트 추가가 불가합니다</p>
                    <p>• 왕복 예약 카시트 추가 시 자동으로 왕복 모두 현장결제금 $10 추가됩니다</p>
                    <p><strong>현장 현금결제: ${booking.isRoundTrip ? 20 : 10}</strong></p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="next-btn"
            onClick={() => setStep('payment')}
          >
            다음
          </button>
          </div>
        </div>
      </div>
    );
  };

  // 결제 화면
  const PaymentStep = () => {
    const price = calculatePrice();
    
    return (
      <div className="step-container">
        <TopNav 
          title="결제"
          onBack={() => setStep('options')}
        />
        <div className="step-content">
        
        <div className="payment-form">
          {/* 결제 보안 안내 */}
          <div className="security-banner">
            <div className="security-content">
              <span className="security-icon">🔒</span>
              <div>
                <div className="security-title">안전한 결제</div>
                <div className="security-desc">256-bit SSL 암호화 보호</div>
              </div>
            </div>
          </div>

          {/* 주문 요약 - 개선된 구조 */}
          <div className="order-summary-card">
            <div className="card-header">
              <h3>주문 요약</h3>
              <div className="trust-badge">
                <CheckCircle size={14} />
                <span>투명한 요금</span>
              </div>
            </div>
            
            <div className="price-table">
              {price.details.map((item, index) => (
                <div key={index} className="price-row">
                  <span className="price-label">{item.label}</span>
                  <span className="price-value">
                    {item.amount > 0 ? `${item.amount}` : item.amount < 0 ? `-${Math.abs(item.amount)}` : ''}
                    {item.note && <span className="price-note">({item.note})</span>}
                  </span>
                </div>
              ))}
              <div className="price-divider"></div>
              <div className="price-row total">
                <span className="price-label">총 요금</span>
                <span className="price-value total-amount">${price.total}</span>
              </div>
            </div>
          </div>
          
          {/* 결제 방법 선택 - RadioCard 구조 */}
          <div className="payment-section">
            <div className="section-header">
              <h3>결제 방법</h3>
              <p>편리한 결제 방법을 선택해주세요</p>
            </div>
            
            <div className="radio-card-group">
              {/* 예약금 결제 카드 */}
              <label className={`radio-card recommended ${booking.payment.method === 'deposit' ? 'selected' : ''}`}>
                <div className="card-badge">추천</div>
                <input 
                  type="radio"
                  name="paymentMethod"
                  value="deposit"
                  checked={booking.payment.method === 'deposit'}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    payment: { ...prev.payment, method: e.target.value }
                  }))}
                />
                <div className="card-content">
                  <div className="card-main">
                    <div className="card-title">
                      예약금 결제
                      <span className="no-fee-badge">수수료 없음</span>
                    </div>
                    <div className="card-desc">현장에서 잔액 결제. 추가 수수료 없음</div>
                    <div className="card-price">${price.reservationFee}</div>
                  </div>
                  <div className="card-benefits">
                    <span className="benefit-item">✓ 추가 수수료 없음</span>
                    <span className="benefit-item">✓ 현장 결제 유연성</span>
                  </div>
                </div>
              </label>
              
              {/* 일시불 결제 카드 */}
              <label className={`radio-card ${booking.payment.method === 'full' ? 'selected' : ''}`}>
                <input 
                  type="radio"
                  name="paymentMethod"
                  value="full"
                  checked={booking.payment.method === 'full'}
                  onChange={(e) => setBooking(prev => ({ 
                    ...prev, 
                    payment: { ...prev.payment, method: e.target.value }
                  }))}
                />
                <div className="card-content">
                  <div className="card-main">
                    <div className="card-title">
                      일시불 결제
                      <span className="fee-badge">20% 수수료 포함</span>
                    </div>
                    <div className="card-desc">현장에서 결제 불필요. 수수료 포함</div>
                    <div className="card-price">
                      ${price.fullPaymentFee}
                      <span className="sub-price">(수수료 ${price.fullPaymentFee - price.total})</span>
                    </div>
                  </div>
                  <div className="card-benefits">
                    <span className="benefit-item">✓ 현장 결제 불필요</span>
                    <span className="benefit-item">✓ 예약 완전 확정</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          {/* 결제 정보 입력 - 개선된 폼 */}
          <div className="form-section">
            <h3>결제자 정보</h3>
            <div className="form-card">
              <div className="form-row">
                <div className="form-group">
                  <label>이름 (한글) *</label>
                  <input 
                    type="text"
                    value={booking.payment.billing.name}
                    onChange={(e) => setBooking(prev => ({ 
                      ...prev, 
                      payment: { 
                        ...prev.payment, 
                        billing: { ...prev.payment.billing, name: e.target.value }
                      }
                    }))}
                    placeholder="홍길동"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>회사명 (선택)</label>
                  <input 
                    type="text"
                    value={booking.payment.billing.company}
                    onChange={(e) => setBooking(prev => ({ 
                      ...prev, 
                      payment: { 
                        ...prev.payment, 
                        billing: { ...prev.payment.billing, company: e.target.value }
                      }
                    }))}
                    placeholder="회사명을 입력하세요"
                    className="form-input optional"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>이메일 주소 *</label>
                  <input 
                    type="email"
                    value={booking.payment.billing.email}
                    onChange={(e) => setBooking(prev => ({ 
                      ...prev, 
                      payment: { 
                        ...prev.payment, 
                        billing: { ...prev.payment.billing, email: e.target.value }
                      }
                    }))}
                    placeholder="example@gmail.com"
                    className="form-input"
                  />
                  <div className="form-hint">
                    예약 확정서를 받으실 이메일 주소입니다. 
                    <button type="button" className="hint-toggle">자세히 보기</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 약관 동의 - 간소화 */}
          <div className="terms-section">
            <div className="terms-card">
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    <strong>[필수]</strong> 예약 정보는 이메일로 발송됩니다. 반드시 확인해 주세요.
                  </span>
                </label>
                
                <label className="checkbox-item">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    <strong>[필수]</strong> 이용약관 및 개인정보 수집에 동의합니다.
                    <button type="button" className="terms-link">약관 보기</button>
                  </span>
                </label>
              </div>
            </div>
          </div>
          </div>
        </div>
        
        {/* Sticky Footer */}
        <div className="payment-footer">
          <div className="footer-content">
            <div className="total-summary">
              <span className="total-label">총 {price.total > price.finalAmount ? '결제' : ''}금액</span>
              <span className="total-price">${price.finalAmount}</span>
            </div>
            <button 
              className="payment-cta"
              disabled={!booking.payment.billing.name || !booking.payment.billing.email}
              onClick={async () => {
                try {
                  setLoading(true);
                  
                  // 예약 데이터 준비
                  const bookingData = {
                    serviceTypeCode: 'PREMIUM_TAXI',
                    region: booking.region || 'NY',
                    isRoundTrip: booking.isRoundTrip || false,
                    trips: [
                      {
                        departure: booking.outbound.departure || '',
                        arrival: booking.outbound.arrival || '',
                        date: booking.airport.pickupDate || new Date().toISOString().split('T')[0],
                        time: booking.airport.arrivalTime || '12:00',
                        passengers: booking.passengers || 1,
                        luggage: booking.luggage || 0
                      }
                    ],
                    customerInfo: {
                      name: booking.customer.name || '',
                      phone: booking.customer.phone || '',
                      email: booking.payment.billing.email || '',
                      kakaoId: booking.customer.kakaoId || '',
                      flightInfo: {
                        flightNumber: booking.airport.flightNumber || '',
                        arrivalTime: booking.airport.arrivalTime || ''
                      }
                    },
                    options: {
                      simCard: booking.options.sim || false,
                      carSeat: {
                        needed: booking.options.carSeat || false,
                        type: booking.options.carSeatType || 'regular',
                        onSitePayment: true
                      }
                    },
                    paymentInfo: {
                      method: booking.payment.method || 'deposit',
                      amount: price.finalAmount || 0,
                      fee: booking.payment.method === 'full' ? (price.fullPaymentFee - price.total) || 0 : 0
                    },
                    specialRequests: booking.airport.address || '',
                    pricing: {
                      basePrice: price.total || 0,
                      additionalCharges: 0,
                      subtotal: price.total || 0
                    }
                  };
                  
                  // 왕복 여행 추가
                  if (booking.isRoundTrip) {
                    bookingData.trips.push({
                      departure: booking.return.departure,
                      arrival: booking.return.arrival,
                      date: booking.returnAirport.pickupDate || new Date().toISOString().split('T')[0],
                      time: booking.returnAirport.arrivalTime || '12:00',
                      passengers: booking.returnPassengers,
                      luggage: booking.returnLuggage
                    });
                  }
                  
                  const response = await api.createBooking(bookingData);
                  setBooking(prev => ({ ...prev, bookingResult: response }));
                  setStep('complete');
                } catch (err) {
                  setError('예약 처리 중 오류가 발생했습니다.');
                } finally {
                  setLoading(false);
                }
              }}
            >
              ${price.finalAmount} 결제하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 예약 완료 화면
  const CompleteStep = () => (
    <div className="completion-container">
      <div className="complete-header">
        <div className="success-animation">
          <CheckCircle size={64} color="#00C851" />
        </div>
        <h1>예약이 완료되었습니다!</h1>
        <p className="completion-message">YelloRide가 안전하고 편안한 여행을 약속드립니다</p>
        <div className="booking-number">
          예약번호: <strong>{booking.bookingResult?.bookingId || 'YR-2025-001'}</strong>
        </div>
      </div>

      {/* 즉시 지원 안내 */}
      <div className="immediate-support">
        <div className="support-header">
          <span className="support-icon">📞</span>
          <h3>예약 관련 문의가 있으시면</h3>
        </div>
        <div className="contact-options">
          <div className="contact-card">
            <MessageCircle size={20} />
            <div className="contact-details">
              <strong>카카오톡 상담</strong>
              <span>옐로라이드 (즉시 응답)</span>
            </div>
          </div>
          <div className="contact-card">
            <Phone size={20} />
            <div className="contact-details">
              <strong>전화 상담</strong>
              <span>+1 917-819-6464</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="complete-details">
        <div className="detail-section">
          <h3>예약 정보</h3>
          <div className="detail-row">
            <span>서비스:</span>
            <span>택시 예약</span>
          </div>
          <div className="detail-row">
            <span>지역:</span>
            <span>{booking.region === 'NY' ? '뉴욕' : 'LA'}</span>
          </div>
          <div className="detail-row">
            <span>경로:</span>
            <span>{booking.outbound.departure} → {booking.outbound.arrival}</span>
          </div>
          {booking.isRoundTrip && (
            <div className="detail-row">
              <span>왕복:</span>
              <span>{booking.return.departure} → {booking.return.arrival}</span>
            </div>
          )}
          <div className="detail-row">
            <span>결제 금액:</span>
            <span>${booking.bookingResult?.data?.paymentInfo?.amount || calculatePrice().finalAmount}</span>
          </div>
        </div>
        
        <div className="next-steps">
          <h3>이제 무엇을 해야 하나요?</h3>
          <div className="steps-timeline">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <strong>이메일 확인</strong>
                <p>예약 확정서와 중요 안내사항을 이메일로 발송해드렸습니다</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <strong>픽업 준비</strong>
                <p>픽업 당일 기사님이 도착 후 직접 연락드립니다</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <strong>편안한 여행</strong>
                <p>YelloRide와 함께 안전하고 편안한 여행을 즐기세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 서비스 안내 */}
        <div className="additional-services">
          <h4>이런 서비스도 이용해보세요</h4>
          <div className="service-suggestions">
            <div className="suggestion-item">
              <span>📱</span>
              <span>미국 유심 서비스</span>
            </div>
            <div className="suggestion-item">
              <span>🚗</span>
              <span>시간제 차량 대절</span>
            </div>
            <div className="suggestion-item">
              <span>🏫</span>
              <span>학교 정기 픽업</span>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="new-booking-btn"
        onClick={() => {
          setStep('landing');
          setBooking({
            region: '',
            serviceType: 'taxi',
            isRoundTrip: false,
            outbound: { departure: '', arrival: '', route: null },
            return: { departure: '', arrival: '', route: null },
            passengers: 1,
            luggage: 0,
            returnPassengers: 1,
            returnLuggage: 0,
            customer: { name: '', phone: '', kakaoId: '', email: '' },
            airport: { pickupDate: '', arrivalTime: '', flightNumber: '', address: '' },
            returnAirport: { pickupDate: '', arrivalTime: '', flightNumber: '', address: '' },
            options: { sim: false, carSeat: false, carSeatType: 'regular' },
            payment: { method: 'deposit', billing: { name: '', company: '', email: '' } }
          });
        }}
      >
        새 예약하기
      </button>
    </div>
  );

  // 현재 단계에 따른 컴포넌트 렌더링
  const renderCurrentStep = () => {
    return (
      <div className="app-container">
        <LandingPage />
        <RegionStep />
        <RouteStep />
        {step === 'passengers' && <PassengersStep />}
        {step === 'customer' && <CustomerStep />}
        {step === 'airport' && <AirportStep />}
        {step === 'options' && <OptionsStep />}
        {step === 'payment' && <PaymentStep />}
        {step === 'complete' && <CompleteStep />}
      </div>
    );
  };

  return (
    <div className="app simple">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>처리 중...</p>
        </div>
      )}
      
      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <main className="main-content">
        <div className="responsive-container">
          {renderCurrentStep()}
          {/* 가격 표시는 경로가 선택되고 승객/짐 정보가 관련있는 단계에서만 표시 */}
          {(step === 'passengers' || step === 'options') && booking.outbound.route && (
            <div className="bottom-section">
              <div className="price-summary">
                <span className="price-label">예상 요금</span>
                <span className="price-amount">${calculatePrice().total}</span>
              </div>
            </div>
          )}
          {step !== 'landing' && <AppFooter />}
        </div>
      </main>
    </div>
  );
}

export default App;