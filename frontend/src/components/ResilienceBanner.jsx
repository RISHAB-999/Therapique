import React from 'react'
import { motion } from 'motion/react'

/**
 * ResilienceBanner: Curved green arch banner divider on HomePage.
 * Features:
 * 1. Background comes up smoothly from down on scroll into view.
 * 2. Then fluid word-by-word reveal of the message text.
 * 3. Spring bounce for decorative flower emojis.
 * 4. Re-triggers smoothly on scroll (once: false) so scrolling up or down reveals it cleanly.
 */
const ResilienceBanner = () => {
  // Container: arch background rises up from down as it enters view
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 75,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
        delayChildren: 0.32,
        staggerChildren: 0.05,
      },
    },
  }

  // Fluid word-by-word entrance (GPU-composited opacity + translateY)
  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 14,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.36,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  // Cheerful spring bounce for the flower emojis
  const emojiVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      rotate: -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 360,
        damping: 18,
      },
    },
  }

  const line1Words = ['Building', 'resilience', 'together']
  const line3Words = ['on', 'your', 'path', 'to', 'well-being']

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.25 }}
      variants={containerVariants}
      className="relative text-center rounded-t-[100%] py-12 sm:py-20 px-6 mt-8 sm:mt-14 
        bg-[linear-gradient(to_bottom,theme(colors.green.600),theme(colors.green.400),theme(colors.green.300),theme(colors.background))] 
        text-gray-900 overflow-hidden transform-gpu will-change-transform"
    >
      <div className="flex items-end justify-center min-h-[120px] sm:min-h-[180px]">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug max-w-2xl mx-auto font-therapique">
          {/* Line 1: Building resilience together */}
          <span className="block">
            {line1Words.map((word, i) => (
              <motion.span
                key={word + i}
                variants={wordVariants}
                className="inline-block mr-[0.28em] transform-gpu"
              >
                {word}
              </motion.span>
            ))}
          </span>

          {/* Line 2: with Therapique 🌸 🌺 */}
          <span className="block">
            <motion.span
              variants={wordVariants}
              className="inline-block mr-[0.28em] transform-gpu"
            >
              with
            </motion.span>
            <motion.span
              variants={wordVariants}
              className="inline-block font-bold text-[#463830] mr-[0.28em] transform-gpu"
            >
              Therapique
            </motion.span>
            <motion.span
              variants={emojiVariants}
              className="inline-block transform-gpu select-none"
            >
              🌸 🌺
            </motion.span>
          </span>

          {/* Line 3: on your path to well-being */}
          <span className="block">
            {line3Words.map((word, i) => (
              <motion.span
                key={word + i}
                variants={wordVariants}
                className="inline-block mr-[0.28em] transform-gpu"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h2>
      </div>
    </motion.div>
  )
}

export default ResilienceBanner
