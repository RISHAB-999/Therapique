const DoctorDescription = () => {
  return (
    <section className="py-16 px-4 text-center font-sans">
      {/* Subtitle */}
      <p className="text-gray-600 text-sm mb-4">
        CRPO Registered Psychotherapist
      </p>

      {/* Name + Title */}
      <h1 className="text-5xl md:text-6xl font-serif text-gray-900 font-normal">
        Magdalena Karakehayova
        <h3 className="ml-2 text-2xl py-2 font-serif font-normal text-gray-900">
          M.Sc, RP
        </h3>
      </h1>

      {/* Description */}
      <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
        Hey there! I'm Magdalena, but people also call me Maggie. Picture me as
        your personal guide, here to help you navigate life's twists and turns
        with clarity, resilience, and a sprinkle of humor along the way.
      </p>

      {/* Button */}
      <div className="mt-8">
        <button className="px-8 py-3 rounded-full bg-[#1c1917] text-white font-semibold text-sm hover:bg-gray-800 transition duration-300">
          Book a consultation
        </button>
      </div>
    </section>
  );
};

export default DoctorDescription;
