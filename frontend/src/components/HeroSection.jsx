const HeroSection = () => {
  return (
    <section className="bg-[#fdf7f3] py-16 px-6 text-center">
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
      <button className="px-6 py-3 bg-black text-white rounded-full shadow-md hover:bg-gray-800 transition">
        Learn more about our team →
      </button>

      {/* Hero Image */}
      <div className="mt-10 flex justify-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/0a/Psychology_Today_logo.svg"
          alt="Therapist and client"
          className="rounded-3xl shadow-lg w-full max-w-3xl"
        />
      </div>
    </section>
  );
}

export default HeroSection;