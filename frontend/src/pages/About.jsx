import React from 'react'
import { useNavigate } from "react-router-dom"
import ProfileCard from '../components/ProfileCard'
import { teamMembers } from '../data'
import { motion } from 'motion/react'
import { ScrollFadeInOut, SplitTextReveal, TypewriterParagraph, StaggerContainer, StaggerItem } from '../components/ScrollReveal'

const About = () => {
  const navigate = useNavigate()
  return (
    <div className='overflow-hidden space-y-4 sm:space-y-8'>
      {/* 1. Hero Section with SplitTextReveal Heading & Typewriter Statement */}
      <ScrollFadeInOut>
        <section className="bg-[#fdf7f3] py-16 sm:py-20 px-6 text-center rounded-3xl border border-[#EADBCE]/40">
          {/* Animated Heading with Original Underline & Weight Styling */}
          <h1 className="font-therapique text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4 tracking-tight">
            <SplitTextReveal as="span" text="About" className="font-bold mr-2" />
            <SplitTextReveal as="span" text="Therapique" delay={0.06} className="font-normal underline decoration-gray-400 underline-offset-4" />
          </h1>

          {/* Typewriter Statement Paragraph */}
          <div className="max-w-2xl mx-auto mb-6">
            <TypewriterParagraph
              delay={0.2}
              wordDelay={0.048}
              text="At Therapique, we are committed to helping individuals overcome the weight of depression and mental health struggles by making therapy accessible and personal. Our mission is to connect people with compassionate, licensed professionals who can guide them toward healing, resilience, and lasting well-being."
              className="text-gray-700 text-base sm:text-lg leading-relaxed font-medium"
            />
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { navigate('/contact') }}
            className="group px-5 py-2 bg-[#FAF5EE] text-gray-900 rounded-full border border-[#EADBCE] transition-all hover:bg-black hover:text-white cursor-pointer shadow-xs active:scale-95"
          >
            <span className='inline-flex items-center gap-4 sm:gap-6'>
              <span className="text-sm sm:text-base font-semibold pl-2">Learn more about our team</span>
              <span className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black text-white transition-all group-hover:bg-white group-hover:text-black">
                →
              </span>
            </span>
          </motion.button>

          {/* Hero Image with Dynamic Upward Glide Entrance */}
          <div className="mt-10 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 65, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-6xl aspect-[3/2] sm:aspect-[16/9] md:aspect-[21/8] overflow-hidden rounded-3xl shadow-lg border border-[#EADBCE] transform-gpu"
            >
              <img
                src="https://images.unsplash.com/photo-1499728603263-13726abce5fd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Therapist and client"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>
      </ScrollFadeInOut>

      {/* 2. Quote Section with Typewriter Effect */}
      <ScrollFadeInOut>
        <section className="bg-[#fdf7f3] py-16 sm:py-20 px-6 text-center rounded-3xl border border-[#EADBCE]">
          <blockquote className="max-w-3xl mx-auto relative px-6">
            <span className="text-purple-600 text-3xl font-serif inline-block mr-1">“</span>
            <TypewriterParagraph
              delay={0.15}
              wordDelay={0.048}
              text="Our mission at Therapique is to empower individuals to rise above depression, anxiety, and emotional challenges by making therapy accessible, personal, and stigma-free. We believe that healing begins when connection becomes easy."
              className="inline font-therapique text-xl sm:text-2xl md:text-3xl text-gray-800 leading-relaxed"
            />
            <span className="text-purple-600 text-3xl font-serif inline-block ml-1">”</span>
          </blockquote>
        </section>
      </ScrollFadeInOut>

      {/* 3. Founders / Team Section with SplitTextReveal Heading & Staggered Cards */}
      <ScrollFadeInOut>
        <section className="py-16 sm:py-20 px-6 text-center max-w-7xl mx-auto">
          {/* Animated Heading with Underline and Styling */}
          <h2 className="font-therapique text-3xl sm:text-4xl text-gray-900 mb-3 tracking-tight">
            <SplitTextReveal as="span" text="Guided by" className="font-bold mr-2" />
            <SplitTextReveal as="span" text="Passion," delay={0.06} className="font-normal underline decoration-gray-400 underline-offset-4 mr-2" />
            <SplitTextReveal as="span" text="Driven by" delay={0.12} className="mr-2" />
            <SplitTextReveal as="span" text="Purpose" delay={0.18} className="font-normal underline decoration-gray-400 underline-offset-4" />
          </h2>

          <div className="max-w-2xl mx-auto mb-12">
            <TypewriterParagraph
              delay={0.15}
              wordDelay={0.048}
              text="At Therapique, we pride ourselves on our exceptional client care. Our therapists ensure that the Sofia values are upheld by each of our team members."
              className="text-gray-600 text-sm sm:text-base font-medium"
            />
          </div>

          {/* Staggered Team Cards */}
          <StaggerContainer staggerDelay={0.12} className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member, index) => (
              <StaggerItem key={index}>
                <ProfileCard
                  image={member.image}
                  name={member.name}
                  title={member.title}
                  description={member.description}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </ScrollFadeInOut>

      {/* 4. Who We Are Section with SplitTextReveal Heading, Sequential Typewriter Paragraphs & Image Entrance */}
      <ScrollFadeInOut>
        <section className="bg-[#fdf7f3] py-16 sm:py-24 px-6 border border-[#EADBCE] rounded-3xl">
          <div className="max-w-6xl mx-auto">
            {/* Animated Heading with Underline */}
            <h2 className="font-therapique text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-6 tracking-tight">
              <SplitTextReveal as="span" text="Who" className="mr-2" />
              <SplitTextReveal as="span" text="We Are" delay={0.06} className="font-normal underline decoration-gray-400 underline-offset-4" />
            </h2>

            <div className="max-w-3xl mx-auto mb-14 text-center">
              <TypewriterParagraph
                delay={0.15}
                wordDelay={0.048}
                text="At Therapique, we are more than just a therapy platform — we are a community dedicated to improving mental well-being. We connect individuals with trusted, compassionate therapists who understand their struggles and guide them toward healing and growth."
                className="text-gray-700 text-base sm:text-lg leading-relaxed font-medium"
              />
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
              {/* Left Content (Sequential Paragraphs 1 & 2) */}
              <div className="space-y-6 text-sm sm:text-base leading-relaxed text-gray-800 font-medium">
                <TypewriterParagraph
                  delay={0.2}
                  wordDelay={0.048}
                  text="Mental health should never feel out of reach. That’s why we’ve built Therapique to make therapy sessions easier to access, whether you’re facing depression, stress, or simply looking for emotional support. Our platform bridges the gap between individuals and licensed professionals, giving you a safe space to open up and find support."
                />
                <TypewriterParagraph
                  delay={2.75}
                  wordDelay={0.048}
                  text="With a growing network of expert therapists, we’re creating a future where mental health care is not a privilege, but a right. At Therapique, your journey toward peace of mind and resilience starts here."
                />
              </div>

              {/* Right Image with Dynamic Entrance */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 65, scale: 0.94 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl shadow-xl w-full max-w-md md:max-w-lg border border-[#EADBCE] overflow-hidden transform-gpu"
                >
                  <img
                    src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Therapist supporting client"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeInOut>
    </div>
  )
}

export default About
