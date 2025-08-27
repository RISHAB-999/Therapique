const MissionStatement = () => {
  return (
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
  );
}

export default MissionStatement;