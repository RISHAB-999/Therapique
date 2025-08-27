import { ArrowRight } from "lucide-react";

const ProfileCard = ({ image, name, title }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl overflow-hidden w-72 font-sans">
      {/* Profile Image */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-80 object-cover"
        />
        <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition">
          <ArrowRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 text-center">
        <h3 className="text-xl font-semibold tracking-wide text-gray-800">
          {name}
        </h3>
        <p className="text-base font-medium text-gray-600">
          {title}
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;
