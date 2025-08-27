import React from 'react'

const FeaturedInSection = () => {
  return (
    <div className="text-center my-24">
      <p className="text-gray-500 mb-10 text-lg uppercase tracking-widest">
        We’re Featured Across Multiple Directories
      </p>

      <div className="flex justify-center gap-14 flex-wrap">
        <span className="text-3xl font-bold font-serif text-gray-800">
          Psychology Today
        </span>
        <span className="text-3xl font-bold font-serif text-gray-800">
          TherapyTribe
        </span>
        <span className="text-3xl font-bold font-serif text-gray-800">
          GoodTherapy
        </span>
        <span className="text-3xl font-bold font-serif text-gray-800">
          Theravive
        </span>
      </div>
    </div>
  )
}

export default FeaturedInSection
