import React, { useEffect, useState, useRef, useMemo } from 'react'
import { motion } from 'motion/react'

/**
 * Therapique Signature Intro Animation:
 * 1. Sequential Typewriter Reveal: Characters "therapıque" type out letter by letter.
 * 2. Flower Petals: 3 abstract pastel flowers bloom underneath once typed.
 * 3. Dot Jump Animation: The standalone dot appears above "t" and visibly hops across
 *    the characters in smooth bouncy arcs, landing precisely atop the "i" stem with an elegant gap.
 * 4. Settle Pulse & Pause: Emerald glow pulse on "i" followed by an intentional pause.
 * 5. Vertical Split: Canvas splits vertically down the center (Left <-, Right ->) with zero seams and 60fps GPU acceleration.
 * 6. Homepage Revealed: Underlying homepage appears smoothly.
 */
const LETTERS = ["t", "h", "e", "r", "a", "p", "ı", "q", "u", "e"]

const FLOWERS = [
  { color: "#F472B6", label: "Pink Petal" },
  { color: "#FB923C", label: "Orange Petal" },
  { color: "#60A5FA", label: "Blue Petal" }
]

const SplashScreen = ({ onComplete, onSplitStart }) => {
  const wordmarkRef = useRef(null)
  const tRef = useRef(null)
  const iRef = useRef(null)
  const splitFiredRef = useRef(false)
  const completeFiredRef = useRef(false)

  const [positions, setPositions] = useState(null)
  const [isTypingDone, setIsTypingDone] = useState(false)
  const [isLandedOnI, setIsLandedOnI] = useState(false)
  const [isSplitting, setIsSplitting] = useState(false)

  // Fire split/complete only once to prevent double-firing
  const fireSplit = () => {
    if (splitFiredRef.current) return
    splitFiredRef.current = true
    setIsSplitting(true)
    if (onSplitStart) onSplitStart()
  }

  const fireComplete = () => {
    if (completeFiredRef.current) return
    completeFiredRef.current = true
    if (onComplete) onComplete()
  }

  // Measure exact coordinates of 't' and 'i' relative to wordmark container
  useEffect(() => {
    const measurePositions = () => {
      if (wordmarkRef.current && iRef.current && tRef.current) {
        const wordmarkRect = wordmarkRef.current.getBoundingClientRect()
        const tRect = tRef.current.getBoundingClientRect()
        const iRect = iRef.current.getBoundingClientRect()

        const isMobile = window.innerWidth < 640
        const dotHalf = isMobile ? 5 : 6.5
        const startX = tRect.left + (tRect.width / 2) - wordmarkRect.left - dotHalf
        const targetX = iRect.left + (iRect.width / 2) - wordmarkRect.left - dotHalf
        // Position dot as a natural tittle just above the 'ı' stem
        const targetY = (iRect.top - wordmarkRect.top) - (isMobile ? 2 : 4)

        setPositions({
          startX: startX > 0 ? startX : 14,
          baseY: isMobile ? -6 : -8,
          targetX: targetX > 0 ? targetX : 210,
          targetY: targetY ? targetY : (isMobile ? 0 : -2)
        })
      }
    }

    // Measure positions and trigger dot jump as soon as typewriter finishes
    measurePositions()
    const rId = requestAnimationFrame(measurePositions)
    const timer1 = setTimeout(measurePositions, 80)
    
    // Typewriter finishes in ~580ms -> reveal dot and start jump immediately at 650ms
    const typingTimer = setTimeout(() => {
      measurePositions()
      setIsTypingDone(true)
    }, 650)

    // Guaranteed safety timeout (never stalls)
    const safetyTimer = setTimeout(() => {
      fireSplit()
      setTimeout(fireComplete, 1100)
    }, 4800)

    return () => {
      cancelAnimationFrame(rId)
      clearTimeout(timer1)
      clearTimeout(typingTimer)
      clearTimeout(safetyTimer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Triggered when dot finishes its jumping arc sequence
  const handleDotJumpComplete = () => {
    setIsLandedOnI(true)

    // Intentional pause on completed wordmark before triggering vertical split
    setTimeout(() => {
      fireSplit()
      // Unmount splash screen once vertical split curtains fully separate smoothly
      setTimeout(fireComplete, 1100)
    }, 400)
  }

  // Precompute jumping arc keyframes (memoized)
  const arcData = useMemo(() => {
    const startX = positions?.startX ?? 14
    const baseY = positions?.baseY ?? -6
    const targetX = positions?.targetX ?? 210
    const targetY = positions?.targetY ?? 0
    const distance = targetX - startX
    const hop1X = startX + distance * 0.32
    const hop2X = startX + distance * 0.65

    return { startX, baseY, targetX, targetY, distance, hop1X, hop2X }
  }, [positions])

  const { startX, baseY, targetX, targetY, distance, hop1X, hop2X } = arcData

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden transform-gpu">
      {/* Left Shutter (GPU Accelerated translate3d) */}
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: isSplitting ? "-100%" : "0%" }}
        transition={{ duration: 1.1, ease: [0.33, 1, 0.68, 1] }}
        className="absolute top-0 left-0 bottom-0 w-[50vw] bg-[#FAF5EE] z-10 will-change-transform transform-gpu"
        style={{ backfaceVisibility: 'hidden' }}
      />

      {/* Right Shutter (GPU Accelerated translate3d) */}
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: isSplitting ? "100%" : "0%" }}
        transition={{ duration: 1.1, ease: [0.33, 1, 0.68, 1] }}
        className="absolute top-0 right-0 bottom-0 w-[50vw] bg-[#FAF5EE] z-10 will-change-transform transform-gpu"
        style={{ backfaceVisibility: 'hidden' }}
      />

      {/* Center Stage Container */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isSplitting ? 0 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 transform-gpu pointer-events-none"
      >
        <div className="relative flex flex-col items-center justify-center -translate-y-2">
          {/* Main Wordmark Container */}
          <div
            ref={wordmarkRef}
            className="relative font-therapique text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 inline-flex items-baseline select-none"
          >
            {/* 1. Sequential Typewriter Text Animation */}
            {LETTERS.map((char, index) => {
              const isT = index === 0
              const isI = index === 6

              return (
                <motion.span
                  key={index}
                  ref={isI ? iRef : (isT ? tRef : null)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.055,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="inline-block relative transform-gpu"
                >
                  {char}
                </motion.span>
              )
            })}

            {/* 2. Independent, Absolutely Positioned Jumping Dot Element */}
            {isTypingDone && positions && (
              <motion.div
                className="absolute top-0 left-0 z-30 pointer-events-none transform-gpu will-change-transform"
                style={{ backfaceVisibility: 'hidden' }}
                initial={{
                  x: startX,
                  y: baseY,
                  scale: 1,
                  opacity: 1
                }}
                animate={
                  isLandedOnI
                    ? {
                        x: targetX,
                        y: targetY,
                        scaleX: 1,
                        scaleY: 1,
                        opacity: 1
                      }
                    : {
                        x: [
                          startX,
                          startX + (distance * 0.16),
                          hop1X,
                          startX + (distance * 0.48),
                          hop2X,
                          startX + (distance * 0.84),
                          targetX
                        ],
                        y: [
                          baseY,
                          -40,
                          baseY,
                          -46,
                          baseY,
                          -52,
                          targetY
                        ],
                        scaleX: [1, 0.88, 1.14, 0.88, 1.14, 0.9, 1],
                        scaleY: [1, 1.15, 0.9, 1.15, 0.9, 1.12, 1],
                        opacity: 1
                      }
                }
                transition={
                  isLandedOnI
                    ? { duration: 0.1 }
                    : {
                        duration: 1.45,
                        delay: 0,
                        times: [0, 0.18, 0.35, 0.52, 0.68, 0.85, 1.0],
                        ease: "easeInOut"
                      }
                }
                onAnimationComplete={handleDotJumpComplete}
              >
                <div className="relative flex items-center justify-center">
                  {/* The Physical Dot */}
                  <motion.span
                    animate={
                      isLandedOnI
                        ? { y: [0, 1.5, -0.6, 0] }
                        : {}
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full block ${
                      isLandedOnI
                        ? 'bg-gray-900 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                        : 'bg-gray-900 shadow-sm'
                    }`}
                  />

                  {/* Settle Sparkle Pulse when locked onto 'i' */}
                  {isLandedOnI && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 1 }}
                      animate={{ scale: 2.6, opacity: 0 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-emerald-400/80 pointer-events-none"
                    />
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* 3. Three Abstract Flower Petals */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-3 sm:gap-3.5 mt-3 sm:mt-4"
          >
            {FLOWERS.map((flower, idx) => (
              <span
                key={idx}
                style={{ color: flower.color }}
                className="text-sm sm:text-base md:text-lg select-none inline-block leading-none transform-gpu"
                aria-label={flower.label}
              >
                ✿
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default React.memo(SplashScreen)
