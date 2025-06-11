import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Clock, Shield, Star, Users } from 'lucide-react';

const BrandingCard = ({ progress, onRegionSelect }) => {
  const translateY = Math.max(0, 100 - progress * 120);
  const opacity = Math.max(0, Math.min(1, progress * 2));
  const scale = 0.9 + progress * 0.1;

  return (
    <motion.div 
      className="branding-section"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
        opacity: opacity,
        zIndex: 5,
        width: '90%',
        maxWidth: '600px'
      }}
    >
      {/* Top Header */}
      <motion.div 
        className="branding-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: progress > 0.3 ? 1 : 0, y: progress > 0.3 ? 0 : -20 }}
        transition={{ duration: 0.6 }}
      >
        <div className="brand-logo-small">
          <span className="logo-icon-small">🚕</span>
          <span className="brand-text">YelloRide</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        className="branding-card"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ 
          opacity: progress > 0.2 ? 1 : 0, 
          y: progress > 0.2 ? 0 : 50,
          scale: progress > 0.2 ? 1 : 0.9
        }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Card Header */}
        <div className="card-header">
          <div className="service-badge">믿을 수 있는 서비스</div>
          <h2 className="card-title">
            미국 택시 서비스<br />
            <span className="highlight">YelloRide</span>
          </h2>
          <p className="card-subtitle">
            24시간 한국어 지원, 안전한 단독 차량으로<br />
            편안한 미국 여행을 시작하세요
          </p>
        </div>

        {/* Features Grid */}
        <motion.div 
          className="features-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 0.4 ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="feature-card">
            <div className="feature-icon-bg">
              <MapPin size={24} />
            </div>
            <div className="feature-content">
              <h4>정확한 픽업</h4>
              <p>공항 터미널까지 정확한 위치 안내</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-bg">
              <Clock size={24} />
            </div>
            <div className="feature-content">
              <h4>실시간 추적</h4>
              <p>차량 위치와 도착 시간 실시간 확인</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-bg">
              <Shield size={24} />
            </div>
            <div className="feature-content">
              <h4>안전 보장</h4>
              <p>보험 가입 차량과 검증된 드라이버</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-bg">
              <Star size={24} />
            </div>
            <div className="feature-content">
              <h4>5성급 서비스</h4>
              <p>고객 만족도 99% 프리미엄 서비스</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="stats-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: progress > 0.5 ? 1 : 0,
            y: progress > 0.5 ? 0 : 20
          }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="stat-item">
            <div className="stat-number">50,000+</div>
            <div className="stat-label">누적 이용객</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">99.8%</div>
            <div className="stat-label">만족도</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">고객지원</div>
          </div>
        </motion.div>

        {/* Region Preview */}
        <motion.div 
          className="region-preview"
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: progress > 0.6 ? 1 : 0,
            y: progress > 0.6 ? 0 : 30
          }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3>서비스 지역</h3>
          <div className="region-buttons">
            <motion.button 
              className="region-preview-btn ny"
              onClick={() => onRegionSelect('NY')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="region-icon">🗽</div>
              <div className="region-info">
                <div className="region-name">뉴욕</div>
                <div className="region-desc">JFK, LGA, EWR</div>
              </div>
            </motion.button>

            <motion.button 
              className="region-preview-btn la"
              onClick={() => onRegionSelect('LA')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="region-icon">🌴</div>
              <div className="region-info">
                <div className="region-name">로스앤젤레스</div>
                <div className="region-desc">LAX, 할리우드</div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BrandingCard;