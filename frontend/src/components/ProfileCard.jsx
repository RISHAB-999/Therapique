import { ArrowRight } from "lucide-react";

const ProfileCard = ({ image, name, title, description }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden w-96 font-sans group transition-transform duration-300">
      {/* Profile Image */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button className="absolute top-4 right-4 bg-secondary rounded-full p-4  group-hover:bg-peach group-hover:opacity-08 transition duration-300">
          <ArrowRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Info */}
      <div className="-mt-6 relative z-10 bg-white rounded-t-2xl p-6 text-center group-hover:bg-peach transition duration-300">
        <h3 className="text-3xl font-serif font-medium tracking-wide text-gray-800 max-w-[220px] mx-auto break-words">
          {name}
        </h3>

        <p className="text-xl py-2 font-serif font-medium text-gray-700">{title}</p>
        <p className="text-lg tracking-wide text-gray-600">{description}</p>
      </div>
    </div>


  );
};

export default ProfileCard;
