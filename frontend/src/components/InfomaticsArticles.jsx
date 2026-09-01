import React, { useEffect, useRef } from "react";
import { SplitTextReveal, TypewriterParagraph, FadeUp } from "./ScrollReveal";

const InfomaticArticles = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    let rafId;

    const scrollStep = () => {
      scrollAmount += 0.5; // Slower, smoother scroll
      if (scrollAmount >= scrollContainer.scrollHeight / 2) {
        scrollAmount = 0; // Reset for loop effect
      }
      scrollContainer.scrollTop = scrollAmount;
      rafId = requestAnimationFrame(scrollStep);
    };

    // Use requestAnimationFrame instead of setInterval for smoother 60fps scrolling
    rafId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const cards = [
    {
      title: "Personalized Support for You",
      description:
        "Our team is dedicated to your well-being, offering personalized support that helps you cultivate awareness, balance, and inner peace in your life.",
      imageUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=60",
      altText: "Support",
    },
    {
      title: "Working Together, Empowering You",
      description:
        "We work together with you, empowering you to take an active role in your healing and transformation journey.",
      imageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=100&q=60",
      altText: "Empowerment",
    },
    {
      title: "Mindful Growth",
      description:
        "We provide guidance that helps you navigate challenges, build resilience, and grow through self-discovery.",
      imageUrl:
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=100&q=60",
      altText: "Growth",
    },
  ];

  return (
    <section className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 max-w-7xl mx-auto min-h-[60vh] md:min-h-[80vh] py-12 md:py-0 px-4 sm:px-6">
      {/* Left Side (Text) */}
      <div className="w-full md:w-1/2 pr-0 md:pr-10 text-center md:text-left">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-gray-900 leading-snug">
          <SplitTextReveal text="We're here to help you find" as="span" className="inline" />{' '}
          <span className="italic">
            <SplitTextReveal text="balance" delay={0.25} as="span" className="inline" />
          </span>{' '}
          <SplitTextReveal text="and" delay={0.3} as="span" className="inline" />{' '}
          <span className="italic">
            <SplitTextReveal text="strength." delay={0.35} as="span" className="inline" />
          </span>
        </h2>
        <div className="mt-4 md:mt-6 max-w-lg mx-auto md:mx-0">
          <TypewriterParagraph
            delay={0.2}
            wordDelay={0.048}
            text="Our team of trained psychotherapists are equipped to work with most of life's challenges and transitions."
            className="text-base md:text-lg text-gray-600 font-sans leading-relaxed"
          />
        </div>
      </div>

      {/* Right Side (Scrolling Cards) */}
      <div className="w-full md:w-1/2 overflow-hidden h-[380px] md:h-[450px] relative">
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

export default InfomaticArticles;


const ScrollingCard = React.memo(({ title, description, imageUrl, altText }) => {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 flex items-start space-x-4 shadow-sm border border-gray-100">
      <div className="flex-1">
        <h3 className="text-lg md:text-2xl font-serif text-gray-800">{title}</h3>
        <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-600">{description}</p>
      </div>
      <img
        src={imageUrl}
        alt={altText}
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=100&q=60';
        }}
        className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
      />
    </div>
  );
});