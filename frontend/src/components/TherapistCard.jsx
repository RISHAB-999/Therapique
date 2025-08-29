import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const TherapistCard = ({ _id, image, name, speciality }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/appointment/${_id}`);
    window.scrollTo({ top: 0, behavior: "smooth" }); // 👈 scroll reset
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden font-sans group cursor-pointer transition-all duration-300 hover:-translate-y-2"
    >
      {/* Profile Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Button */}
        <button className="absolute top-4 right-4 bg-secondary rounded-full p-3 opacity-0 group-hover:opacity-100 group-hover:bg-peach transition-all duration-300">
          <ArrowRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Info */}
      <div className="relative z-10 bg-white p-6 text-center group-hover:bg-peach/40 transition-colors duration-300">
        <h3 className="text-xl font-serif font-medium text-gray-800 group-hover:text-gray-900">
          {name}
        </h3>

        <p className="text-md py-2 font-serif font-medium text-gray-700">
          {speciality}
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-green-500 mt-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Available</span>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;
