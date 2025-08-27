import React from "react";
import {assets} from "../assets/assets";
import { Star } from "lucide-react";

export default function TherapyLanding() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6 items-center">
        
        {/* Left Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-snug">
            Empowering change <br />
            through personalized <br />
            therapy and <span className="inline-flex gap-1">
              <span className="text-pink-400">✿</span>
              <span className="text-orange-400">✿</span>
              <span className="text-blue-400">✿</span>
            </span>{" "}
            counseling
          </h1>

          <p className="text-gray-600 text-lg">
            Find the resources you need to face your current challenges with our
            expert team of licensed therapists and counselors in Ontario and
            throughout Canada.
          </p>

          <button className="bg-black text-white px-6 py-3 rounded-full shadow-md hover:bg-gray-800 transition">
            Book a FREE consultation →
          </button>

          {/* Therapy Types */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-lg mt-6">
            <a href="#" className="text-gray-800 hover:text-black">
              Individual Therapy →
            </a>
            <a href="#" className="text-gray-800 hover:text-black">
              Family Therapy →
            </a>
            <a href="#" className="text-gray-800 hover:text-black">
              Couple Therapy →
            </a>
            <a href="#" className="text-gray-800 hover:text-black">
              Adolescent Therapy →
            </a>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative w-[800px] mx-auto">
          {/* Main Image */}
          <img
            src={assets.home}
            alt="Smiling person"
            className="rounded-3xl shadow-lg"
          />

          {/* Floating Tags */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <span className="px-3 py-1 bg-pink-200 rounded-full text-sm font-medium">
              Exploration
            </span>
            <span className="px-3 py-1 bg-green-200 rounded-full text-sm font-medium">
              Support
            </span>
            <span className="px-3 py-1 bg-yellow-200 rounded-full text-sm font-medium">
              Growth
            </span>
            <span className="px-3 py-1 bg-indigo-200 rounded-full text-sm font-medium">
              Healing
            </span>
          </div>

          {/* Rating Card */}
          <div className="absolute bottom-[-30px] right-6 bg-white rounded-2xl shadow-xl p-4 w-56">
            <div className="flex items-center gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="gold" stroke="gold" />
              ))}
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">200+</p>
            <p className="text-gray-500 text-sm">
              Satisfied Clients over the past 3 years
            </p>
            <div className="flex items-center gap-2 mt-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/0a/Psychology_Today_logo.svg"
                alt="Verified by Psychology Today"
                className="h-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
