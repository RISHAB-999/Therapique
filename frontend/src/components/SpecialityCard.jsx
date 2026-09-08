import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

const SpecialityCard = ({ item, index, isInView }) => {
  return (
    <motion.div
      custom={index}
      variants={{
        hidden: {
          opacity: 0,
          y: 55,
          scale: 0.88,
        },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.65,
            delay: 0.35 + i * 0.08,
            ease: [0.22, 1, 0.36, 1],
          },
        }),
      }}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="h-full"
    >
      <Link 
        onClick={() => scrollTo(0, 0)} 
        className="bg-white rounded-2xl overflow-hidden font-sans group cursor-pointer transition-all duration-300 hover:-translate-y-2 flex flex-col h-full shadow-sm hover:shadow-xl border border-neutral-100/90 hover:border-purple-200" 
        to={`/doctors/${item.speciality}`}
      >
        <div className="relative overflow-hidden w-full h-36 sm:h-48 md:h-52 shrink-0 bg-[#FAF5EE]">
          <motion.img
            src={item.image}
            alt={item.speciality}
            loading="lazy"
            custom={index}
            variants={{
              hidden: {
                scale: 1.22,
                opacity: 0.65,
              },
              visible: (i) => ({
                scale: 1,
                opacity: 1,
                transition: {
                  duration: 0.8,
                  delay: 0.4 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                },
              }),
            }}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 min-h-[60px] sm:min-h-[76px] text-center bg-white group-hover:bg-[#FFF0E6] transition-colors duration-300">
          <h3 className="text-xs sm:text-sm md:text-base font-serif font-medium text-gray-800 group-hover:text-gray-900 leading-snug">
            {item.speciality}
          </h3>
        </div>
      </Link>
    </motion.div>
  )
}

export default SpecialityCard

