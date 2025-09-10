import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom"; // ✅ Import Link
import { assets } from "../assets/assets";

const therapies = [
  {
    title: "Individual Therapy",
    image: assets.founder2,
  },
  {
    title: "Couples Therapy",
    image: assets.founder2,
  },
  {
    title: "Teen Therapy",
    image: assets.founder2,
  },
  {
    title: "Psychiatric Therapy",
    image: assets.founder2,
  },
];

const TherapyCategories = () => {
  return (
    <section className="w-full py-16 px-6 md:px-16">
      <div className="max-w-7xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-display text-gray-800">
          discover the right <br />
          <span className="font-bold font-display">
            support for your journey
          </span>
        </h2>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {therapies.map((therapy, index) => {
            // Split the title safely
            const words = therapy.title.split(" ");
            const firstWord = words[0] || "";
            const secondWord = words[1] || "";

            return (
              <div key={index} className="flex flex-col items-center">
                <Link to={`/doctors/${therapy.title.toLowerCase().replace(" ", "-")}`}>
                  <div className="w-full h-[380px] overflow-hidden">
                    <img
                      src={therapy.image}
                      alt={therapy.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center mt-4 justify-between w-full px-2">
                    <p className="text-xl font-medium text-gray-800 font-display">
                      {firstWord}{" "}
                      <span className="italic font-display">{secondWord}</span>
                    </p>
                    <span className="p-2 rounded-full border border-gray-300">
                      <ArrowUpRight className="size-6 text-gray-700" />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TherapyCategories;
