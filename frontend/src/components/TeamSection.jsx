import ProfileCard from "./ProfileCard";

const TeamSection = () => {
  const teamMembers = [
    {
      image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=2000",
      name: "Magdalena Karakehayova",
      title: "M.Sc., RP",
      description: "Founder & Clinical Director",
    },
    {
      image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=2000",
      name: "Monika Georgieva",
      title: "M.Sc., RP",
      description: "Founder & Clinical Director",
    },
  ];

  return (
    <section className="pt-10 px-6 text-center">
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
        Guided by <span className="italic">passion</span>, Driven by{" "}
        <span className="italic">purpose</span>
      </h2>
      <p className="max-w-2xl mx-auto text-gray-600 mb-12">
        At Sofia, we pride ourselves on our exceptional client care. Our therapists ensure that the Sofia values are upheld by each of our team members.
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
  );
};

export default TeamSection;
