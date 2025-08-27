// ScrollingCard.jsx
import React from "react";

const ScrollingCard = ({ title, description, imageUrl, altText }) => {
  return (
    <div className="bg-white rounded-2xl p-6 flex items-start space-x-4">
      <div>
        <h3 className="text-2xl font-serif text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
      <img
        src={imageUrl}
        alt={altText}
        className="w-20 h-20 rounded-lg object-cover"
      />
    </div>
  );
};

export default ScrollingCard;
