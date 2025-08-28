const HeroSection = () => {
  return (
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
      <button className="group inline-flex items-center gap-6 px-5 py-2 bg-background text-text rounded-full border border-text transition hover:bg-black hover:text-white">
        <span className="text-base font-medium">Learn more about our team</span>
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white transition group-hover:bg-white group-hover:text-black">
          →
        </span>
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
  );
}

export default HeroSection;