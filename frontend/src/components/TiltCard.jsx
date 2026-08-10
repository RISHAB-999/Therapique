import React, { useRef, useState } from 'react';

const TiltCard = ({ children, className, glowColor, isPopular }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(0);
  const [glowY, setGlowY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = width / 2;
    const yc = height / 2;

    // Tilt scale: max 12 degrees
    const rotateXVal = ((yc - y) / yc) * 12;
    const rotateYVal = ((x - xc) / xc) * 12;

    setRotateX(rotateXVal);
    setRotateY(rotateYVal);

    setGlowX((x / width) * 100);
    setGlowY((y / height) * 100);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const baseScale = isPopular ? 1.05 : 1;
  const hoverScale = isPopular ? 1.08 : 1.05;

  const getBorderColor = (glow) => {
    if (typeof glow === 'string') {
      return glow.replace('0.45', '0.7');
    }
    return glow;
  };

  const cardStyle = {
    transform: isHovered
      ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${hoverScale}, ${hoverScale}, ${hoverScale})`
      : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(${baseScale}, ${baseScale}, ${baseScale})`,
    boxShadow: isHovered
      ? `0 0 25px 3px ${glowColor}`
      : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.035)',
    borderColor: isHovered ? getBorderColor(glowColor) : '',
    transition: isHovered ? 'none' : 'transform 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
      className={`${className} relative`}
    >
      {/* Most Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 z-20 whitespace-nowrap">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {/* Light glow background that moves with cursor */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-xl overflow-hidden"
          style={{
            background: `radial-gradient(circle 220px at ${glowX}% ${glowY}%, ${glowColor}, transparent 80%)`,
          }}
        />
      )}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
