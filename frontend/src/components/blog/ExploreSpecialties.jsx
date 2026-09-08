import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { ShopContext } from '../../context/ShopContext';
import { specialtyGuide, getArticlesBySpecialty } from '../../data/blogData';
import { 
    Sparkles, 
    ArrowRight, 
    BookOpen, 
    UserCheck, 
    Calendar, 
    X, 
    ChevronRight, 
    CheckCircle2, 
    GraduationCap, 
    Clock,
    ArrowUpRight
} from 'lucide-react';

const ExploreSpecialties = ({ 
    onSelectArticle,
    activeSpecialty: controlledActiveSpecialty,
    setActiveSpecialty: controlledSetActiveSpecialty
}) => {
    const navigate = useNavigate();
    const { doctors } = useContext(AppContext);
    const { books } = useContext(ShopContext);

    const [internalActiveSpecialty, setInternalActiveSpecialty] = useState(null);
    const activeSpecialty = controlledActiveSpecialty !== undefined ? controlledActiveSpecialty : internalActiveSpecialty;
    const setActiveSpecialty = controlledSetActiveSpecialty || setInternalActiveSpecialty;

    // Map doctor counts per specialty
    const doctorCounts = useMemo(() => {
        const counts = {};
        if (Array.isArray(doctors)) {
            doctors.forEach(doc => {
                if (doc.speciality) {
                    counts[doc.speciality] = (counts[doc.speciality] || 0) + 1;
                }
            });
        }
        return counts;
    }, [doctors]);

    // When a specialty is open, find matching doctors and real library books
    const activeSpecialtyDetails = useMemo(() => {
        if (!activeSpecialty) return null;

        const specDoctors = Array.isArray(doctors) 
            ? doctors.filter(d => d.speciality === activeSpecialty.speciality).slice(0, 3)
            : [];

        const specArticles = getArticlesBySpecialty(activeSpecialty.speciality);

        const specBooks = Array.isArray(books)
            ? books.filter(b => b.category && b.category.toLowerCase() === activeSpecialty.libraryCategory.toLowerCase()).slice(0, 2)
            : [];

        return {
            doctors: specDoctors,
            articles: specArticles,
            books: specBooks
        };
    }, [activeSpecialty, doctors, books]);

    const handleNavigateDoctors = (specialityName) => {
        setActiveSpecialty(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/doctors/${encodeURIComponent(specialityName)}`);
    };

    const handleNavigateAppointment = (docId) => {
        setActiveSpecialty(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/appointment/${docId}`);
    };

    const handleNavigateBook = (category, bookId) => {
        setActiveSpecialty(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (bookId) {
            navigate(`/Shop/${encodeURIComponent(category)}/${bookId}`);
        } else {
            navigate(`/Shop/${encodeURIComponent(category)}`);
        }
    };

    return (
        <section className="pt-12 sm:pt-16 pb-14 border-t border-[#EADBCE]">
            {/* Section Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/80 text-purple-900 border border-purple-200 text-xs font-bold uppercase tracking-wider mb-2">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Educational Directory</span>
                    </div>
                    <h2 className="font-therapique text-2xl sm:text-3xl md:text-4xl font-bold text-gray-950 tracking-tight">
                        Explore by <span className="font-normal underline decoration-gray-400 underline-offset-4">Specialty</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mt-2 font-medium leading-relaxed">
                        Understand the scope and focus of each psychotherapeutic discipline at Therapique to find the approach that best resonates with your journey.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        navigate('/doctors');
                    }}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900 hover:text-purple-700 transition-colors shrink-0"
                >
                    <span>View All Therapists Directory</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* 8 Specialties Grid */}
            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
                {specialtyGuide.map((spec, idx) => {
                    const articleCount = getArticlesBySpecialty(spec.speciality).length;
                    const docCount = doctorCounts[spec.speciality] || 0;

                    return (
                        <div
                            key={spec.id}
                            onClick={() => setActiveSpecialty(spec)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveSpecialty(spec); }}
                            className="group bg-white rounded-3xl p-5 border border-[#EADBCE] shadow-md sm:shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 hover:-translate-y-1 sticky top-20 sm:static sm:top-auto"
                            style={{
                                top: `${74 + (idx % 8) * 8}px`
                            }}
                            aria-label={`Learn about ${spec.shortTitle}`}
                        >
                            <div>
                                {/* Specialty Icon / Photo */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#FAF5EE] border border-[#EADBCE] p-1 shadow-2xs group-hover:scale-105 transition-transform">
                                        <img
                                            src={spec.image}
                                            alt={spec.speciality}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#FAF5EE] group-hover:bg-black group-hover:text-white flex items-center justify-center text-gray-700 transition-colors shadow-2xs">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Specialty Title & Tagline */}
                                <h3 className="font-therapique text-base sm:text-lg font-bold text-gray-950 leading-snug group-hover:text-purple-900 transition-colors mb-1.5">
                                    {spec.shortTitle}
                                </h3>
                                <p className="text-xs text-gray-600 font-sans leading-relaxed line-clamp-3">
                                    {spec.tagline}
                                </p>
                            </div>

                            {/* Card Footer: Metadata indicators */}
                            <div className="pt-4 mt-4 border-t border-[#F3E8DE] flex items-center justify-between text-[11px] font-semibold text-gray-500">
                                <span className="flex items-center gap-1 text-purple-800">
                                    <BookOpen className="w-3 h-3" />
                                    {articleCount} {articleCount === 1 ? 'Article' : 'Articles'}
                                </span>
                                {docCount > 0 && (
                                    <span className="flex items-center gap-1 text-emerald-800 font-bold">
                                        <UserCheck className="w-3 h-3" />
                                        {docCount} {docCount === 1 ? 'Therapist' : 'Therapists'}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ========================================================================= */}
            {/* Dedicated Specialty Learning Modal (LEARN → SPECIALIST → BOOK → APPOINT) */}
            {/* ========================================================================= */}
            {activeSpecialty && activeSpecialtyDetails && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity overflow-y-auto"
                    onClick={() => setActiveSpecialty(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="specialty-modal-title"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-3xl max-h-[92vh] bg-[#FDF7F3] rounded-3xl border border-[#EADBCE] shadow-2xl flex flex-col overflow-hidden my-auto"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(30, 17, 56, 0.25)'
                        }}
                    >
                        {/* Top Sticky Bar */}
                        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#FDF7F3]/95 backdrop-blur-md border-b border-[#EADBCE]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-[#EADBCE]">
                                    <img
                                        src={activeSpecialty.image}
                                        alt={activeSpecialty.speciality}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                                        Therapique Specialty Guide
                                    </span>
                                    <h2 id="specialty-modal-title" className="font-therapique text-lg sm:text-xl font-bold text-gray-950 leading-tight">
                                        {activeSpecialty.shortTitle}
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveSpecialty(null)}
                                className="p-2 rounded-full text-gray-600 hover:text-black hover:bg-[#F3E8DE] transition-colors cursor-pointer"
                                aria-label="Close specialty guide"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Scrollable Content */}
                        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
                            
                            {/* Overview Box */}
                            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EADBCE] shadow-xs">
                                <h3 className="font-therapique text-base sm:text-lg font-bold text-gray-950 mb-2">
                                    What Is {activeSpecialty.shortTitle}?
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                                    {activeSpecialty.overview}
                                </p>
                            </div>

                            {/* Two-Column Detail: Common Concerns & What to Expect */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#FAF5EE] rounded-2xl p-5 border border-[#EADBCE]">
                                    <h4 className="font-therapique text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        Common Areas of Focus
                                    </h4>
                                    <ul className="space-y-2 text-xs text-gray-700">
                                        {activeSpecialty.commonConcerns.map((concern, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                                <span>{concern}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-[#FAF5EE] rounded-2xl p-5 border border-[#EADBCE]">
                                    <h4 className="font-therapique text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-700" />
                                        What Sessions Look Like
                                    </h4>
                                    <p className="text-xs text-gray-700 leading-relaxed font-sans">
                                        {activeSpecialty.whatToExpect}
                                    </p>
                                </div>
                            </div>

                            {/* 1. Related Blog Articles for this Specialty */}
                            {activeSpecialtyDetails.articles.length > 0 && (
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-therapique text-base font-bold text-gray-950">
                                            Educational Articles for this Specialty
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            {activeSpecialtyDetails.articles.length} reads available
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {activeSpecialtyDetails.articles.map((art) => (
                                            <div
                                                key={art.id}
                                                onClick={() => {
                                                    const currentSpecialty = activeSpecialty;
                                                    setActiveSpecialty(null);
                                                    onSelectArticle(art, currentSpecialty);
                                                }}
                                                className="p-3.5 rounded-2xl bg-white border border-[#EADBCE] hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer group flex items-start gap-3"
                                            >
                                                <img
                                                    src={art.image}
                                                    alt={art.title}
                                                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                                                        {art.readTime}
                                                    </span>
                                                    <h5 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-purple-900 transition-colors">
                                                        {art.title}
                                                    </h5>
                                                    <span className="text-[11px] text-purple-700 font-bold inline-flex items-center gap-1 mt-1">
                                                        Read Guide <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 2. Real Existing Therapique Specialists */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-therapique text-base font-bold text-gray-950 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-emerald-700" />
                                        Licensed {activeSpecialty.shortTitle} Providers
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => handleNavigateDoctors(activeSpecialty.speciality)}
                                        className="text-xs font-bold text-purple-800 hover:underline cursor-pointer"
                                    >
                                        View All
                                    </button>
                                </div>

                                {activeSpecialtyDetails.doctors.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {activeSpecialtyDetails.doctors.map((doc) => (
                                            <div
                                                key={doc._id}
                                                className="bg-white rounded-2xl p-3.5 border border-[#EADBCE] shadow-2xs flex flex-col justify-between"
                                            >
                                                <div className="flex items-center gap-3 mb-2.5">
                                                    <img
                                                        src={doc.image}
                                                        alt={doc.name}
                                                        className="w-12 h-12 rounded-full object-cover border border-[#EADBCE]"
                                                    />
                                                    <div className="min-w-0">
                                                        <h5 className="text-xs font-bold text-gray-900 truncate">{doc.name}</h5>
                                                        <p className="text-[11px] text-gray-500 truncate">{doc.degree}</p>
                                                        <p className="text-[11px] font-semibold text-emerald-700">₹{doc.fees} / session</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleNavigateAppointment(doc._id)}
                                                    className="w-full py-1.5 rounded-xl bg-black hover:bg-gray-800 text-white text-[11px] font-bold transition-all cursor-pointer"
                                                >
                                                    Book Consultation
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-[#FAF5EE] rounded-2xl p-4 border border-[#EADBCE] flex items-center justify-between">
                                        <p className="text-xs text-gray-600">
                                            Meet our licensed specialists certified in {activeSpecialty.speciality}.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleNavigateDoctors(activeSpecialty.speciality)}
                                            className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 transition"
                                        >
                                            Browse Specialists
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 3. Real Existing Library Books for this Specialty */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-therapique text-base font-bold text-gray-950 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-purple-700" />
                                        Recommended Reading in {activeSpecialty.libraryCategory}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => handleNavigateBook(activeSpecialty.libraryCategory)}
                                        className="text-xs font-bold text-purple-800 hover:underline cursor-pointer"
                                    >
                                        Explore Category
                                    </button>
                                </div>

                                {activeSpecialtyDetails.books.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {activeSpecialtyDetails.books.map((b) => (
                                            <div
                                                key={b._id || b.id}
                                                onClick={() => handleNavigateBook(activeSpecialty.libraryCategory, b._id || b.id)}
                                                className="bg-white rounded-2xl p-3.5 border border-[#EADBCE] hover:border-gray-400 transition-all cursor-pointer flex items-center gap-3 group"
                                            >
                                                <div className="w-14 h-18 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                                    <img
                                                        src={Array.isArray(b.image) ? b.image[0] : b.image}
                                                        alt={b.name || b.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                                                        Library Book
                                                    </span>
                                                    <h5 className="text-xs font-bold text-gray-900 truncate group-hover:text-purple-900 transition-colors">
                                                        {b.name || b.title}
                                                    </h5>
                                                    <p className="text-[11px] text-gray-500 truncate">By {b.author || 'Therapique Press'}</p>
                                                    <p className="text-xs font-bold text-gray-900 mt-1">₹{b.offerPrice || b.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-[#FAF5EE] rounded-2xl p-4 border border-[#EADBCE] flex items-center justify-between">
                                        <p className="text-xs text-gray-600">
                                            Curated clinical and self-help literature in our <strong>{activeSpecialty.libraryCategory}</strong> library.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleNavigateBook(activeSpecialty.libraryCategory)}
                                            className="px-4 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-black hover:text-white text-xs font-bold transition"
                                        >
                                            View in Library
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Bottom Sticky Action */}
                        <div className="px-6 py-4 bg-[#FAF5EE] border-t border-[#EADBCE] flex items-center justify-between flex-wrap gap-3">
                            <p className="text-xs text-gray-600">
                                Ready to take the next step with a licensed {activeSpecialty.shortTitle} provider?
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleNavigateDoctors(activeSpecialty.speciality)}
                                    className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
                                >
                                    Book an Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default React.memo(ExploreSpecialties);
