import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";
import { useNavigate } from 'react-router-dom'


const counselors = [
  {
    name: "Dr. V S Ananthakrishnan",
    degree: "MBBS, MD (Psychiatry)",
    image: assets.founder1,
  },
  {
    name: "Dr. Anjali Sharma",
    degree: "PhD, Clinical Psychologist",
    image: assets.founder1,
  },
  {
    name: "Dr. Meera Nair",
    degree: "MPhil, Psychotherapy",
    image: assets.founder1,
  },
  {
    name: "Dr. Arjun Patel",
    degree: "MD, Psychiatry",
    image: assets.founder1,
  },
];

const CounselorsSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % counselors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate()


  return (
    <section className="py-12 text-center min-h-[70vh] mt-12">
      {/* Title */}
      <h2 className="text-5xl font-bold text-text font-display">
        Choose Help. Not Suffering.
      </h2>
      <div className="w-16 h-1 bg-peach mx-auto my-4 rounded"></div>

      <div className="flex flex-col md:flex-row items-center justify-center mt-8 gap-20">
        {/* Image Slider */}
        <div className="relative w-[500px] h-[350px] flex items-center justify-center overflow-hidden">
          {counselors.map((c, i) => {
            const position = (i - index + counselors.length) % counselors.length;

            // Default values (hidden)
            let x = 0;
            let scale = 0.8;
            let opacity = 0;
            let zIndex = 0;

            if (position === 0) {
              // Center
              x = 0;
              scale = 1.1;
              opacity = 1;
              zIndex = 10;
            } else if (position === 1) {
              // Right
              x = 180;
              scale = 0.9;
              opacity = 0.8;
              zIndex = 5;
            } else if (position === counselors.length - 1) {
              // Left
              x = -180;
              scale = 0.9;
              opacity = 0.8;
              zIndex = 5;
            } else {
              // Hidden
              x = -400;
              opacity = 0;
            }

            return (
              <motion.div
                key={i}
                className="absolute flex flex-col items-center"
                animate={{ x, scale, opacity, zIndex }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className={`object-cover rounded-2xl shadow-md transition-all ${position === 0 ? "w-44 h-56" : "w-32 h-44"
                    }`}
                />
                {position === 0 && (
                  <div className="mt-6 text-center">
                    <h3 className="font-semibold text-lg text-text">
                      {c.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{c.degree}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="max-w-xl text-left">
          <h3 className="text-3xl font-bold text-text mb-7">
            Counselling Therapy Sessions With Licensed & Verified Experts
          </h3>
          <p className="text-gray-600 text-lg mb-6">
            Highly qualified team of some of the best names in psychology who
            deliver improved well-being to you. Carefully vetted through a
            rigorous selection process. Trained and experienced in all
            psychotherapy techniques.
          </p>

          {/* Features */}
          <div className="flex items-center gap-10 mb-6 text-orange-500">
            <div className="text-center text-4xl">
              🎥
              <p className="text-lg font-medium text-gray-700">Video Session</p>
            </div>
            <div className="text-center text-4xl">
              🎤
              <p className="text-lg font-medium text-gray-700">Audio Session</p>
            </div>
            <div className="text-center text-4xl">
              💬
              <p className="text-lg font-medium text-gray-700">Chat Session</p>
            </div>
          </div>

          {/* More Info */}
          <ul className="space-y-2 text-text font-semibold text-lg">
            <li>English And All Regional Indian Languages</li>
            <li>100% Private & Secure Platform</li>
            <li>24/7 Support</li>
          </ul>

          {/* Button */}
          <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className="mt-6 bg-black text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 transition">
            View All Counselors
          </button>
        </div>
      </div>
    </section>
  );
};

export default CounselorsSection;
