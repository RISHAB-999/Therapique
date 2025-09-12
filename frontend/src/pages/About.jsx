import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom"
import ProfileCard from '../components/ProfileCard'
import { teamMembers } from '../data'

const About = () => {
  const navigate = useNavigate()
  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#fdf7f3] py-20 px-6 text-center">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          About Therapique
        </h1>

        {/* Beautiful Statement */}
        <p className="text-gray-700 max-w-2xl mx-auto text-lg mb-6 leading-relaxed">
          At <span className="font-semibold text-gray-900">Therapique</span>, we
          are committed to helping individuals overcome the weight of depression
          and mental health struggles by making therapy accessible and personal.
          Our mission is to connect people with compassionate, licensed
          professionals who can guide them toward healing, resilience, and
          lasting well-being.
        </p>

        {/* CTA Button */}
        <button onClick={() => { navigate('/contact') }} className="group  px-5 py-2 bg-background text-text rounded-full border border-text transition hover:bg-black hover:text-white">
          <span className='inline-flex items-center gap-6'><span className="text-base font-medium">Learn more about our team</span>
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white transition group-hover:bg-white group-hover:text-black">
              →
            </span></span>
        </button>


        {/* Hero Image */}
        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-8xl aspect-[21/7]">
            <img
              src="https://images.unsplash.com/photo-1499728603263-13726abce5fd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Therapist and client"
              className="rounded-3xl shadow-lg w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      <section className="bg-[#fdf7f3] py-20 px-6 text-center">
        <blockquote className="max-w-3xl mx-auto relative">
          <p className="text-2xl md:text-3xl italic text-gray-800 leading-relaxed">
            <span className="absolute -left-6 top-0 text-4xl text-gray-400">“</span>
            Our mission at <span className="font-semibold text-gray-900">Therapique </span>
            is to empower individuals to rise above depression, anxiety, and
            emotional challenges by making therapy accessible, personal,
            and stigma-free. We believe that healing begins when connection
            becomes easy.
            <span className="absolute -right-6 bottom-0 text-4xl text-gray-400">”</span>
          </p>
        </blockquote>
      </section>

      {/* Founders */}

      <section className="pt-10 px-6 text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
          Guided by <span className="italic">passion</span>, Driven by{" "}
          <span className="italic">purpose</span>
        </h2>
        <p className="max-w-2xl mx-auto text-gray-600 mb-12">
          At Therapique, we pride ourselves on our exceptional client care. Our therapists ensure that the Sofia values are upheld by each of our team members.
        </p>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member, index) => (
            <ProfileCard
              key={index}
              image={member.image}
              name={member.name}
              title={member.title}
              description={member.description}
            />
          ))}
        </div>
      </section>

      {/* Who We Are Section */}

      <section className="bg-[#fdf7f3] py-24 px-6 my-24 font-body">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-center text-gray-900 mb-8 tracking-tight">
            Who we are
          </h2>

          <p className="text-gray-700 text-lg text-center max-w-3xl mx-auto mb-16 leading-relaxed">
            At <span className="font-semibold text-gray-900 font-heading">Therapique</span>,
            we are more than just a therapy platform — we are a community dedicated
            to improving mental well-being. We connect individuals with trusted,
            compassionate therapists who understand their struggles and guide
            them toward healing and growth.
          </p>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-7 text-lg leading-relaxed text-gray-800">
              <p>
                Mental health should never feel out of reach. That’s why we’ve
                built Therapique to make therapy sessions easier to access, whether
                you’re facing depression, stress, or simply looking for emotional
                support. Our platform bridges the gap between individuals and
                licensed professionals, giving you a safe space to open up and
                find support.
              </p>
              <p>
                With a growing network of expert therapists, we’re creating a future
                where mental health care is not a privilege, but a right. At
                <span className="font-heading font-medium"> Therapique</span>,
                your journey toward peace of mind and resilience starts here.
              </p>
            </div>

            {/* Right Image */}
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Therapist supporting client"
                className="rounded-3xl shadow-xl w-full max-w-md md:max-w-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
