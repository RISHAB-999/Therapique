import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, HeartHandshake, UserCheck } from 'lucide-react';

const BlogAppointmentCta = () => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(path);
    };

    return (
        <section className="pt-4 pb-16">
            <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#20172B] via-[#2A1D3B] to-[#171022] text-white p-8 sm:p-12 lg:p-16 border border-purple-900/40 shadow-xl">
                {/* Decorative subtle background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-purple-200 mb-4">
                        <HeartHandshake className="w-3.5 h-3.5 text-rose-300" />
                        <span>Personalized Mental Healthcare</span>
                    </div>

                    <h2 className="font-therapique text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                        Looking for Personalized Support on Your Healing Journey?
                    </h2>

                    <p className="mt-4 text-xs sm:text-base text-gray-300 leading-relaxed max-w-2xl font-sans">
                        Reading and self-reflection are powerful first steps. When you feel ready for deeper, confidential guidance, our team of licensed clinical psychologists, CBT practitioners, and trauma counselors are here to support you.
                    </p>

                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 my-6 text-xs text-gray-300">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            100% Confidential & Secure
                        </span>
                        <span className="flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-purple-300" />
                            Accredited Psychotherapists
                        </span>
                        <span className="flex items-center gap-1.5">
                            <HeartHandshake className="w-4 h-4 text-rose-300" />
                            Evidence-Informed Care
                        </span>
                    </div>

                    {/* CTA Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => handleNavigate('/doctors')}
                            className="px-6 sm:px-8 py-3 rounded-full bg-white text-gray-950 font-bold text-xs sm:text-sm hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-2"
                        >
                            <span>Find a Therapist</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavigate('/about')}
                            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all border border-white/20 cursor-pointer"
                        >
                            Learn About Therapique
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default React.memo(BlogAppointmentCta);
