const WhoWeAre = () => {
  return (
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
  );
};

export default WhoWeAre;
