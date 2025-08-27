// TherapySection.jsx
import React, { useEffect, useRef } from "react";
import ScrollingCard from "./ScrollingCard";

const TherapySection = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;

    const scrollStep = () => {
      if (scrollContainer) {
        scrollAmount += 1;
        if (scrollAmount >= scrollContainer.scrollHeight / 2) {
          scrollAmount = 0; // Reset for loop effect
        }
        scrollContainer.scrollTop = scrollAmount;
      }
    };

    const interval = setInterval(scrollStep, 40);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Personalized Support for You",
      description:
        "Our team is dedicated to your well-being, offering personalized support that helps you cultivate awareness, balance, and inner peace in your life.",
      imageUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      altText: "Support",
    },
    {
      title: "Working Together, Empowering You",
      description:
        "We work together with you, empowering you to take an active role in your healing and transformation journey.",
      imageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=100",
      altText: "Empowerment",
    },
    {
      title: "Mindful Growth",
      description:
        "We provide guidance that helps you navigate challenges, build resilience, and grow through self-discovery.",
      imageUrl:
        "https://images.unsplash.com/photo-1493244040629-496f6d136cc3?w=100",
      altText: "Growth",
    },
  ];

  return (
    <section className="flex justify-center items-center min-h-screen bg-[#fdf9f6] px-12">
      {/* Left Side (Static Text) */}
      <div className="w-1/2 pr-10">
        <h2 className="text-5xl font-serif font-medium text-gray-900 leading-snug">
          We're here to help <br />
          you find <span className="italic">balance</span> <br /> and{" "}
          <span className="italic">strength.</span>
        </h2>
        <p className="mt-6 text-lg text-gray-600 font-sans">
          Our team of trained psychotherapists are equipped to work with most of
          life’s challenges and transitions.
        </p>
      </div>

      {/* Right Side (Scrolling Cards) */}
      <div className="w-1/2 overflow-hidden h-[450px] relative">
        <div
          ref={scrollRef}
          className="overflow-y-hidden h-full space-y-6 pb-12"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          }}
        >
          {cards.concat(cards).map((card, idx) => (
            <ScrollingCard key={idx} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TherapySection;
