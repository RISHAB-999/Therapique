const Footer = () => {
  return (
    <div className="bg-[#856C5B] text-gray-300 md:mx-0">
      <div className="max-w-6xl mx-auto flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 px-6 py-16">
        
        {/* -------- Left Section -------- */}
        <div>
          {/* <img className="mb-5 w-40 brightness-0 invert" src={assets.logo} alt="Therapique Logo" /> */}
          <h3 className="text-2xl font-bold text-white pb-5">Therapique</h3>
          <p className="w-full md:w-3/4 leading-6 text-gray-200 text-sm">
            <span className="font-semibold text-white">Therapique</span> is your safe space 
            to find support when life feels heavy. We connect you with trusted therapists online, 
            making mental health care accessible, private, and easy to fit into your day.  
            Because caring for your mind should feel as natural as catching up with a friend.
          </p>
        </div>

        {/* -------- Center Section -------- */}
        <div>
          <p className="text-lg font-semibold text-white mb-5">Company</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Contact Us</li>
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* -------- Right Section -------- */}
        <div>
          <p className="text-lg font-semibold text-white mb-5">Get in Touch</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="hover:text-white cursor-pointer">+91 8920800490</li>
            <li className="hover:text-white cursor-pointer">hello@therapique.com</li>
          </ul>
        </div>
      </div>

      {/* -------- Bottom Bar -------- */}
      <div className="border-t">
        <p className="py-5 text-sm text-center text-white">
          © {new Date().getFullYear()} Therapique — All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default Footer
