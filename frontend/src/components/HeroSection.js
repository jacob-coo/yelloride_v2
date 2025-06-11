import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import titleImage from '../image/title.png';

const HeroSection = ({ progress, onCTAClick }) => {
  // 패럴렉스 효과 계산
  const parallaxY = progress * 50;
  const opacity = 1 - Math.min(progress * 1.5, 1);
  const scale = 1 + progress * 0.1;

  return (
    <motion.div 
      className="hero-fullscreen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 10,
        opacity: opacity,
        transform: `translateY(${parallaxY}px) scale(${scale})`,
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${titleImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark Overlay */}
      <div className="hero-overlay" />
      
      {/* Hero Content */}
      <div className="hero-content">
        {/* Logo */}
        <motion.div 
          className="hero-logo"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="logo-container">
            <div className="logo-icon">🚕</div>
            <span className="logo-text">YelloRide</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="hero-main"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h1 className="hero-title">
            미국의 모든 카서비스
          </h1>
          <p className="hero-subtitle">
            JFK, LAX 공항 픽업부터 도시 이동까지<br />
            24시간 한국어 지원, 안전한 단독 차량 서비스
          </p>
          
          {/* Features */}
          <motion.div 
            className="hero-features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="feature-item">
              <span className="feature-icon">✈️</span>
              <span>공항 실시간 픽업</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span>카톡 상담 가능</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚗</span>
              <span>합승 없는 단독차량</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button 
            className="hero-cta"
            onClick={onCTAClick}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>지금 예약하기</span>
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ opacity: opacity * 0.8 }}
        >
          <div className="scroll-text">스크롤하여 더 보기</div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;