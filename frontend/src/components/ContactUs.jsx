export default function ContactUs() {
    return (
        <div className="flex justify-center items-center py-10 px-6 bg-[#fdfaf7]">
            <div className="w-full max-w-6xl rounded-3xl bg-gradient-to-b from-[#bce6f9] to-[#ffffff] p-10 flex flex-col md:flex-row gap-10">

                {/* Left Section */}
                <div className="flex-1">
                    <h2 className="text-4xl font-bold text-gray-900 leading-snug">
                        Need some more information? <br /> We’d love to hear from you!
                    </h2>
                    <p className="text-gray-600 mt-4">
                        We’re ready to help. Just provide your details in the form, and we’ll get back
                        to you as soon as possible with the answers that you need.
                    </p>

                    {/* Call Us Box */}
                    <div className="mt-8 flex items-center gap-4 rounded-2xl border-2 border-gray-800 bg-white shadow-md px-6 py-4 w-fit">
                        {/* Phone Icon */}
                        <div className="flex items-center justify-center bg-gradient-to-tr from-[#dfeaff] to-[#ffffff] p-4 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="black"
                                className="w-8 h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25
                  2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 
                  1.125 0 00-1.173.417l-.97 1.293a.75.75 
                  0 01-1.21-.09 12.035 12.035 
                  0 01-2.37-4.548.75.75 
                  0 01.45-.937l1.482-.555a1.125 
                  1.125 0 00.72-1.062V4.5A2.25 
                  2.25 0 0012.75 2.25H11.25C6.142 
                  2.25 2.25 6.142 2.25 11.25v-.75z"
                                />
                            </svg>
                        </div>

                        {/* Text */}
                        <div>
                            <p className="font-semibold text-lg">Call us</p>
                            <p className="text-gray-600">+91 8920800490</p>
                        </div>

                        {/* Button */}
                        <button className="ml-auto flex items-center gap-2 border border-black px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="black"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 6.75c0 8.284 6.716 15 
                  15 15h1.5a2.25 2.25 0 
                  002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 
                  1.125 0 00-1.173.417l-.97 1.293a.75.75 
                  0 01-1.21-.09 12.035 12.035 
                  0 01-2.37-4.548.75.75 
                  0 01.45-.937l1.482-.555a1.125 
                  1.125 0 00.72-1.062V4.5A2.25 
                  2.25 0 0012.75 2.25H11.25C6.142 
                  2.25 2.25 6.142 2.25 11.25v-.75z"
                                />
                            </svg>
                            Make a call
                        </button>
                    </div>
                </div>

                {/* Right Section (Form) */}
                <div className="flex-1">
                    <form className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="First Name"
                                className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div className="flex gap-4">
                            <input
                                type="email"
                                placeholder="Email"
                                className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                                type="tel"
                                placeholder="123–456–7890"
                                className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <textarea
                            placeholder="Details you would like to share"
                            rows="4"
                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                        ></textarea>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
