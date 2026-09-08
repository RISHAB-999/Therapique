import React from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import {
    getFeaturedArticle,
    getHighlightArticle,
    getTopRightArticle,
    getPracticeArticle,
    getArticleById
} from '../../data/blogData';

const BentoHero = ({ onSelectArticle, onSelectCategory, onScrollToExplore }) => {
    const featured = getFeaturedArticle();
    const highlight = getHighlightArticle();
    const topRight = getTopRightArticle();
    const practice = getPracticeArticle();

    // Category pills with yellow/white alternating rhythm from reference
    const categoryPills = [
        { name: 'Mental Health', target: 'Mental Health', accent: false },
        { name: 'Mindfulness', target: 'Mindfulness', accent: true },
        { name: 'Self-Care', target: 'Self-Care', accent: true },
        { name: 'Anxiety', target: 'Anxiety', accent: false },
        { name: 'Sleep & Rest', target: 'Sleep & Rest', accent: false },
        { name: 'Stress', target: 'Stress Management', accent: true },
        { name: 'Wellness', target: 'Mind-Body Wellness', accent: true },
        { name: 'Growth', target: 'Personal Growth', accent: false },
    ];

    return (
        <section className="w-full max-w-7xl xl:max-w-[1280px] mx-auto pb-6 sm:pb-8 px-4 sm:px-6">
            {/* Top Bar: Editorial BLOG Title & Rounded Pill Button */}
            <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5 pt-1">
                <div>
                    <h1 className="font-therapique text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight uppercase">
                        BLOG
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={onScrollToExplore}
                    className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-gray-300/80 bg-white hover:bg-black hover:text-white transition-all duration-300 text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer shrink-0"
                    aria-label="Scroll to all blog articles"
                >
                    <span>Read Our Blog</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* ========================================================================= */}
            {/* Bento Grid: Exactly matching Pic 2 reference proportions (1.15fr : 1fr rows) */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.94fr)_minmax(0,0.52fr)] lg:grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)] gap-3 sm:gap-3.5 lg:h-[500px] xl:h-[520px]">

                {/* ============================================================ */}
                {/* 1. LEFT FEATURED CARD (45% width, 100% height, Spans 2 Rows) */}
                {/* ============================================================ */}
                <div
                    onClick={() => onSelectArticle(featured)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectArticle(featured); }}
                    className="lg:col-start-1 lg:row-start-1 lg:row-span-2 group relative rounded-[32px] sm:rounded-[36px] overflow-hidden border border-[#EADBCE]/80 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-white min-h-[460px] sm:min-h-[500px] lg:min-h-0 focus:outline-none focus:ring-2 focus:ring-purple-500 select-none"
                    aria-label={`Read featured article: ${featured.title}`}
                >
                    {/* Background Photo */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={featured.image}
                            alt={featured.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                            loading="lazy"
                        />
                    </div>

                    {/* Organic Stepped White Cutout SVG Overlay (Matching Pic 2 Target Reference) */}
                    <svg viewBox="0 0 400 480" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                        <path
                            d="M 0,365 L 215,365 Q 235,365 235,385 Q 235,410 255,410 L 285,410 Q 310,410 310,435 Q 310,480 338,480 L 0,480 Z"
                            fill="#FFFFFF"
                        />
                    </svg>


                    {/* Shelf 1 Text: Category & Date (Matching Pic 2) */}
                    <div className="absolute z-20 left-4 sm:left-5 bottom-[76px] sm:bottom-[80px] max-w-[50%] sm:max-w-[52%] pointer-events-none">
                        <span className="text-[9.5px] sm:text-[10px] font-bold text-gray-700 font-sans tracking-tight truncate block">
                            Category · {featured.category} <span className="text-gray-300 mx-1">|</span> {featured.date}
                        </span>
                    </div>

                    {/* Shelf 2 Text: Bold Display Headline Protected with Bounds */}
                    <div className="absolute z-20 left-4 sm:left-5 bottom-3.5 sm:bottom-4 max-w-[68%] sm:max-w-[72%] pointer-events-none">
                        <h2 className="font-sans text-xs sm:text-[13.5px] lg:text-[14px] xl:text-[15px] font-black text-gray-950 uppercase tracking-tight leading-[1.15] line-clamp-2">
                            {featured.title}
                        </h2>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 2. CENTER TOP CARD (36% width, Wide & Short - Pastel Lime)    */}
                {/* ============================================================ */}
                <div
                    onClick={() => onSelectArticle(highlight)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectArticle(highlight); }}
                    className="lg:col-start-2 lg:row-start-1 group relative p-4 sm:p-5 flex flex-col justify-between overflow-visible cursor-pointer focus:outline-none min-h-[250px] lg:min-h-0 select-none"
                    aria-label={`Read highlighted article: ${highlight.title}`}
                >
                    {/* SVG Card Background + Clipped Decorative Watermark Circles */}
                    <svg
                        viewBox="0 0 500 300"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none z-0 drop-shadow-xs group-hover:drop-shadow-lg transition-all duration-300"
                    >
                        {/* Card Solid Fill with Border */}
                        <path
                            d="
                                M 0,28
                                Q 0,0 28,0
                                L 404,0
                                C 416,0 420,10 420,24
                                C 420,50 438,72 465,72
                                C 484,72 496,62 500,50
                                L 500,272
                                Q 500,300 472,300
                                L 28,300
                                Q 0,300 0,272
                                Z"
                            fill="#D5F886"
                            stroke="#C2EB6B"
                            strokeWidth="1.5"
                        />
                    </svg>

                    {/* Top-Right Standalone Circular Arrow Button (Cleanly Nested in Pocket - Matching Pic 2) */}
                    <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-20">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#D5F886] border border-[#C2EB6B] text-gray-950 flex items-center justify-center shadow-xs group-hover:bg-black group-hover:text-white transition-all duration-300">
                            <ArrowUpRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2]" />
                        </div>
                    </div>

                    {/* Content Section: Category -> Headline -> Description */}
                    <div className="relative z-10 pr-12">
                        {/* 1. Category */}
                        <div className="mb-1.5">
                            <span className="text-[10px] sm:text-[10.5px] font-bold text-gray-850 font-sans">
                                Category . {highlight.category}
                            </span>
                        </div>

                        {/* 2. Scaled Editorial Headline with Bold Display Treatment (Matching Pic 2) */}
                        <h2 className="font-sans text-sm sm:text-base lg:text-[17px] xl:text-[18.5px] font-black text-gray-950 uppercase tracking-tight leading-[1.10] group-hover:text-black transition-colors max-w-[92%]">
                            READY, LISTEN, BREATHE!<br />
                            HOW TO RESPOND TO DAILY STRESS
                        </h2>

                        {/* 3. Description immediately beneath headline */}
                        <p className="mt-1.5 text-[10px] sm:text-[10.5px] text-gray-800 leading-snug font-sans line-clamp-2 max-w-[90%]">
                            {highlight.excerpt} <span className="font-bold underline text-gray-950 cursor-pointer">More</span>
                        </p>
                    </div>

                    {/* 4. Bottom Divider Rows (Matching Pic 2: Full-width divider lines) */}
                    <div className="relative z-10 mt-auto pt-2">
                        {highlight.relatedLinks && highlight.relatedLinks.map((link) => (
                            <div
                                key={link.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const linkedArticle = getArticleById(link.id);
                                    if (linkedArticle) onSelectArticle(linkedArticle);
                                }}
                                className="flex items-center justify-between gap-2 py-1.5 sm:py-2 border-t border-black/25 group/link cursor-pointer hover:opacity-75 transition-opacity bg-transparent"
                            >
                                <span className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-tight text-gray-950 truncate font-sans">
                                    {link.title}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-950 group-hover/link:translate-x-1 transition-transform shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 3. RIGHT TOP CARD (19% width, Narrow & Tall - Sky Blue)      */}
                {/* ============================================================ */}
                <div
                    onClick={() => onSelectArticle(topRight)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectArticle(topRight); }}
                    className="lg:col-start-3 lg:row-start-1 group relative rounded-[28px] sm:rounded-[32px] bg-[#BFE4FD] border border-[#A7D9FB] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-600 min-h-[250px] lg:min-h-0"
                    aria-label={`Read article: ${topRight.title}`}
                >
                    {/* Top Text Content Area */}
                    <div className="p-3.5 sm:p-4 pb-1 relative z-10">
                        {/* Category & Date */}
                        <div className="flex flex-col gap-0.5 mb-1">
                            <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-sky-950/80 font-sans">
                                Category · {topRight.category}
                            </span>
                            <span className="text-[9.5px] sm:text-[10px] font-bold text-sky-900/60 font-sans">
                                Hot · {topRight.date}
                            </span>
                        </div>

                        {/* Bold Headline */}
                        <h2 className="font-sans text-xs sm:text-[13px] lg:text-[14px] xl:text-[15px] font-black text-gray-950 uppercase tracking-tight leading-[1.18] group-hover:text-sky-950 transition-colors">
                            {topRight.title}
                        </h2>
                    </div>

                    {/* Bottom Transparent Cutout Image Docked Flush to Edges */}
                    <div className="relative w-full h-36 sm:h-40 lg:h-[155px] xl:h-[170px] overflow-hidden mt-auto flex items-end justify-center pointer-events-none">
                        <img
                            src={topRight.image}
                            alt={topRight.title}
                            className="w-full h-full object-cover object-[center_top] group-hover:scale-105 transition-transform duration-500 ease-out select-none"
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 4. CENTER BOTTOM CARD (36% width, ~43% height - Tutorial/Practice) */}
                {/* ============================================================ */}
                <div
                    onClick={() => onSelectArticle(practice)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectArticle(practice); }}
                    className="lg:col-start-2 lg:row-start-2 group relative rounded-[28px] sm:rounded-[32px] overflow-hidden border border-[#EADBCE]/80 shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer bg-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[200px] lg:min-h-0"
                    aria-label={`Open guided practice: ${practice.title}`}
                >
                    {/* Background Full-bleed Photo */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={practice.image}
                            alt={practice.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/15" />
                    </div>

                    {/* Top Category Badge */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] sm:text-[10.5px] font-black text-white uppercase tracking-wider font-sans">
                            Category · Guided Practice
                        </span>
                    </div>

                    {/* Centered Frosted Play / Practice Circle Icon */}
                    <div className="relative z-10 flex items-center justify-center my-auto">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/35 backdrop-blur-md border border-white/60 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/50 transition-all duration-300">
                            <svg className="w-4.5 h-4.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>

                    {/* Bottom Duration & Title */}
                    <div className="relative z-10">
                        <p className="text-[9.5px] sm:text-[10px] text-white/80 font-bold mb-0.5 font-sans">
                            {practice.duration || '5 Min'} · {practice.date}
                        </p>
                        <h3 className="font-sans text-xs sm:text-[12.5px] lg:text-[13.5px] font-black text-white uppercase tracking-tight leading-snug line-clamp-2 drop-shadow-sm">
                            {practice.title}
                        </h3>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 5. RIGHT BOTTOM CATEGORY CARD (19% width, ~43% height - Pastel Lavender) */}
                {/* ============================================================ */}
                <div className="lg:col-start-3 lg:row-start-2 rounded-[28px] sm:rounded-[32px] p-4 sm:p-4.5 lg:p-3 xl:p-3.5 bg-[#DDD4F7] border border-[#CEBFEC] shadow-sm flex flex-col justify-between min-h-[190px] lg:min-h-0 overflow-hidden">
                    <div>
                        {/* Dense Cloud of Category Pills with Yellow/White Alternations */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2 lg:gap-1.5 xl:gap-2">
                            {categoryPills.map((pill) => (
                                <button
                                    key={pill.name}
                                    type="button"
                                    onClick={() => onSelectCategory(pill.target || pill.name)}
                                    className={`px-3 py-1.5 sm:px-3 sm:py-1.5 lg:px-2.5 lg:py-0.5 xl:px-3 xl:py-1 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-[11px] font-black tracking-tight transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs font-sans ${pill.accent
                                        ? 'bg-[#FEF08A] hover:bg-[#FDE047] text-gray-950 border border-yellow-300/80 shadow-xs'
                                        : 'bg-white hover:bg-white/95 text-gray-950 border border-purple-200/60'
                                        }`}
                                >
                                    {pill.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Action: "View All Categories" with Yellow Starburst Badge */}
                    <div
                        onClick={onScrollToExplore}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onScrollToExplore(); }}
                        className="pt-2.5 sm:pt-3 lg:pt-1.5 xl:pt-2 border-t border-purple-300/60 flex items-center justify-between cursor-pointer group focus:outline-none"
                    >
                        <span className="text-xs sm:text-[12.5px] lg:text-[10.5px] xl:text-[11.5px] font-black text-gray-950 group-hover:text-purple-950 transition-colors font-sans truncate pr-1">
                            View All Categories
                        </span>
                        <div className="w-8 h-8 sm:w-8 sm:h-8 lg:w-6.5 lg:h-6.5 xl:w-7 xl:h-7 rounded-full bg-[#FEF08A] ring-2 ring-white/80 flex items-center justify-center text-gray-950 shadow-2xs group-hover:translate-x-1 transition-transform shrink-0">
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-3.5 lg:h-3.5" />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default React.memo(BentoHero);
