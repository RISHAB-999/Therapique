import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import TherapistCard from "./TherapistCard";

const RelatedDoctors = ({ speciality, docId }) => {
    const { doctors } = useContext(AppContext);
    const navigate = useNavigate();
    const [relDoc, setRelDocs] = useState([]);

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter(
                (doc) => doc.speciality === speciality && doc._id !== docId
            );
            setRelDocs(doctorsData);
        }
    }, [doctors, speciality, docId]);

    // ✅ Only render if there are at least 2 related doctors
    if (relDoc.length < 2) return null;

    return (
        <div className="flex flex-col items-center gap-4 mb-16 text-gray-900 md:mx-10">
            <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
            <p className="sm:w-1/3 text-center text-sm">
                Simply browse through our extensive list of trusted doctors.
            </p>

            {/* ✅ Same grid style as Doctors Page */}
            <div className="w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6 pt-10 px-3 sm:px-0">
                {relDoc.slice(0, 3).map((item, index) => (
                    <TherapistCard
                        key={index}
                        _id={item._id}
                        image={item.image}
                        name={item.name}
                        speciality={item.speciality}
                    />
                ))}
            </div>

            {relDoc.length > 3 && (
                <button
                    onClick={() => {
                        navigate("/doctors");
                        scrollTo(0, 0);
                    }}
                    className="bg-light text-gray-600 px-12 py-3 rounded-full mt-10"
                >
                    more
                </button>
            )}
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='bg-peach/30 text-gray-600 px-12 py-3 rounded-full mt-10'>more</button>
        </div>
    );
};

export default RelatedDoctors;



