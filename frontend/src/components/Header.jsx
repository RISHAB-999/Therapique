import React, { useContext } from 'react'
import { motion } from 'motion/react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets'
import { SplitTextReveal, TypewriterParagraph, FadeUp, ImageRevealMask, StaggerContainer, StaggerItem, ButtonPop } from './ScrollReveal'
import { AppContext } from '../context/AppContext'

const Header = () => {
    const { heroReady } = useContext(AppContext)
    const animState = heroReady ? "visible" : "hidden"

    return (
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pt-6 sm:pb-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center">

                {/* -------- Left Content (Clean & Unboxed) -------- */}
                <div className="space-y-5 sm:space-y-6 text-center md:text-left">
                    {/* 1. Hero Heading: Word-by-word fade + slide up */}
                    <h1 className="font-therapique text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-snug sm:leading-tight tracking-tight">
                        <SplitTextReveal 
                            text="Empowering change through personalized therapy and" 
                            as="span" 
                            className="inline" 
                            animate={animState}
                        />{' '}
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={heroReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="inline-flex items-center gap-1 align-baseline mx-1"
                        >
                            <span className="text-pink-400 text-lg sm:text-2xl animate-pulse">✿</span>
                            <span className="text-orange-400 text-lg sm:text-2xl animate-pulse delay-75">✿</span>
                            <span className="text-blue-400 text-lg sm:text-2xl animate-pulse delay-150">✿</span>
                        </motion.span>{' '}
                        <SplitTextReveal 
                            text="counseling" 
                            delay={0.45} 
                            as="span" 
                            className="inline" 
                            animate={animState}
                        />
                    </h1>

                    {/* 2. Subtitle: Typewriter-style word-by-word reveal (~48ms per word) */}
                    <div className="max-w-xl mx-auto md:mx-0">
                        <TypewriterParagraph
                            delay={0.2}
                            wordDelay={0.048}
                            text="Find the resources you need to face your current challenges with our expert team of licensed therapists and counselors in Ontario and throughout Canada."
                            className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed font-medium"
                            animate={animState}
                        />
                    </div>

                    {/* 3. Button: Fade + small scale */}
                    <FadeUp delay={0.35} animate={animState} className="pt-2">
                        <Link to="/doctors">
                            <ButtonPop className="inline-flex items-center gap-2 bg-black text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-extrabold shadow-md hover:bg-gray-800 transition-all duration-300 cursor-pointer">
                                <span>Book a FREE consultation</span>
                                <span>→</span>
                            </ButtonPop>
                        </Link>
                    </FadeUp>

                    {/* 4. Specialty Links (Staggered Fade-Up) */}
                    <StaggerContainer staggerDelay={0.07} delayChildren={0.4} animate={animState} className="grid grid-cols-2 gap-x-5 sm:gap-x-8 gap-y-3 pt-3 text-xs sm:text-sm md:text-base font-semibold text-gray-800 max-w-lg mx-auto md:mx-0 text-left">
                        {specialityData.slice(0, 4).map((item, index) => (
                            <StaggerItem key={index}>
                                <Link
                                    to={`/doctors/${item.speciality}`}
                                    className="group flex items-center justify-start gap-1.5 py-1 text-gray-800 hover:text-black transition-colors"
                                >
                                    <span className="truncate hover:underline underline-offset-4">{item.speciality}</span>
                                    <span className="group-hover:translate-x-1 transition-transform text-gray-400 group-hover:text-black shrink-0">→</span>
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>

                {/* -------- Right Image (Image Reveal with Slow Floating & Parallax) -------- */}
                <div className="flex justify-center items-center">
                    <ImageRevealMask 
                        src={assets.header_img}
                        alt="Doctors Team"
                        float={true}
                        delay={0.15}
                        animate={animState}
                        className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[540px] rounded-3xl shadow-lg border border-[#EADBCE]"
                        imgClassName="w-full h-auto object-cover rounded-3xl transition-all duration-500 hover:scale-[1.03] cursor-pointer"
                    />
                </div>
            </div>
        </div>
    )
}

export default React.memo(Header)
