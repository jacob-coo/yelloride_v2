import { useState, useEffect } from 'react';

const useScrollProgress = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      
      // 전체 스크롤 진행률 (0-1)
      const progress = Math.min(scrollPosition / (windowHeight * 2.5), 1);
      
      // 현재 섹션 계산 (0: Hero, 1: Branding, 2: Service)
      let section = 0;
      if (progress > 0.4) section = 1;
      if (progress > 0.7) section = 2;
      
      setScrollY(scrollPosition);
      setScrollProgress(progress);
      setCurrentSection(section);
    };

    // Throttled scroll event for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  // 각 섹션별 진행률 계산
  const heroProgress = Math.max(0, Math.min(1, scrollProgress / 0.4));
  const brandingProgress = Math.max(0, Math.min(1, (scrollProgress - 0.3) / 0.4));
  const serviceProgress = Math.max(0, Math.min(1, (scrollProgress - 0.6) / 0.4));

  return {
    scrollY,
    scrollProgress,
    currentSection,
    heroProgress,
    brandingProgress,
    serviceProgress
  };
};

export default useScrollProgress;