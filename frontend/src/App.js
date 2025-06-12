/**
 * YelloRide - 미주 특화 프리미엄 택시 예약 서비스
 * 토스/애플/쏘카 스타일의 모던하고 깔끔한 디자인
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Shield,
  Star,
  Navigation,
  Globe,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  X,
  Menu,
  User,
  HelpCircle,
  Car,
  Plane,
  DollarSign,
  Zap,
  Heart,
  Award,
  Wifi,
  Coffee
} from 'lucide-react';

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
}

const api = new APIService();

// YelloRide 로고 컴포넌트
const YelloRideLogo = ({ variant = "default", className = "", animated = false }) => {
  if (variant === "symbol") {
    return (
      <div className={`logo-symbol ${className} ${animated ? 'logo-animated' : ''}`}>
        <div className="logo-icon-symbol">
          <div className="logo-dot"></div>
          <div className="logo-dot"></div>
        </div>
      </div>
    );
  }
  
  if (variant === "compact") {
    return (
      <div className={`logo logo-compact ${className} ${animated ? 'logo-animated' : ''}`}>
        <span className="logo-text">
          <span className="logo-yello">Yello</span>
          <span className="logo-ride">Ride</span>
        </span>
      </div>
    );
  }
  
  return (
    <div className={`logo ${className} ${animated ? 'logo-animated' : ''}`}>
      <span className="logo-text">
        <span className="logo-yello">Yello</span>
        <span className="logo-ride">Ride</span>
        <span className="logo-tagline">simply good ride</span>
      </span>
    </div>
  );
};

// 메인 App 컴포넌트
function App() {
  const [currentStep, setCurrentStep] = useState('hero');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [animateHero, setAnimateHero] = useState(false);
  
  // 각 단계별 애니메이션 상태 관리
  const [animatedSteps, setAnimatedSteps] = useState(new Set());
  
  // 상태 업데이트 최적화를 위한 ref
  const stateRef = useRef();
  
  // 모바일 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // 히어로 애니메이션
  useEffect(() => {
    if (currentStep === 'hero' && !animatedSteps.has('hero')) {
      setTimeout(() => {
        setAnimateHero(true);
        setAnimatedSteps(prev => new Set([...prev, 'hero']));
      }, 100);
    }
  }, [currentStep, animatedSteps]);

  // 단계별 애니메이션 트리거 함수
  const shouldAnimate = useCallback((stepName) => {
    if (!animatedSteps.has(stepName)) {
      setAnimatedSteps(prev => new Set([...prev, stepName]));
      return true;
    }
    return false;
  }, [animatedSteps]);


  // 단계 변경 시 스크롤 최상단 이동
  const updateStep = useCallback((newStep) => {
    setCurrentStep(newStep);
    // complete 페이지는 즉시 스크롤, 나머지는 smooth
    if (newStep === 'complete') {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  
  // 지역별 위치 데이터
  const [departures, setDepartures] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [returnDepartures, setReturnDepartures] = useState([]);
  const [returnArrivals, setReturnArrivals] = useState([]);
  
  // 예약 데이터
  const [booking, setBooking] = useState({
    region: '',
    serviceType: 'taxi',
    isRoundTrip: false,
    
    // 편도 경로
    outbound: { 
      departure: '', 
      arrival: '', 
      route: null 
    },
    
    // 왕복 경로
    return: { 
      departure: '', 
      arrival: '', 
      route: null 
    },
    
    // 승객/짐
    passengers: 1,
    luggage: 0,
    returnPassengers: 1,
    returnLuggage: 0,
    
    // 고객 정보
    customer: {
      name: '',
      phone: '',
      kakaoId: ''
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
      carSeatType: 'regular'
    },
    
    // 결제
    payment: {
      method: 'deposit',
      billing: {
        name: '',
        company: '',
        email: ''
      },
      card: {
        number: '',
        expiry: '',
        cvc: ''
      }
    }
  });

  // 깜빡임 방지를 위한 최적화된 업데이트 함수
  const updateBookingField = useCallback((path, value) => {
    // 현재 스크롤 위치 저장
    const currentScrollY = window.pageYOffset;
    
    setBooking(prev => {
      const newBooking = { ...prev };
      const keys = path.split('.');
      let current = newBooking;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      stateRef.current = newBooking;
      return newBooking;
    });
    
    // 스크롤 위치 복원
    requestAnimationFrame(() => {
      window.scrollTo(0, currentScrollY);
    });
  }, []);


  // 가격 계산
  const calculatePrice = useCallback(() => {
    let total = 0;
    let details = [];
    
    // 편도 요금
    if (booking.outbound.route) {
      const basePrice = (booking.outbound.route.reservation_fee || 0) + 
                       (booking.outbound.route.local_payment_fee || 0);
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
    
    // 왕복 요금
    if (booking.isRoundTrip && booking.return.route) {
      const basePrice = (booking.return.route.reservation_fee || 0) + 
                       (booking.return.route.local_payment_fee || 0);
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
      
      // 왕복 $10 할인
      total -= 10;
      details.push({ label: '왕복 할인', amount: -10, type: 'discount' });
    }
    
    // 옵션 요금
    if (booking.options.sim) {
      total += 32;
      details.push({ label: '유심', amount: 32 });
    }
    
    if (booking.options.carSeat) {
      const carSeatFee = booking.isRoundTrip ? 20 : 10;
      details.push({ label: `카시트 (현장결제)`, amount: 0, note: `$${carSeatFee}` });
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
  }, [booking]);

  // API 호출 함수들
  const loadDepartures = async (region) => {
    try {
      setLoading(true);
      const departureList = await api.getDepartures(region);
      setDepartures(departureList);
      setReturnDepartures(departureList);
    } catch (err) {
      console.error('Failed to load departures:', err);
      setError('출발지 목록을 불러오는데 실패했습니다.');
      setDepartures([]);
      setReturnDepartures([]);
    } finally {
      setLoading(false);
    }
  };

  const loadArrivals = async (region, departure, isReturn = false) => {
    try {
      setLoading(true);
      const arrivalList = await api.getArrivals(region, departure);
      if (isReturn) {
        setReturnArrivals(arrivalList);
      } else {
        setArrivals(arrivalList);
      }
      return arrivalList;
    } catch (err) {
      console.error('Failed to load arrivals:', err);
      setError('도착지 목록을 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchRoute = async (departure, arrival, region) => {
    try {
      const response = await api.searchRoute(departure, arrival, region);
      return response;
    } catch (err) {
      console.error('Route search failed:', err);
      return null;
    }
  };

  // 공통 컴포넌트들
  const TopNav = ({ title, onBack, showBack = true }) => (
    <div className="top-nav glass-effect">
      <div className="nav-inner">
        {showBack && onBack ? (
          <button className="nav-back-btn hover-scale" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="nav-spacer" />
        )}
        <h1 className="nav-title">{title}</h1>
        <button className="nav-help-btn hover-scale">
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  );

  const BottomCTA = ({ text, onClick, disabled }) => (
    <div className="bottom-cta-wrapper">
      <div className="bottom-cta">
        <div className="cta-inner">
          <button 
            className="cta-button hover-lift"
            onClick={onClick}
            disabled={disabled}
          >
            <span>{text}</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );

  // 히어로 페이지
  const HeroPage = () => {
    if (currentStep !== 'hero') return null;

    return (
      <div className="hero-page">
        <div className="hero-background">
          <div className="hero-image-wrapper">
            <img 
              src={isMobile ? "/image/title.png" : "/image/title_wide.png"} 
              alt="YelloRide Hero" 
              className="hero-image"
            />
            <div className="hero-overlay" />
          </div>
          
          {/* 애니메이션 요소들 */}
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }} />
            ))}
          </div>
        </div>
        
        <div className="hero-content">
          <nav className="hero-nav fade-in">
            <YelloRideLogo variant="default" className="hero-logo" animated />
          </nav>
          
          <div className="hero-main">
            <div className={`hero-text-wrapper ${animateHero ? 'animate' : ''}`}>
              <div className="hero-badge slide-down">
                <Sparkles size={16} />
                <span>미주 No.1 택시 예약</span>
              </div>
              
              <h1 className="hero-title">
                <span className="title-line slide-up">편안한 여행의</span>
                <span className="title-line slide-up delay-1">첫 걸음</span>
              </h1>
              
              <p className="hero-subtitle slide-up delay-2">
                뉴욕과 LA, 어디든 안전하고 편리하게
              </p>
              
              <div className="hero-features slide-up delay-3">
                <div className="feature-pill">
                  <CheckCircle size={14} />
                  <span>한국어 서비스</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle size={14} />
                  <span>투명한 요금</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle size={14} />
                  <span>24시간 운행</span>
                </div>
              </div>
              
              <button 
                className="hero-cta-button hover-glow scale-in delay-4"
                onClick={() => updateStep('main')}
              >
                <span>지금 예약하기</span>
                <ArrowRight size={20} />
              </button>
              
              <div className="hero-trust-badges slide-up delay-5">
                <div className="trust-item">
                  <Award size={16} />
                  <span>10만+ 이용객</span>
                </div>
                <div className="trust-item">
                  <Star size={16} />
                  <span>4.9 평점</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    );
  };

  // 메인 페이지
  const MainPage = () => {
    if (currentStep !== 'main') return null;

    const isAnimated = shouldAnimate('main');

    return (
      <div className="main-page">
        <div className="main-header glass-effect">
          <YelloRideLogo variant="compact" />
        </div>
        
        <div className="main-content">
          <div className="content-wrapper">
            <div className={`main-title-section ${isAnimated ? 'fade-in' : ''}`}>
              <h1 className="main-title">어디로 모실까요?</h1>
              <p className="main-subtitle">서비스 지역을 선택해주세요</p>
            </div>
            
            <div className="region-grid">
              <button 
                className="region-card hover-lift glass-card"
                onClick={async () => {
                  updateBookingField('region', 'NY');
                  await loadDepartures('NY');
                  updateStep('service');
                }}
              >
                <div className="region-icon-wrapper pulse">
                  <span className="region-emoji">🗽</span>
                </div>
                <div className="region-content">
                  <h3>뉴욕</h3>
                  <p>New York</p>
                  <div className="region-features">
                    <span className="feature-tag">JFK 공항</span>
                    <span className="feature-tag">맨해튼</span>
                    <span className="feature-tag">24시간</span>
                  </div>
                </div>
                <div className="region-arrow">
                  <ChevronRight size={20} />
                </div>
              </button>
              
              <button 
                className="region-card hover-lift glass-card"
                onClick={async () => {
                  updateBookingField('region', 'LA');
                  await loadDepartures('LA');
                  updateStep('service');
                }}
              >
                <div className="region-icon-wrapper pulse">
                  <span className="region-emoji">🌴</span>
                </div>
                <div className="region-content">
                  <h3>로스앤젤레스</h3>
                  <p>Los Angeles</p>
                  <div className="region-features">
                    <span className="feature-tag">LAX 공항</span>
                    <span className="feature-tag">할리우드</span>
                    <span className="feature-tag">한인타운</span>
                  </div>
                </div>
                <div className="region-arrow">
                  <ChevronRight size={20} />
                </div>
              </button>
            </div>
            
            <div className="service-highlights">
              <div className={`highlight-card glass-card ${isAnimated ? 'slide-up' : ''}`}>
                <div className="highlight-icon">
                  <Shield size={24} />
                </div>
                <h4>안전한 서비스</h4>
                <p>정식 라이센스 보유<br />종합보험 가입 차량</p>
              </div>
              
              <div className={`highlight-card glass-card ${isAnimated ? 'slide-up delay-1' : ''}`}>
                <div className="highlight-icon">
                  <Globe size={24} />
                </div>
                <h4>한국어 지원</h4>
                <p>24시간 카카오톡 상담<br />한국어 가능 기사</p>
              </div>
              
              <div className={`highlight-card glass-card ${isAnimated ? 'slide-up delay-2' : ''}`}>
                <div className="highlight-icon">
                  <DollarSign size={24} />
                </div>
                <h4>투명한 요금</h4>
                <p>정찰제 운영<br />숨겨진 비용 없음</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 서비스 선택
  const ServiceStep = () => {
    if (currentStep !== 'service') return null;

    const isAnimated = shouldAnimate('service');

    return (
      <div className="step-page">
        <TopNav 
          title={`${booking.region === 'NY' ? '뉴욕' : 'LA'} 서비스`}
          onBack={() => updateStep('main')}
        />
        
        <div className="step-content">
          <div className={`section-header ${isAnimated ? 'fade-in' : ''}`}>
            <h1 className="section-title">이용하실 서비스를 선택해주세요</h1>
            <p className="section-subtitle">원하시는 서비스 유형을 선택하세요</p>
          </div>
          
          <div className="service-options">
            <button 
              className="service-option-card hover-lift glass-card active"
              onClick={() => {
                updateBookingField('serviceType', 'taxi');
                updateStep('route');
              }}
            >
              <div className="service-header">
                <div className="service-icon-box">
                  <Car size={32} />
                </div>
                <div className="service-info">
                  <h3>택시 예약</h3>
                  <p>공항 픽업, 시내 이동</p>
                </div>
              </div>
              
              <div className="service-benefits">
                <div className="benefit-item">
                  <Check size={16} />
                  <span>정확한 픽업 시간</span>
                </div>
                <div className="benefit-item">
                  <Check size={16} />
                  <span>고정 요금제</span>
                </div>
                <div className="benefit-item">
                  <Check size={16} />
                  <span>왕복 예약 $10 할인</span>
                </div>
              </div>
              
              <div className="service-price">
                <span className="price-label">예약금</span>
                <span className="price-value">$20~</span>
              </div>
            </button>
            
            <button 
              className="service-option-card glass-card disabled"
              disabled
            >
              <div className="service-header">
                <div className="service-icon-box">
                  <Clock size={32} />
                </div>
                <div className="service-info">
                  <h3>차량 대절</h3>
                  <p>시간제 전용 차량</p>
                </div>
              </div>
              
              <div className="service-benefits">
                <div className="benefit-item">
                  <Check size={16} />
                  <span>4시간부터 이용</span>
                </div>
                <div className="benefit-item">
                  <Check size={16} />
                  <span>전담 기사 배정</span>
                </div>
                <div className="benefit-item">
                  <Check size={16} />
                  <span>자유로운 일정</span>
                </div>
              </div>
              
              <div className="coming-soon-badge">
                <span>Coming Soon</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 경로 선택
  const RouteStep = () => {
    if (currentStep !== 'route') return null;

    const isAnimated = shouldAnimate('route');

    return (
      <div className="step-page">
        <TopNav 
          title="경로 선택" 
          onBack={() => updateStep('service')}
        />
        
        <div className="step-content">
          <div className={`section-header ${isAnimated ? 'fade-in' : ''}`}>
            <h1 className="section-title">어디로 모실까요?</h1>
            <p className="section-subtitle">출발지와 도착지를 선택해주세요</p>
          </div>
          
          {/* 왕복 토글 */}
          <div className="round-trip-toggle glass-card">
            <div className="toggle-content">
              <div className="toggle-left">
                <h4>왕복 예약</h4>
                <p>왕복 예약 시 <span className="discount-highlight">$10 할인</span></p>
              </div>
              <label className="modern-toggle">
                <input 
                  type="checkbox"
                  checked={booking.isRoundTrip}
                  onChange={(e) => updateBookingField('isRoundTrip', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          {/* 편도 경로 */}
          <div className={`route-section ${isAnimated ? 'fade-in' : ''}`}>
            <div className="section-label">
              <span className="label-text">편도</span>
              <span className="label-badge">필수</span>
            </div>
            
            <div className="route-inputs glass-card">
              <div className="route-input-group">
                <label className="input-label">
                  <MapPin size={16} />
                  <span>출발지</span>
                </label>
                <select 
                  className="modern-select"
                  value={booking.outbound.departure}
                  onChange={async (e) => {
                    const departure = e.target.value;
                    updateBookingField('outbound.departure', departure);
                    updateBookingField('outbound.arrival', '');
                    updateBookingField('outbound.route', null);
                    
                    if (departure) {
                      await loadArrivals(booking.region, departure, false);
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
              
              <div className="route-divider">
                <div className="divider-line"></div>
                <div className="divider-icon">
                  <ArrowRight size={16} />
                </div>
                <div className="divider-line"></div>
              </div>
              
              <div className="route-input-group">
                <label className="input-label">
                  <MapPin size={16} />
                  <span>도착지</span>
                </label>
                <select 
                  className="modern-select"
                  value={booking.outbound.arrival}
                  onChange={async (e) => {
                    const arrival = e.target.value;
                    updateBookingField('outbound.arrival', arrival);
                    updateBookingField('outbound.route', null);
                    
                    if (booking.outbound.departure && arrival) {
                      setLoading(true);
                      const route = await searchRoute(
                        booking.outbound.departure, 
                        arrival, 
                        booking.region
                      );
                      if (route) {
                        updateBookingField('outbound.route', route);
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
            
            {booking.outbound.route && (
              <div className={`route-price-display glass-card success ${isAnimated ? 'slide-up' : ''}`}>
                <div className="price-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="price-details">
                  <span className="price-total">
                    총 ${booking.outbound.route.reservation_fee + booking.outbound.route.local_payment_fee}
                  </span>
                  <span className="price-breakdown">
                    예약금 ${booking.outbound.route.reservation_fee} + 현장 ${booking.outbound.route.local_payment_fee}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* 왕복 경로 */}
          {booking.isRoundTrip && (
            <div className={`route-section ${isAnimated ? 'fade-in' : ''}`}>
              <div className="section-label">
                <span className="label-text">왕복</span>
                <span className="label-badge discount">$10 할인</span>
              </div>
              
              <div className="route-inputs glass-card">
                <div className="route-input-group">
                  <label className="input-label">
                    <MapPin size={16} />
                    <span>출발지</span>
                  </label>
                  <select 
                    className="modern-select"
                    value={booking.return.departure}
                    onChange={async (e) => {
                      const departure = e.target.value;
                      updateBookingField('return.departure', departure);
                      updateBookingField('return.arrival', '');
                      updateBookingField('return.route', null);
                      
                      if (departure) {
                        await loadArrivals(booking.region, departure, true);
                      } else {
                        setReturnArrivals([]);
                      }
                    }}
                  >
                    <option value="">선택해주세요</option>
                    {returnDepartures.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                <div className="route-divider">
                  <div className="divider-line"></div>
                  <div className="divider-icon">
                    <ArrowRight size={16} />
                  </div>
                  <div className="divider-line"></div>
                </div>
                
                <div className="route-input-group">
                  <label className="input-label">
                    <MapPin size={16} />
                    <span>도착지</span>
                  </label>
                  <select 
                    className="modern-select"
                    value={booking.return.arrival}
                    onChange={async (e) => {
                      const arrival = e.target.value;
                      updateBookingField('return.arrival', arrival);
                      updateBookingField('return.route', null);
                      
                      if (booking.return.departure && arrival) {
                        setLoading(true);
                        const route = await searchRoute(
                          booking.return.departure, 
                          arrival, 
                          booking.region
                        );
                        if (route) {
                          updateBookingField('return.route', route);
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
              
              {booking.return.route && (
                <div className={`route-price-display glass-card success ${isAnimated ? 'slide-up' : ''}`}>
                  <div className="price-icon">
                    <CheckCircle size={20} />
                  </div>
                  <div className="price-details">
                    <span className="price-total">
                      총 ${booking.return.route.reservation_fee + booking.return.route.local_payment_fee}
                    </span>
                    <span className="price-breakdown">
                      예약금 ${booking.return.route.reservation_fee} + 현장 ${booking.return.route.local_payment_fee}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <BottomCTA 
          text="다음"
          onClick={() => updateStep('passengers')}
          disabled={!booking.outbound.route || (booking.isRoundTrip && !booking.return.route)}
        />
      </div>
    );
  };

  // 인원/짐 선택
  const PassengersStep = () => {
    if (currentStep !== 'passengers') return null;

    const vehicleTypes = [
      { type: '승용차', icon: '🚗', passengers: '1-3인', luggage: '1-3개' },
      { type: 'SUV', icon: '🚙', passengers: '1-3인', luggage: '3-4개' },
      { type: '미니밴', icon: '🚐', passengers: '1-6인', luggage: '5-10개' }
    ];

    const isLAWith4Plus = booking.region === 'LA' && booking.passengers >= 4 && booking.luggage < 5;
    const isAnimated = shouldAnimate('passengers');

    return (
      <div className="step-page">
        <TopNav 
          title="인원 및 짐" 
          onBack={() => updateStep('route')}
        />
        
        <div className="step-content">
          <div className={`section-header ${isAnimated ? 'fade-in' : ''}`}>
            <h1 className="section-title">몇 분이서 이용하시나요?</h1>
            <p className="section-subtitle">인원과 짐 개수에 따라 차량이 배정됩니다</p>
          </div>
          
          {/* 차량 타입 정보 */}
          <div className={`vehicle-types ${isAnimated ? 'fade-in' : ''}`}>
            {vehicleTypes.map((vehicle, index) => (
              <div key={vehicle.type} className={`vehicle-type-card glass-card ${isAnimated ? 'slide-up' : ''}`} style={isAnimated ? {animationDelay: `${index * 0.1}s`} : {}}>
                <span className="vehicle-icon">{vehicle.icon}</span>
                <div className="vehicle-info">
                  <h4>{vehicle.type}</h4>
                  <p>{vehicle.passengers} · 캐리어 {vehicle.luggage}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* 편도 선택 */}
          <div className={`selection-section ${isAnimated ? 'fade-in' : ''}`}>
            <div className="section-label">
              <span className="label-text">편도</span>
            </div>
            
            <div className="counter-grid">
              <div className="counter-card glass-card">
                <div className="counter-header">
                  <Users size={20} />
                  <h4>승객</h4>
                </div>
                <div className="counter-controls">
                  <button 
                    className="counter-btn hover-scale"
                    onClick={() => updateBookingField('passengers', Math.max(1, booking.passengers - 1))}
                    disabled={booking.passengers <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="counter-value">{booking.passengers}명</span>
                  <button 
                    className="counter-btn hover-scale"
                    onClick={() => updateBookingField('passengers', Math.min(6, booking.passengers + 1))}
                    disabled={booking.passengers >= 6}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {booking.passengers >= 5 && (
                  <div className="counter-notice slide-up">
                    <span>추가요금 +${booking.passengers === 5 ? 5 : 10}</span>
                  </div>
                )}
              </div>
              
              <div className="counter-card glass-card">
                <div className="counter-header">
                  <Luggage size={20} />
                  <h4>캐리어</h4>
                </div>
                <div className="counter-controls">
                  <button 
                    className="counter-btn hover-scale"
                    onClick={() => updateBookingField('luggage', Math.max(0, booking.luggage - 1))}
                    disabled={booking.luggage <= 0}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="counter-value">{booking.luggage}개</span>
                  <button 
                    className="counter-btn hover-scale"
                    onClick={() => updateBookingField('luggage', Math.min(10, booking.luggage + 1))}
                    disabled={booking.luggage >= 10}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {booking.luggage >= 3 && (
                  <div className="counter-notice slide-up">
                    <span>추가요금 +${5 + (booking.luggage - 3) * 5}</span>
                  </div>
                )}
              </div>
            </div>
            
            {isLAWith4Plus && (
              <div className={`alert-card glass-card warning ${isAnimated ? 'slide-up' : ''}`}>
                <AlertCircle size={20} />
                <span>LA지역 4인 이상은 짐 개수를 최소 5개로 선택해주세요</span>
              </div>
            )}
          </div>
          
          {/* 왕복 선택 */}
          {booking.isRoundTrip && (
            <div className={`selection-section ${isAnimated ? 'fade-in' : ''}`}>
              <div className="section-label">
                <span className="label-text">왕복</span>
              </div>
              
              <div className="counter-grid">
                <div className="counter-card glass-card">
                  <div className="counter-header">
                    <Users size={20} />
                    <h4>승객</h4>
                  </div>
                  <div className="counter-controls">
                    <button 
                      className="counter-btn hover-scale"
                      onClick={() => updateBookingField('returnPassengers', Math.max(1, booking.returnPassengers - 1))}
                      disabled={booking.returnPassengers <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="counter-value">{booking.returnPassengers}명</span>
                    <button 
                      className="counter-btn hover-scale"
                      onClick={() => updateBookingField('returnPassengers', Math.min(6, booking.returnPassengers + 1))}
                      disabled={booking.returnPassengers >= 6}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  {booking.returnPassengers >= 5 && (
                    <div className="counter-notice slide-up">
                      <span>추가요금 +${booking.returnPassengers === 5 ? 5 : 10}</span>
                    </div>
                  )}
                </div>
                
                <div className="counter-card glass-card">
                  <div className="counter-header">
                    <Luggage size={20} />
                    <h4>캐리어</h4>
                  </div>
                  <div className="counter-controls">
                    <button 
                      className="counter-btn hover-scale"
                      onClick={() => updateBookingField('returnLuggage', Math.max(0, booking.returnLuggage - 1))}
                      disabled={booking.returnLuggage <= 0}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="counter-value">{booking.returnLuggage}개</span>
                    <button 
                      className="counter-btn hover-scale"
                      onClick={() => updateBookingField('returnLuggage', Math.min(10, booking.returnLuggage + 1))}
                      disabled={booking.returnLuggage >= 10}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  {booking.returnLuggage >= 3 && (
                    <div className="counter-notice slide-up">
                      <span>추가요금 +${5 + (booking.returnLuggage - 3) * 5}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 안내 정보 */}
          <div className={`info-card glass-card ${isAnimated ? 'fade-in' : ''}`}>
            <h4>짐 개수 안내</h4>
            <ul className="info-list">
              <li>캐리어는 크기 상관없이 1개로 계산</li>
              <li>3단 이민가방, 대형 유모차, 골프백은 2개로 선택</li>
              <li>핸드백, 백팩 등 소형 가방은 무료</li>
              {booking.region === 'LA' && (
                <li className="highlight">LA지역 4인 이상은 반드시 짐 5개 이상 선택</li>
              )}
            </ul>
          </div>
        </div>
        
        <BottomCTA 
          text="다음"
          onClick={() => updateStep('customer')}
          disabled={isLAWith4Plus}
        />
      </div>
    );
  };

  // 고객 정보
  const CustomerStep = () => {
    if (currentStep !== 'customer') return null;

    const isAnimated = shouldAnimate('customer');

    return (
      <div className="step-page">
        <TopNav 
          title="탑승자 정보" 
          onBack={() => updateStep('passengers')}
        />
        
        <div className="step-content">
          <div className={`section-header ${isAnimated ? 'fade-in' : ''}`}>
            <h1 className="section-title">탑승자 정보를 입력해주세요</h1>
            <p className="section-subtitle">원활한 픽업을 위해 정확한 정보가 필요합니다</p>
          </div>
          
          <div className={`security-badge glass-card ${isAnimated ? 'slide-up' : ''}`}>
            <Shield size={20} />
            <span>개인정보는 안전하게 보호됩니다</span>
          </div>
          
          <form className={`modern-form ${isAnimated ? 'fade-in' : ''}`}>
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                <span>이름 (한글)</span>
              </label>
              <input 
                type="text"
                className="form-input"
                value={booking.customer.name}
                onChange={(e) => updateBookingField('customer.name', e.target.value)}
                placeholder="홍길동"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} />
                <span>전화번호</span>
              </label>
              <input 
                type="tel"
                className="form-input"
                value={booking.customer.phone}
                onChange={(e) => updateBookingField('customer.phone', e.target.value)}
                placeholder="미국 번호 또는 한국 번호"
              />
              <p className="form-hint">미국 번호가 없으면 카카오톡 연결된 한국 번호를 입력해주세요</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <MessageCircle size={16} />
                <span>카카오톡 ID</span>
              </label>
              <input 
                type="text"
                className="form-input"
                value={booking.customer.kakaoId}
                onChange={(e) => updateBookingField('customer.kakaoId', e.target.value)}
                placeholder="검색 가능한 카카오톡 ID"
              />
              <p className="form-hint">대화명이 아닌 검색 가능한 ID를 입력해주세요</p>
              <p className="form-hint">예) kim@gmail.com(X) kim85(O)</p>
            </div>
          </form>
          
          <div className={`info-card glass-card ${isAnimated ? 'fade-in' : ''}`}>
            <h4>픽업 당일 안내</h4>
            <ul className="info-list">
              <li>요청하신 픽업 시간에 도착 후 기사님이 연락드립니다</li>
              <li>카카오톡 검색 허용 필수</li>
              <li>연락이 안 되어 못 모시는 경우 회사 책임 없음</li>
            </ul>
          </div>
        </div>
        
        <BottomCTA 
          text="다음"
          onClick={() => {
            const needsAirportInfo = 
              booking.outbound.route?.departure_is_airport || 
              booking.outbound.route?.arrival_is_airport ||
              (booking.isRoundTrip && (booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport));
            
            updateStep(needsAirportInfo ? 'airport' : 'options');
          }}
          disabled={!booking.customer.name || !booking.customer.phone || !booking.customer.kakaoId}
        />
      </div>
    );
  };

  // 공항 정보
  const AirportStep = () => {
    if (currentStep !== 'airport') return null;

    const isAnimated = shouldAnimate('airport');

    return (
      <div className="step-page">
        <TopNav 
          title="픽업 정보" 
          onBack={() => updateStep('customer')}
        />
        
        <div className="step-content">
          <div className={`section-header ${isAnimated ? 'fade-in' : ''}`}>
            <h1 className="section-title">픽업 정보를 입력해주세요</h1>
            <p className="section-subtitle">정확한 픽업을 위해 필요합니다</p>
          </div>
          
          {/* 편도 공항 정보 */}
          {(booking.outbound.route?.departure_is_airport || booking.outbound.route?.arrival_is_airport) && (
            <div className={`airport-section ${isAnimated ? 'fade-in' : ''}`}>
              <div className="section-label">
                <span className="label-text">편도 픽업 정보</span>
              </div>
              
              <form className="modern-form">
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    <span>픽업 날짜</span>
                  </label>
                  <input 
                    type="date"
                    className="form-input"
                    value={booking.airport.pickupDate}
                    onChange={(e) => updateBookingField('airport.pickupDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {(booking.outbound.route?.departure_is_airport || booking.outbound.route?.arrival_is_airport) && (
                    <p className="form-hint">예) 1월 2일 23:55 도착 비행기는 1월 2일 선택</p>
                  )}
                </div>
                
                {(booking.outbound.route?.departure_is_airport || booking.outbound.route?.arrival_is_airport) && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <Clock size={16} />
                        <span>비행기 도착시간</span>
                      </label>
                      <input 
                        type="time"
                        className="form-input"
                        value={booking.airport.arrivalTime}
                        onChange={(e) => updateBookingField('airport.arrivalTime', e.target.value)}
                      />
                      <p className="form-hint">24시간 형식 (오후 9시 55분 = 21:55)</p>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <Plane size={16} />
                        <span>항공편명</span>
                      </label>
                      <input 
                        type="text"
                        className="form-input"
                        value={booking.airport.flightNumber}
                        onChange={(e) => updateBookingField('airport.flightNumber', e.target.value)}
                        placeholder="예: KE085, AA100"
                      />
                      <p className="form-hint">정확한 편명 입력 (조회용)</p>
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={16} />
                    <span>{(booking.outbound.route?.departure_is_airport || booking.outbound.route?.arrival_is_airport) ? '목적지 상세 주소' : '상세 주소'}</span>
                  </label>
                  <textarea 
                    className="form-textarea"
                    value={booking.airport.address}
                    onChange={(e) => updateBookingField('airport.address', e.target.value)}
                    placeholder={(booking.outbound.route?.departure_is_airport || booking.outbound.route?.arrival_is_airport) ? '호텔명, 건물명 등 상세 주소' : '픽업/도착지 상세 주소'}
                    rows={3}
                  />
                </div>
              </form>
              
              {(booking.outbound.route?.departure_is_airport || booking.outbound.route?.arrival_is_airport) && (
                <div className="info-card glass-card">
                  <h4>무료 대기시간</h4>
                  <ul className="info-list">
                    <li>국제선: 도착 후 1시간 30분</li>
                    <li>국내선: 도착 후 1시간</li>
                    <li>추가 대기: 30분당 $15</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* 왕복 공항 정보 */}
          {booking.isRoundTrip && (booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport) && (
            <div className={`airport-section ${isAnimated ? 'fade-in' : ''}`}>
              <div className="section-label">
                <span className="label-text">왕복 픽업 정보</span>
              </div>
              
              <form className="modern-form">
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    <span>픽업 날짜</span>
                  </label>
                  <input 
                    type="date"
                    className="form-input"
                    value={booking.returnAirport.pickupDate}
                    onChange={(e) => updateBookingField('returnAirport.pickupDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {(booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport) && (
                    <p className="form-hint">예) 1월 2일 23:55 도착 비행기는 1월 2일 선택</p>
                  )}
                </div>
                
                {(booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport) && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <Clock size={16} />
                        <span>비행기 도착시간</span>
                      </label>
                      <input 
                        type="time"
                        className="form-input"
                        value={booking.returnAirport.arrivalTime}
                        onChange={(e) => updateBookingField('returnAirport.arrivalTime', e.target.value)}
                      />
                      <p className="form-hint">24시간 형식 (오후 9시 55분 = 21:55)</p>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <Plane size={16} />
                        <span>항공편명</span>
                      </label>
                      <input 
                        type="text"
                        className="form-input"
                        value={booking.returnAirport.flightNumber}
                        onChange={(e) => updateBookingField('returnAirport.flightNumber', e.target.value)}
                        placeholder="예: KE085, AA100"
                      />
                      <p className="form-hint">정확한 편명 입력 (조회용)</p>
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={16} />
                    <span>{(booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport) ? '목적지 상세 주소' : '상세 주소'}</span>
                  </label>
                  <textarea 
                    className="form-textarea"
                    value={booking.returnAirport.address}
                    onChange={(e) => updateBookingField('returnAirport.address', e.target.value)}
                    placeholder={(booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport) ? '호텔명, 건물명 등 상세 주소' : '픽업/도착지 상세 주소'}
                    rows={3}
                  />
                </div>
              </form>
            </div>
          )}
        </div>
        
        <BottomCTA 
          text="다음"
          onClick={() => updateStep('options')}
        />
      </div>
    );
  };

  // 옵션 선택
  const OptionsStep = () => {
    if (currentStep !== 'options') return null;

    const isAnimated = shouldAnimate('options');

    return (
      <div className="step-page">
        <TopNav 
          title="추가 옵션" 
          onBack={() => {
            const needsAirportInfo = 
              booking.outbound.route?.departure_is_airport || 
              booking.outbound.route?.arrival_is_airport ||
              (booking.isRoundTrip && (booking.return.route?.departure_is_airport || booking.return.route?.arrival_is_airport));
            
            updateStep(needsAirportInfo ? 'airport' : 'customer');
          }}
        />
        
        <div className="step-content">
          <div className={`section-header ${isAnimated ? 'fade-in' : ''}`}>
            <h1 className="section-title">필요한 옵션이 있으신가요?</h1>
            <p className="section-subtitle">여행을 더 편리하게 만들어드립니다</p>
          </div>
          
          <div className="options-list">
            {/* 유심 옵션 */}
            <div className={`option-item glass-card ${booking.options.sim ? 'active' : ''} hover-lift`}>
              <div className="option-main" onClick={() => updateBookingField('options.sim', !booking.options.sim)}>
                <div className="option-icon-wrapper">
                  <Smartphone size={24} />
                </div>
                <div className="option-content">
                  <div className="option-header">
                    <h4>미국 유심</h4>
                    <span className="option-price">+$32</span>
                  </div>
                  <p className="option-desc">데이터 무제한 · 국제전화 무제한</p>
                </div>
                <div className="option-toggle">
                  <input 
                    type="checkbox"
                    checked={booking.options.sim}
                    onChange={() => {}}
                  />
                  <span className="toggle-track"></span>
                </div>
              </div>
              
              {booking.options.sim && (
                <div className={`option-details ${isAnimated ? 'slide-down' : ''}`}>
                  <div className="detail-list">
                    <div className="detail-item">
                      <Check size={16} />
                      <span>미국 전역 사용 가능</span>
                    </div>
                    <div className="detail-item">
                      <Check size={16} />
                      <span>12GB LTE 후 무제한</span>
                    </div>
                    <div className="detail-item">
                      <Check size={16} />
                      <span>첫 택시 탑승일 수령</span>
                    </div>
                    <div className="detail-item">
                      <Check size={16} />
                      <span>아이폰 8 이상, 갤럭시 S/노트/Z 시리즈</span>
                    </div>
                  </div>
                  <p className="option-note">
                    <Info size={14} />
                    <span>갤럭시 A/J, LG, 샤오미 등 사용 불가</span>
                  </p>
                </div>
              )}
            </div>
            
            {/* 카시트 옵션 */}
            <div className={`option-item glass-card ${booking.options.carSeat ? 'active' : ''} hover-lift`}>
              <div className="option-main" onClick={() => updateBookingField('options.carSeat', !booking.options.carSeat)}>
                <div className="option-icon-wrapper">
                  <Baby size={24} />
                </div>
                <div className="option-content">
                  <div className="option-header">
                    <h4>카시트</h4>
                    <span className="option-price">+$10 (현장결제)</span>
                  </div>
                  <p className="option-desc">안전한 어린이 탑승</p>
                </div>
                <div className="option-toggle">
                  <input 
                    type="checkbox"
                    checked={booking.options.carSeat}
                    onChange={() => {}}
                  />
                  <span className="toggle-track"></span>
                </div>
              </div>
              
              {booking.options.carSeat && (
                <div className={`option-details ${isAnimated ? 'slide-down' : ''}`}>
                  <div className="car-seat-types">
                    <label className="seat-type-option">
                      <input 
                        type="radio"
                        name="carSeatType"
                        value="infant"
                        checked={booking.options.carSeatType === 'infant'}
                        onChange={() => updateBookingField('options.carSeatType', 'infant')}
                        disabled={booking.region !== 'LA'}
                      />
                      <div className="seat-type-content">
                        <span className="seat-type-name">영유아용</span>
                        <span className="seat-type-desc">1세 미만 {booking.region !== 'LA' && '(LA만 가능)'}</span>
                      </div>
                    </label>
                    
                    <label className="seat-type-option">
                      <input 
                        type="radio"
                        name="carSeatType"
                        value="regular"
                        checked={booking.options.carSeatType === 'regular'}
                        onChange={() => updateBookingField('options.carSeatType', 'regular')}
                      />
                      <div className="seat-type-content">
                        <span className="seat-type-name">일반</span>
                        <span className="seat-type-desc">1-6세</span>
                      </div>
                    </label>
                    
                    <label className="seat-type-option">
                      <input 
                        type="radio"
                        name="carSeatType"
                        value="booster"
                        checked={booking.options.carSeatType === 'booster'}
                        onChange={() => updateBookingField('options.carSeatType', 'booster')}
                      />
                      <div className="seat-type-content">
                        <span className="seat-type-name">부스터</span>
                        <span className="seat-type-desc">6세 이상</span>
                      </div>
                    </label>
                  </div>
                  <p className="option-note">
                    <Info size={14} />
                    <span>차량당 1개만 가능 · 왕복시 현장결제 ${booking.isRoundTrip ? 20 : 10}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <BottomCTA 
          text="다음"
          onClick={() => updateStep('payment')}
        />
      </div>
    );
  };

  // 결제
  const PaymentStep = () => {
    if (currentStep !== 'payment') return null;

    const price = calculatePrice();
    const isAnimated = shouldAnimate('payment');

    return (
      <div className="step-page">
        <TopNav 
          title="결제" 
          onBack={() => updateStep('options')}
        />
        
        <div className="step-content">
          <div className={`section-header ${isAnimated ? 'fade-in' : ''}`}>
            <h1 className="section-title">결제 정보를 입력해주세요</h1>
            <p className="section-subtitle">안전하고 간편한 결제</p>
          </div>
          
          {/* 주문 요약 */}
          <div className={`order-summary-card glass-card ${isAnimated ? 'fade-in' : ''}`}>
            <h3>주문 요약</h3>
            <div className="summary-items">
              {price.details.map((item, index) => (
                <div key={index} className={`summary-item ${item.type === 'discount' ? 'discount' : ''}`}>
                  <span className="item-label">{item.label}</span>
                  <span className="item-amount">
                    {item.amount > 0 ? `$${item.amount}` : item.amount < 0 ? `-$${Math.abs(item.amount)}` : ''}
                    {item.note && <span className="item-note"> ({item.note})</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>총 요금</span>
              <span className="total-amount">${price.total}</span>
            </div>
          </div>
          
          {/* 결제 방법 */}
          <div className={`payment-methods ${isAnimated ? 'fade-in' : ''}`}>
            <h3>결제 방법 선택</h3>
            
            <label className={`payment-method-card glass-card ${booking.payment.method === 'deposit' ? 'active' : ''}`}>
              <input 
                type="radio"
                name="paymentMethod"
                value="deposit"
                checked={booking.payment.method === 'deposit'}
                onChange={(e) => updateBookingField('payment.method', e.target.value)}
              />
              <div className="method-content">
                <div className="method-header">
                  <div className="method-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="method-info">
                    <h4>예약금 결제</h4>
                    <span className="recommend-badge pulse">추천</span>
                  </div>
                </div>
                <p className="method-desc">현장에서 잔액 결제 · 수수료 없음</p>
                <div className="method-price">
                  <span className="price-value">${price.reservationFee}</span>
                </div>
              </div>
            </label>
            
            <label className={`payment-method-card glass-card ${booking.payment.method === 'full' ? 'active' : ''}`}>
              <input 
                type="radio"
                name="paymentMethod"
                value="full"
                checked={booking.payment.method === 'full'}
                onChange={(e) => updateBookingField('payment.method', e.target.value)}
              />
              <div className="method-content">
                <div className="method-header">
                  <div className="method-icon">
                    <CreditCard size={24} />
                  </div>
                  <div className="method-info">
                    <h4>전액 결제</h4>
                  </div>
                </div>
                <p className="method-desc">일시불 결제 · 수수료 20% 포함</p>
                <div className="method-price">
                  <span className="price-value">${price.fullPaymentFee}</span>
                </div>
              </div>
            </label>
          </div>
          
          {/* 결제자 정보 */}
          <div className={`billing-section ${isAnimated ? 'fade-in' : ''}`}>
            <h3>결제자 정보</h3>
            
            <form className="modern-form">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  <span>이름 (한글)</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  value={booking.payment.billing.name}
                  onChange={(e) => {
                    e.preventDefault();
                    updateBookingField('payment.billing.name', e.target.value);
                  }}
                  placeholder="결제자 이름"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <span>회사명 (선택)</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  value={booking.payment.billing.company}
                  onChange={(e) => {
                    e.preventDefault();
                    updateBookingField('payment.billing.company', e.target.value);
                  }}
                  placeholder="회사명"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <span>이메일</span>
                </label>
                <input 
                  type="email"
                  className="form-input"
                  value={booking.payment.billing.email}
                  onChange={(e) => {
                    e.preventDefault();
                    updateBookingField('payment.billing.email', e.target.value);
                  }}
                  placeholder="예약 확인서를 받으실 이메일"
                />
                <p className="form-hint">daum/hanmail/yahoo 계정은 전송 불가할 수 있습니다</p>
              </div>
            </form>
          </div>
          
          {/* 카드 정보 */}
          <div className={`card-section ${isAnimated ? 'fade-in' : ''}`}>
            <div className="card-header">
              <h3>카드 정보</h3>
              <div className="security-badge">
                <Shield size={16} />
                <span>Stripe 보안 결제</span>
              </div>
            </div>
            
            <form className="modern-form">
              <div className="form-group">
                <label className="form-label">
                  <CreditCard size={16} />
                  <span>카드 번호</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  value={booking.payment.card.number}
                  onChange={(e) => {
                    e.preventDefault();
                    updateBookingField('payment.card.number', e.target.value);
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span>유효기간</span>
                  </label>
                  <input 
                    type="text"
                    className="form-input"
                    value={booking.payment.card.expiry}
                    onChange={(e) => {
                      e.preventDefault();
                      updateBookingField('payment.card.expiry', e.target.value);
                    }}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <span>CVC</span>
                  </label>
                  <input 
                    type="text"
                    className="form-input"
                    value={booking.payment.card.cvc}
                    onChange={(e) => {
                      e.preventDefault();
                      updateBookingField('payment.card.cvc', e.target.value);
                    }}
                    placeholder="123"
                    maxLength="4"
                  />
                </div>
              </div>
            </form>
          </div>
          
          {/* 약관 동의 */}
          <div className={`terms-section ${isAnimated ? 'fade-in' : ''}`}>
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">예약 정보를 이메일로 발송합니다. 반드시 확인해주세요.</span>
            </label>
            
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">이용약관 및 개인정보 수집에 동의합니다.</span>
            </label>
            
            <p className="terms-notice">
              이메일을 확인하지 않아 발생하는 일은 옐로라이드에서 책임지지 않습니다.
            </p>
          </div>
        </div>
        
        <BottomCTA 
          text={`$${price.finalAmount} 결제하기`}
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
              updateBookingField('bookingResult', response);
              // 스크롤 위치 리셋 후 페이지 전환
              window.scrollTo(0, 0);
              updateStep('complete');
            } catch (err) {
              setError('예약 처리 중 오류가 발생했습니다.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={!booking.payment.billing.name || !booking.payment.billing.email || 
                   !booking.payment.card.number || !booking.payment.card.expiry || !booking.payment.card.cvc}
        />
      </div>
    );
  };

  // 예약 완료
  const CompleteStep = () => {
    const [showAnimations, setShowAnimations] = useState(false);

    // 완료 페이지 접근 시 스크롤 최상단으로
    useEffect(() => {
      if (currentStep === 'complete') {
        // 즉시 스크롤 위치 리셋
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
        setShowAnimations(false);
      }
    }, [currentStep]);

    // 스크롤 감지하여 애니메이션 시작
    useEffect(() => {
      if (currentStep !== 'complete') return;

      const handleScroll = () => {
        if (window.scrollY > 50 && !showAnimations) {
          setShowAnimations(true);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [currentStep, showAnimations]);

    if (currentStep !== 'complete') return null;

    return (
      <div className="complete-page">
        <div className="complete-content">
          <div className="success-animation">
            <div className={`success-circle ${showAnimations ? 'pulse' : ''}`}>
              <CheckCircle size={80} />
            </div>
            {showAnimations && (
              <div className="confetti">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="confetti-piece" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)]
                  }} />
                ))}
              </div>
            )}
          </div>
          
          <h1 className={`complete-title ${showAnimations ? 'slide-up' : ''}`}>예약이 완료되었습니다!</h1>
          <p className={`complete-subtitle ${showAnimations ? 'slide-up delay-1' : ''}`}>Simply Good Ride with YelloRide</p>
          
          <div className={`booking-number-card glass-card ${showAnimations ? 'scale-in delay-2' : ''}`}>
            <span className="booking-label">예약번호</span>
            <strong className="booking-value">{booking.bookingResult?.bookingId || 'YR-2025-001'}</strong>
          </div>
          
          {/* 예약 정보 */}
          <div className={`booking-summary-card glass-card ${showAnimations ? 'slide-up delay-3' : ''}`}>
            <h3>예약 정보</h3>
            
            <div className="summary-content">
              <div className="summary-row">
                <span className="row-label">서비스</span>
                <span className="row-value">택시 예약</span>
              </div>
              
              <div className="summary-row">
                <span className="row-label">지역</span>
                <span className="row-value">{booking.region === 'NY' ? '뉴욕' : 'LA'}</span>
              </div>
              
              <div className="summary-row">
                <span className="row-label">편도 경로</span>
                <span className="row-value">{booking.outbound.departure} → {booking.outbound.arrival}</span>
              </div>
              
              {booking.isRoundTrip && (
                <div className="summary-row">
                  <span className="row-label">왕복 경로</span>
                  <span className="row-value">{booking.return.departure} → {booking.return.arrival}</span>
                </div>
              )}
              
              <div className="summary-row highlight">
                <span className="row-label">결제 금액</span>
                <span className="row-value">${calculatePrice().finalAmount}</span>
              </div>
            </div>
          </div>
          
          {/* 다음 단계 안내 */}
          <div className={`next-steps-section ${showAnimations ? 'fade-in delay-4' : ''}`}>
            <h3>다음 단계</h3>
            
            <div className="steps-grid">
              <div className="step-item glass-card">
                <div className="step-icon">
                  <span>1</span>
                </div>
                <h4>이메일 확인</h4>
                <p>예약 확인서가 발송되었습니다</p>
              </div>
              
              <div className="step-item glass-card">
                <div className="step-icon">
                  <span>2</span>
                </div>
                <h4>픽업 준비</h4>
                <p>기사님이 도착 시 연락드립니다</p>
              </div>
              
              <div className="step-item glass-card">
                <div className="step-icon">
                  <span>3</span>
                </div>
                <h4>편안한 여행</h4>
                <p>YelloRide와 함께 즐거운 여행되세요</p>
              </div>
            </div>
          </div>
          
          {/* 연락처 */}
          <div className={`contact-options ${showAnimations ? 'fade-in delay-5' : ''}`}>
            <h3>도움이 필요하신가요?</h3>
            
            <div className="contact-buttons">
              <a href="https://pf.kakao.com/_xjHlLd" className="contact-button glass-card hover-lift" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={24} />
                <span>카카오톡 상담</span>
              </a>
              
              <a href="tel:+19178196464" className="contact-button glass-card hover-lift">
                <Phone size={24} />
                <span>전화 문의</span>
              </a>
            </div>
          </div>
          
          <button 
            className={`new-booking-button hover-glow ${showAnimations ? 'slide-up delay-6' : ''}`}
            onClick={() => {
              updateStep('hero');
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
                customer: { name: '', phone: '', kakaoId: '' },
                airport: { pickupDate: '', arrivalTime: '', flightNumber: '', address: '' },
                returnAirport: { pickupDate: '', arrivalTime: '', flightNumber: '', address: '' },
                options: { sim: false, carSeat: false, carSeatType: 'regular' },
                payment: { 
                  method: 'deposit', 
                  billing: { name: '', company: '', email: '' },
                  card: { number: '', expiry: '', cvc: '' }
                }
              });
            }}
          >
            새 예약하기
          </button>
        </div>
      </div>
    );
  };

  // Loading & Error Components
  const LoadingOverlay = () => (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>처리 중입니다...</p>
      </div>
    </div>
  );

  const ErrorToast = () => (
    <div className={`error-toast ${error ? 'show' : ''}`}>
      <AlertCircle size={20} />
      <span>{error}</span>
      <button onClick={() => setError(null)} className="toast-close">
        <X size={18} />
      </button>
    </div>
  );

  // Main Render
  return (
    <div className="yelloride-app">
      {loading && <LoadingOverlay />}
      {error && <ErrorToast />}
      
      <main className="app-main">
        <HeroPage />
        <MainPage />
        <ServiceStep />
        <RouteStep />
        <PassengersStep />
        <CustomerStep />
        <AirportStep />
        <OptionsStep />
        <PaymentStep />
        <CompleteStep />
      </main>
    </div>
  );
}

export default App;