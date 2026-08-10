import React, { useContext, useState } from 'react'
import Title from './Title'
import { ShopContext } from '../context/ShopContext'
import { categories } from '../assets/data'

const categoryStylesMap = {
  "mental health": {
    bgColor: "#D9F2FF",
    shadowColor: "rgba(180, 220, 255, 0.85)",
    borderColor: "#A6DCFF"
  },
  "self-help & counseling": {
    bgColor: "#FFF4CC",
    shadowColor: "rgba(255, 235, 170, 0.85)",
    borderColor: "#FFE499"
  },
  "children & parenting": {
    bgColor: "#DFF8E8",
    shadowColor: "rgba(195, 240, 210, 0.85)",
    borderColor: "#B8EECC"
  },
  "relationships & family": {
    bgColor: "#FFE5D4",
    shadowColor: "rgba(255, 215, 190, 0.85)",
    borderColor: "#FFC8AA"
  },
  "trauma recovery": {
    bgColor: "#E8DEFF",
    shadowColor: "rgba(215, 200, 255, 0.85)",
    borderColor: "#CDB9FF"
  },
  "addiction recovery": {
    bgColor: "#FFE1E1",
    shadowColor: "rgba(255, 200, 200, 0.85)",
    borderColor: "#FFB3B3"
  },
  "cbt & psychology": {
    bgColor: "#D9F2FF",
    shadowColor: "rgba(180, 220, 255, 0.85)",
    borderColor: "#A6DCFF"
  },
  "creative therapy": {
    bgColor: "#DDF8F7",
    shadowColor: "rgba(185, 240, 238, 0.85)",
    borderColor: "#ACEEEC"
  }
};

const Category3DCard = ({ cat, index, onClick }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const catKey = cat.name.toLowerCase().trim();
  const styleConfig = categoryStylesMap[catKey] || {
    bgColor: "#D9F2FF",
    shadowColor: "rgba(180, 220, 255, 0.85)",
    borderColor: "#A6DCFF"
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({ x: -(y / rect.height) * 22, y: (x / rect.width) * 22 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer group py-2"
      style={{ perspective: '1000px' }}
    >
      <div
        style={{
          backgroundColor: styleConfig.bgColor,
          transform: isHovered
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(16px) scale(1.06)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
          boxShadow: isHovered
            ? `0 16px 32px -6px ${styleConfig.shadowColor}, 0 6px 12px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,0.8)`
            : '0 2px 6px rgba(0,0,0,0.04)',
          borderBottom: isHovered ? `5px solid ${styleConfig.borderColor}` : '5px solid transparent',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out, box-shadow 0.4s ease-out, border-bottom 0.4s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="flexCenter flex-col h-32 w-32 sm:h-36 sm:w-36 md:h-36 md:w-36 lg:h-40 lg:w-40 rounded-2xl p-3 sm:p-4 relative transition-all duration-300"
      >
        {/* Glossy 3D Highlight Layer */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none" />

        {/* 3D Floating Icon Container */}
        <div 
          style={{
            transform: isHovered ? 'translateZ(28px)' : 'translateZ(0px)',
            transition: 'transform 0.3s ease-out'
          }}
          className="p-2.5 sm:p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300 mb-1 sm:mb-2 flexCenter"
        >
          <img
            src={cat.image}
            alt={cat.name}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* 3D Text */}
        <h5 
          style={{
            transform: isHovered ? 'translateZ(22px)' : 'translateZ(0px)',
            transition: 'transform 0.3s ease-out'
          }}
          className="text-xs sm:text-sm md:text-base capitalize text-gray-800 font-semibold text-center tracking-wide group-hover:text-black mt-1"
        >
          {cat.name}
        </h5>
      </div>
    </div>
  );
};

const Categories = () => {
  const { navigate } = useContext(ShopContext)
  return (
    <section className='pt-16 pb-4'>
      <Title title1={"Category"} title2={"List"} title1Styles={"pb-6"} paraStyles={"hidden"} />
      {/* CONTAINER */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 justify-items-start items-center w-full max-w-6xl'>
        {categories.map((cat, index) => (
          <Category3DCard 
            key={index} 
            cat={cat} 
            index={index} 
            onClick={() => navigate(`/shop/${cat.name.toLowerCase()}`)} 
          />
        ))}
      </div>
    </section>
  )
}

export default Categories