import React, { useState, useEffect, useRef } from 'react';

const AnimatedCounter = ({ value, duration = 800 }) => {
  const [count, setCount] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = parseInt(value, 10) || 0;

    if (start === end) {
      setCount(end);
      return;
    }

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing: easeOutQuad
      const ease = percentage * (2 - percentage);
      const current = Math.floor(start + (end - start) * ease);

      setCount(current);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
        prevValueRef.current = end;
      }
    };

    const animFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animFrame);
      setCount(end);
      prevValueRef.current = end;
    };
  }, [value, duration]);

  return <>{count}</>;
};

export default AnimatedCounter;
