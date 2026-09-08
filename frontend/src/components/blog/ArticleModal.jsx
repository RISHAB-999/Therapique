import React, { useEffect, useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    X, 
    Clock, 
    Calendar, 
    ArrowRight, 
    ArrowLeft,
    BookOpen, 
    CheckCircle2, 
    UserCheck, 
    HeartHandshake, 
    ArrowUpRight,
    ListFilter,
    Lightbulb,
    FileText,
    ExternalLink
} from 'lucide-react';
import { getRelatedArticles, specialtyGuide, calculateReadTime, calculateWordCount } from '../../data/blogData';
import { ShopContext } from '../../context/ShopContext';

const ArticleModal = ({ article, onClose, onSelectRelated, onBack, backLabel }) => {
    const navigate = useNavigate();
    const { books } = useContext(ShopContext);
    const scrollContainerRef = useRef(null);
    const [activeSectionId, setActiveSectionId] = useState('');

    // Dynamically calculate realistic reading time and word count
    const dynamicReadTime = useMemo(() => calculateReadTime(article), [article]);
    const wordCount = useMemo(() => calculateWordCount(article), [article]);

    // Close on Escape key press & prevent background scroll
    useEffect(() => {
        if (!article) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [article, onClose]);

    // Find related specialty guide object
    const relatedSpecialtyObj = useMemo(() => {
        if (!article || !article.relatedSpecialties || article.relatedSpecialties.length === 0) return null;
        const targetName = article.relatedSpecialties[0];
        return specialtyGuide.find(s => s.speciality.toLowerCase() === targetName.toLowerCase()) || null;
    }, [article]);

    // Find genuine matching real books from existing library
    const matchingLibraryBook = useMemo(() => {
        if (!article || !article.relatedLibraryCategory || !Array.isArray(books)) return null;
        const categoryMatch = books.find(b => 
            b && b.category && b.category.toLowerCase() === article.relatedLibraryCategory.toLowerCase()
        );
        return categoryMatch || null;
    }, [article, books]);

    if (!article) return null;

    const relatedArticles = getRelatedArticles(article.id, article.category);

    const handleScrollToSection = (sectionId) => {
        setActiveSectionId(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleNavigateSpecialist = (specialityName) => {
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/doctors/${encodeURIComponent(specialityName)}`);
    };

    const handleNavigateBook = (book) => {
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/Shop/${encodeURIComponent(book.category)}/${book._id || book.id}`);
    };

    const handleNavigateAppointments = () => {
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/doctors');
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/65 backdrop-blur-xs transition-opacity duration-300 overflow-y-auto"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-article-title"
        >
            {/* Modal Dialog Container - Generous reading width */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[94vh] bg-[#FDF7F3] rounded-[28px] sm:rounded-[36px] border border-[#EADBCE] shadow-2xl flex flex-col overflow-hidden my-auto"
                style={{
                    boxShadow: '0 30px 60px -15px rgba(25, 14, 48, 0.35)'
                }}
            >
                {/* Top Sticky Header with Close Button */}
                <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 bg-[#FDF7F3]/95 backdrop-blur-md border-b border-[#EADBCE] gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EE] hover:bg-[#F3E8DE] text-gray-800 hover:text-black border border-[#EADBCE] text-xs font-bold transition-all cursor-pointer shadow-2xs group shrink-0 active:scale-95"
                                aria-label={backLabel ? `Back to ${backLabel}` : 'Go back'}
                            >
                                <ArrowLeft className="w-3.5 h-3.5 text-purple-700 group-hover:-translate-x-0.5 transition-transform" />
                                <span>{backLabel ? `Back to ${backLabel}` : 'Back'}</span>
                            </button>
                        )}
                        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-100/90 px-3 py-1 rounded-full border border-purple-200">
                            {article.category}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-purple-700" />
                            {dynamicReadTime}
                        </span>
                        <span className="hidden sm:inline-flex text-xs text-gray-400 font-medium">
                            • {wordCount} words
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 sm:p-2 rounded-full text-gray-600 hover:text-black hover:bg-[#F3E8DE] transition-colors cursor-pointer shrink-0"
                        aria-label="Close article reader"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Scrollable Reader Content */}
                <div ref={scrollContainerRef} className="overflow-y-auto px-5 sm:px-8 md:px-12 py-6 sm:py-8 space-y-7">
                    
                    {/* Article Title */}
                    <div>
                        <h1 
                            id="modal-article-title" 
                            className="font-therapique text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-gray-950 leading-[1.18] tracking-tight"
                        >
                            {article.title}
                        </h1>
                    </div>

                    {/* Author & Publication Meta */}
                    {article.author && (
                        <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-[#EADBCE]">
                            <div className="flex items-center gap-3.5">
                                <img
                                    src={article.author.avatar}
                                    alt={article.author.name}
                                    className="w-12 h-12 rounded-full object-cover border border-[#EADBCE] shadow-2xs"
                                />
                                <div>
                                    <p className="text-sm font-bold text-gray-950">{article.author.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">{article.author.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Published {article.date}</span>
                            </div>
                        </div>
                    )}

                    {/* Featured Hero Image */}
                    <div className={`w-full h-64 sm:h-80 md:h-96 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EADBCE] shadow-xs flex items-center justify-center relative ${
                        article.category === 'Sleep & Rest' || article.image?.endsWith('.png')
                            ? 'bg-gradient-to-b from-[#EAF6FF] via-[#DCF0FD] to-[#BFE4FD]'
                            : 'bg-[#FAF5EE]'
                    }`}>
                        <img
                            src={article.image}
                            alt={article.title}
                            className={`w-full h-full ${
                                article.image?.endsWith('.png')
                                    ? 'object-contain object-bottom pt-4 px-4'
                                    : 'object-cover object-center'
                            }`}
                        />
                    </div>

                    {/* Excerpt Lead Paragraph */}
                    <p className="text-base sm:text-lg text-gray-800 font-serif italic leading-relaxed bg-[#FAF5EE] p-5 rounded-2xl border-l-4 border-purple-600 shadow-2xs">
                        {article.excerpt}
                    </p>

                    {/* ========================================================================= */}
                    {/* TABLE OF CONTENTS ("In This Article") for Long-Form Reads                */}
                    {/* ========================================================================= */}
                    {article.sections && article.sections.length >= 2 && (
                        <nav className="bg-[#FAF5EE] p-5 sm:p-6 rounded-2xl border border-[#EADBCE] shadow-2xs">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                                <ListFilter className="w-4 h-4 text-purple-700" />
                                <span>In This Article</span>
                            </div>
                            <ul className="space-y-2">
                                {article.sections.map((section, idx) => (
                                    <li key={section.id || idx}>
                                        <button
                                            type="button"
                                            onClick={() => handleScrollToSection(section.id || `section-${idx}`)}
                                            className={`text-left text-xs sm:text-sm font-semibold transition-colors hover:text-purple-900 cursor-pointer flex items-center gap-2 ${
                                                activeSectionId === section.id ? 'text-purple-900 font-bold' : 'text-gray-700'
                                            }`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                                            <span>{section.heading}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    {/* Guided Practice Steps (if applicable) */}
                    {article.practiceSteps && (
                        <div className="bg-[#E4F4E7]/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-emerald-200 my-6 shadow-2xs">
                            <h3 className="font-therapique text-lg sm:text-xl font-bold text-emerald-950 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-emerald-700" />
                                Step-by-Step Guided Somatic Exercise
                            </h3>
                            <div className="space-y-3.5">
                                {article.practiceSteps.map((step) => (
                                    <div key={step.step} className="flex items-start gap-3.5 bg-white/90 p-4 rounded-xl border border-emerald-100 shadow-2xs">
                                        <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                            {step.step}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                                            <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">{step.instruction}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Long-Form Article Body Sections */}
                    {article.sections && article.sections.map((section, idx) => (
                        <div 
                            key={section.id || idx} 
                            id={section.id || `section-${idx}`}
                            className="space-y-4 pt-2 scroll-mt-20"
                        >
                            {section.heading && (
                                <h2 className="font-therapique text-xl sm:text-2xl md:text-[26px] font-bold text-gray-950 leading-snug pt-2">
                                    {section.heading}
                                </h2>
                            )}

                            {section.paragraphs && section.paragraphs.map((p, pIdx) => (
                                <p key={pIdx} className="text-sm sm:text-base text-gray-800 leading-[1.75] font-sans">
                                    {p}
                                </p>
                            ))}

                            {/* Callout Box */}
                            {section.callout && (
                                <div className="my-5 p-4 sm:p-5 rounded-2xl bg-[#F4F8F4] border border-emerald-200 flex items-start gap-3.5 shadow-2xs">
                                    <Lightbulb className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1">
                                            {section.callout.title || 'Clinical Insight'}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                            {section.callout.text}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Stylized Blockquote */}
                            {section.quote && (
                                <blockquote className="my-5 pl-5 border-l-4 border-[#241E1A] py-1.5 text-gray-900 font-serif italic text-base sm:text-lg leading-relaxed bg-[#FAF5EE]/60 p-4 rounded-r-2xl">
                                    "{section.quote}"
                                </blockquote>
                            )}

                            {/* Key Takeaways Box */}
                            {section.takeaways && section.takeaways.length > 0 && (
                                <div className="my-5 p-5 rounded-2xl bg-[#FAF5EE] border border-[#EADBCE]">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2.5 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-purple-700" />
                                        Key Takeaways
                                    </h4>
                                    <ul className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                        {section.takeaways.map((item, tIdx) => (
                                            <li key={tIdx} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-700 mt-2 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* External Sources & Further Reading */}
                            {section.sources && section.sources.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" />
                                        Evidence & Reputable References
                                    </p>
                                    <ul className="space-y-1 text-xs text-gray-600">
                                        {section.sources.map((src, sIdx) => (
                                            <li key={sIdx} className="italic text-gray-500">• {src}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* ========================================================================= */}
                    {/* 1. RELATED THERAPIQUE SPECIALTY (Connected dynamically)                   */}
                    {/* ========================================================================= */}
                    {relatedSpecialtyObj && (
                        <div className="mt-8 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#F4F8F4] border border-emerald-200 shadow-2xs">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                                Related Therapique Specialty
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-emerald-200 shrink-0">
                                        <img
                                            src={relatedSpecialtyObj.image}
                                            alt={relatedSpecialtyObj.speciality}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-therapique text-base font-bold text-gray-950">
                                            {relatedSpecialtyObj.shortTitle}
                                        </h4>
                                        <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                                            {relatedSpecialtyObj.tagline}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleNavigateSpecialist(relatedSpecialtyObj.speciality)}
                                    className="px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                >
                                    <span>Explore {relatedSpecialtyObj.shortTitle}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* 2. RECOMMENDED READING (Real existing Library book)                       */}
                    {/* ========================================================================= */}
                    {matchingLibraryBook && (
                        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FAF5EE] border border-[#EADBCE] shadow-2xs">
                            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                                Recommended Reading from our Library
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0 shadow-2xs">
                                        <img
                                            src={Array.isArray(matchingLibraryBook.image) ? matchingLibraryBook.image[0] : matchingLibraryBook.image}
                                            alt={matchingLibraryBook.name || matchingLibraryBook.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-therapique text-sm sm:text-base font-bold text-gray-950 line-clamp-1">
                                            {matchingLibraryBook.name || matchingLibraryBook.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            By {matchingLibraryBook.author || 'Therapique Clinical Library'} • Category: {matchingLibraryBook.category}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleNavigateBook(matchingLibraryBook)}
                                    className="px-5 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-black hover:text-white text-xs font-bold transition shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                                >
                                    <span>View in Library</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* 3. LOOKING FOR PERSONALIZED SUPPORT? (Appointment CTA)                    */}
                    {/* ========================================================================= */}
                    <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#20172B] to-[#2B1F3D] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                        <div>
                            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                                Personalized Clinical Care
                            </span>
                            <h4 className="font-therapique text-base sm:text-lg font-bold text-white leading-tight">
                                Looking for Guided, 1-on-1 Support?
                            </h4>
                            <p className="text-xs text-gray-300 mt-1 max-w-md font-sans">
                                Connect confidentially with our accredited psychotherapists and counselors.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleNavigateAppointments}
                            className="px-6 py-2.5 rounded-full bg-white hover:bg-gray-100 text-gray-950 text-xs font-bold transition shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                        >
                            Book an Appointment
                        </button>
                    </div>

                    {/* Educational Disclaimer */}
                    <div className="p-4 rounded-2xl bg-[#F3E8DE]/60 border border-[#EADBCE] text-xs text-gray-600 leading-relaxed">
                        <p className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Educational Disclaimer
                        </p>
                        Articles published on Therapique are written for informational and educational purposes. They do not substitute for personalized medical diagnosis or clinical psychotherapeutic advice.
                    </div>

                    {/* Related Articles Section */}
                    {relatedArticles.length > 0 && (
                        <div className="pt-4 border-t border-[#EADBCE]">
                            <h3 className="font-therapique text-lg sm:text-xl font-bold text-gray-900 mb-4">
                                Related Readings
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {relatedArticles.map((rel) => (
                                    <div
                                        key={rel.id}
                                        onClick={() => onSelectRelated(rel)}
                                        className="p-3.5 rounded-2xl bg-white border border-[#EADBCE] hover:border-gray-400 transition-all cursor-pointer group flex items-start gap-3"
                                    >
                                        <img
                                            src={rel.image}
                                            alt={rel.title}
                                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                                                {rel.category}
                                            </span>
                                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-purple-900 transition-colors">
                                                {rel.title}
                                            </h4>
                                            <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                                                <span>{calculateReadTime(rel)}</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Footer Action */}
                <div className="px-5 sm:px-8 py-3 bg-[#FAF5EE] border-t border-[#EADBCE] flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Enjoyed this deep dive? Explore our specialty guide or library.
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition cursor-pointer active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ArticleModal);
