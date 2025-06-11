import React, { useState, useEffect } from 'react';

const HeroImageSlider = ({ onBookingClick }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <div className="hero-container">
      {/* 배경 이미지 */}
      <img
        src={isMobile ? '/image/title.png' : '/image/title_wide.png'}
        alt="YelloRide 택시 예약 서비스"
        className="hero-image"
      />

      {/* F형 레이아웃 콘텐츠 */}
      <div className="hero-content">
        {/* 상단 헤더 */}
        <div className="hero-header">
          <div className="hero-logo">YelloRide</div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="hero-main">
          <h1 className="hero-title">
            나를 아는 여행 앱<br />
            YelloRide
          </h1>
          
          <p className="hero-subtitle">
            계획부터 예약까지, 여행이 쉬워지는
          </p>
          
          <button className="hero-cta" onClick={onBookingClick}>
            택시 예약하기
            <span>🚗</span>
          </button>
        </div>

        {/* 하단 푸터 */}
        <div className="hero-footer">
          <div className="hero-footer-text">
            <strong>Yellow Travel LLC</strong> · 미국 정식 등록 업체<br />
            © 2025 YelloRide. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroImageSlider;