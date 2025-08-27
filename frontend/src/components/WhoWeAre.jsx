const WhoWeAre = () => {
  return (
    <section className="bg-[#fdf7f3] py-20 px-6 my-24">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-10">
          Who we are
        </h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
          At <span className="font-semibold text-gray-900">Therapique</span>, 
          we are more than just a therapy platform — we are a community dedicated 
          to improving mental well-being. We connect individuals with trusted, 
          compassionate therapists who understand their struggles and guide 
          them toward healing and growth.
        </p>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <p className="text-gray-700 leading-relaxed">
              Mental health should never feel out of reach. That’s why we’ve 
              built Therapique to make therapy sessions easier to access, whether 
              you’re facing depression, stress, or simply looking for emotional 
              support. Our platform bridges the gap between individuals and 
              licensed professionals, giving you a safe space to open up and 
              find support.
            </p>
            <p className="text-gray-700 leading-relaxed">
              With a growing network of expert therapists, we’re creating a future 
              where mental health care is not a privilege, but a right. At Therapique, 
              your journey toward peace of mind and resilience starts here.
            </p>
          </div>

          {/* Right Image */}
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1603415526960-f7e0328f7d3d?q=80&w=1000"
              alt="Therapist supporting client"
              className="rounded-3xl shadow-lg w-full max-w-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
