const HowWeWork = () => {
    return (
        <section className="py-20 px-6 rounded-t-[40%] mt-20
        bg-gradient-to-b from-violet-400 via-violet-200 via-violet-50 to-background text-text">
            <div className="max-w-5xl mx-auto text-center">
                {/* Heading */}
                <h2 className="text-4xl mt-10 md:text-5xl font-heading font-bold text-gray-900 mb-6">
                    How we work
                </h2>

                {/* Sub-heading */}
                <p className="text-gray-700 font-body text-lg md:text-xl leading-relaxed max-w-4xl mx-auto mb-10">
                    We follow a structured yet flexible approach designed to make collaboration smooth and results-driven.
                    From understanding your vision to delivering the final outcome, our goal is to keep the process
                    clear, transparent, and aligned with your expectations.
                </p>

                {/* Paragraphs */}
                <div className="space-y-6 text-base md:text-lg font-body text-gray-600 leading-relaxed max-w-4xl mx-auto mb-14">
                    <p>
                        Every project begins with an in-depth discovery session where we listen carefully to your
                        ideas, challenges, and goals. By identifying your priorities from the start, we can
                        create a plan that feels tailor-made — not just a generic solution. This ensures
                        that the foundation we build together is solid and focused on what truly matters.
                    </p>
                    <p>
                        Once we move forward, our team works in well-defined stages with consistent check-ins
                        and progress updates. This way, you always have visibility into what’s happening,
                        and you can confidently share feedback along the way. Our structured process
                        balances efficiency with creativity, so the end result not only meets your needs
                        but also exceeds your expectations.
                    </p>
                </div>

                {/* Image */}
                <div className="flex justify-center w-screen relative left-1/2 right-1/2 -mx-[50vw] ">
                    <img
                        src="https://images.unsplash.com/photo-1573496267526-08a69e46a409?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Team discussion"
                        className="rounded-2xl w-full max-w-6xl h-96 object-cover"
                    />
                </div>
            </div>

        </section>
    );
};

export default HowWeWork;
