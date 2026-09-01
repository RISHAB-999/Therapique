import React, { useContext, useState, useRef, useCallback } from 'react'
import Title from './Title'
import { ShopContext } from '../context/ShopContext'
import { categories } from '../assets/data'
import { StaggerContainer, StaggerItem } from './ScrollReveal'
import { toast } from 'react-toastify'

const categoryStylesMap = {
  "mental health": {
    bgColor: "#EBF6FC",
    shadowColor: "rgba(180, 220, 255, 0.6)",
    borderColor: "#C5E6F8"
  },
  "self-help & counseling": {
    bgColor: "#FFF8E7",
    shadowColor: "rgba(255, 235, 170, 0.6)",
    borderColor: "#FFEAA8"
  },
  "children & parenting": {
    bgColor: "#EEFAF3",
    shadowColor: "rgba(195, 240, 210, 0.6)",
    borderColor: "#CDEFD9"
  },
  "relationships & family": {
    bgColor: "#FFF0E8",
    shadowColor: "rgba(255, 215, 190, 0.6)",
    borderColor: "#FFD9C6"
  },
  "trauma recovery": {
    bgColor: "#F3EDFF",
    shadowColor: "rgba(215, 200, 255, 0.6)",
    borderColor: "#DDD0FF"
  },
  "addiction recovery": {
    bgColor: "#FFEAEA",
    shadowColor: "rgba(255, 200, 200, 0.6)",
    borderColor: "#FFCECE"
  },
  "cbt & psychology": {
    bgColor: "#EBF6FC",
    shadowColor: "rgba(180, 220, 255, 0.6)",
    borderColor: "#C5E6F8"
  },
  "creative therapy": {
    bgColor: "#E8FAF9",
    shadowColor: "rgba(185, 240, 238, 0.6)",
    borderColor: "#C4F4F2"
  }
};

const CategoryCard = React.memo(({ cat, onClick }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef(null);

  const catKey = cat.name.toLowerCase().trim();
  const styleConfig = categoryStylesMap[catKey] || {
    bgColor: "#EBF6FC",
    shadowColor: "rgba(180, 220, 255, 0.6)",
    borderColor: "#C5E6F8"
  };

  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) return;
    const currentTarget = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      const rect = currentTarget.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;
      setRotate({ x: -(y / rect.height) * 15, y: (x / rect.width) * 15 });
      rafRef.current = null;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  }, []);

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer group w-full"
      style={{ perspective: '1000px' }}
    >
      <div
        style={{
          backgroundColor: styleConfig.bgColor,
          transform: isHovered
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(12px) scale(1.03)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
          boxShadow: isHovered
            ? `0 14px 28px -6px ${styleConfig.shadowColor}, 0 4px 10px rgba(0,0,0,0.04)`
            : '0 2px 8px rgba(70,56,48,0.04)',
          borderColor: styleConfig.borderColor,
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.35s ease-out, box-shadow 0.35s ease-out, border-color 0.35s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="flex flex-col items-center justify-center w-full min-h-[128px] sm:min-h-[145px] rounded-3xl p-3.5 sm:p-4 border transition-all duration-300 relative will-change-transform"
      >
        {/* Floating Icon Container */}
        <div 
          style={{
            transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)',
            transition: 'transform 0.25s ease-out'
          }}
          className="p-2 sm:p-2.5 bg-white/90 rounded-2xl shadow-xs group-hover:shadow-md transition-all duration-300 mb-2 flex items-center justify-center"
        >
          <img
            src={cat.image}
            alt={cat.name}
            loading="lazy"
            decoding="async"
            className="w-7 h-7 sm:w-9 sm:h-9 object-contain group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Category Label */}
        <h5 
          style={{
            transform: isHovered ? 'translateZ(16px)' : 'translateZ(0px)',
            transition: 'transform 0.25s ease-out'
          }}
          className="text-xs sm:text-sm capitalize text-gray-900 font-bold text-center leading-tight tracking-tight px-1"
        >
          {cat.name}
        </h5>
      </div>
    </div>
  );
});

const Categories = () => {
  const { navigate } = useContext(ShopContext)
  const token = localStorage.getItem('token')

  const handleCategoryClick = useCallback((catName) => {
    if (!token) {
      toast.info('Please log in or create an account to explore book categories')
      navigate('/login', { state: { message: 'Please log in or create an account to explore book categories', context: 'book' } })
    } else {
      navigate(`/shop/${catName.toLowerCase()}`)
    }
  }, [token, navigate])

  return (
    <section className='pt-10 sm:pt-16 pb-4'>
      <Title title1={"Category"} title2={"List"} title1Styles={"pb-4 sm:pb-6"} paraStyles={"hidden"} />
      
      {/* Responsive Grid with Staggered Scroll Reveal */}
      <StaggerContainer staggerDelay={0.06} className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 w-full max-w-6xl mx-auto'>
        {categories.map((cat, index) => (
          <StaggerItem key={index}>
            <CategoryCard 
              cat={cat} 
              onClick={() => handleCategoryClick(cat.name)} 
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}

export default React.memo(Categories)