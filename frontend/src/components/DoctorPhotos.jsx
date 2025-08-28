import { motion } from "framer-motion";

const DoctorPhotos = () => {
  return (
    <section className="bg-[#faf7f3] flex flex-col items-center py-20 overflow-hidden">
      {/* Single Image Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="w-full flex justify-center"
      >
        
      </motion.div>

      {/* Triple Images Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-20 flex flex-col sm:flex-row gap-6 sm:gap-10 justify-center items-center"
      >
        <motion.img
          src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=1044&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Doctor laughing"
          className="rounded-2xl w-64 sm:w-72 object-cover shadow-md rotate-[-12deg]"
          whileHover={{ scale: 1.05 }}
        />
        <motion.img
          src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=1044&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Doctor smiling"
          className="rounded-2xl w-64 sm:w-72 object-cover shadow-md"
          whileHover={{ scale: 1.05 }}
        />
        <motion.img
          src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=1044&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Doctor portrait"
          className="rounded-2xl w-64 sm:w-72 object-cover shadow-md rotate-[12deg]"
          whileHover={{ scale: 1.05 }}
        />
      </motion.div>
    </section>
  );
};

export default DoctorPhotos;
