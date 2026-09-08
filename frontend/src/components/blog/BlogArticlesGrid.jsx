import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, ArrowRight } from 'lucide-react';
import { blogCategories, calculateReadTime } from '../../data/blogData';
import TypewriterSearchInput from '../TypewriterSearchInput';
import CustomDropdown from '../ui/CustomDropdown';
import PaginationControls from '../PaginationControls';

const blogPlaceholders = [
    'Search articles or topics...',
    'Search mindfulness & grounding...',
    'Search stress & burnout...',
    'Search anxiety management...',
    'Search sleep & rest routines...',
    'Search CBT & psychology...',
    'Search relationships & self-care...',
];

const BlogArticlesGrid = ({
    articles,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    onSelectArticle,
    exploreRef,
}) => {
    const [showSearch, setShowSearch] = useState(Boolean(searchQuery));
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    // Reset to page 1 whenever category or search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(articles.length / itemsPerPage));
    const validCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const paginatedArticles = articles.slice(startIndex, startIndex + itemsPerPage);

    return (
        <section ref={exploreRef} className="pt-10 sm:pt-14 pb-16 scroll-mt-20">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#EADBCE]">
                <div>
                    <h2 className="font-therapique text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        Explore <span className="font-normal underline decoration-gray-400 underline-offset-4">Articles</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 max-w-lg mt-2 font-medium leading-relaxed">
                        Evidence-informed reflections, practical guides, and compassionate perspectives for everyday mental health.
                    </p>
                </div>

                {/* Morphing Typewriter Search Bar matching other pages */}
                <div className="flex items-center justify-end">
                    <TypewriterSearchInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                        placeholders={blogPlaceholders}
                        isMorphing={true}
                        isOpen={showSearch}
                        onToggleOpen={() => setShowSearch(prev => !prev)}
                        autoFocus={true}
                    />
                </div>
            </div>

            {/* Category Dropdown Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div className="flex items-center gap-3">
                    <CustomDropdown
                        value={selectedCategory}
                        onChange={(cat) => setSelectedCategory(cat)}
                        options={blogCategories}
                        labelPrefix="Category: "
                        minWidth="min-w-[220px] sm:min-w-[260px]"
                    />
                    {selectedCategory !== 'All' && (
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('All')}
                            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors underline cursor-pointer"
                        >
                            Show All
                        </button>
                    )}
                </div>

                {/* Result Count Feedback when filtering */}
                {(searchQuery || selectedCategory !== 'All') && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <span>
                            Showing <strong className="text-gray-900 font-semibold">{articles.length}</strong> {articles.length === 1 ? 'article' : 'articles'}
                            {selectedCategory !== 'All' && <span> in <strong className="text-gray-800">{selectedCategory}</strong></span>}
                            {searchQuery && <span> for "<strong className="text-gray-800">{searchQuery}</strong>"</span>}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All');
                            }}
                            className="text-black font-bold hover:underline cursor-pointer ml-1"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </div>

            {/* Articles Grid */}
            {articles.length > 0 ? (
                <>
                    <div className="flex flex-col gap-6 pt-2 md:grid md:grid-cols-2 lg:grid-cols-3">
                        {paginatedArticles.map((article, idx) => (
                            <div
                                key={article.id}
                                onClick={() => onSelectArticle(article)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectArticle(article); }}
                                className="group bg-white rounded-3xl border border-[#EADBCE] overflow-hidden shadow-md md:shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 sticky top-20 md:static md:top-auto"
                                style={{
                                    top: `${74 + (idx % itemsPerPage) * 8}px`
                                }}
                                aria-label={`Read article: ${article.title}`}
                            >
                                <div>
                                    {/* Image Container */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-900 bg-[#FAF5EE]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#EADBCE] shadow-2xs">
                                                {article.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Article Info */}
                                    <div className="p-5 sm:p-6">
                                        <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium mb-2.5">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {article.date}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 text-purple-700 font-semibold">
                                                <Clock className="w-3 h-3" />
                                                {calculateReadTime(article)}
                                            </span>
                                        </div>

                                        <h3 className="font-therapique text-base sm:text-lg font-bold text-gray-900 leading-snug group-hover:text-purple-900 transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>

                                        <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 font-sans leading-relaxed">
                                            {article.excerpt}
                                        </p>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-5 sm:px-6 pb-5 pt-2 flex items-center justify-between border-t border-[#F3E8DE] mt-2">
                                    {article.author && (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={article.author.avatar}
                                                alt={article.author.name}
                                                className="w-6 h-6 rounded-full object-cover border border-[#EADBCE]"
                                            />
                                            <span className="text-xs text-gray-600 font-medium truncate max-w-[120px]">
                                                {article.author.name}
                                            </span>
                                        </div>
                                    )}
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:text-purple-700 transition-colors shrink-0">
                                        Read Article
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls for Explore Articles */}
                    {articles.length > 0 && (
                        <div className="mt-8 sm:mt-10">
                            <PaginationControls
                                currentPage={validCurrentPage}
                                totalPages={totalPages}
                                totalItems={articles.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    if (exploreRef?.current) {
                                        exploreRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }}
                                onItemsPerPageChange={(newSize) => {
                                    setItemsPerPage(newSize);
                                    setCurrentPage(1);
                                }}
                                itemLabel="articles"
                                rowsOptions={[6, 9, 12]}
                                rowsDirection="up"
                            />
                        </div>
                    )}
                </>
            ) : (
                /* Empty State */
                <div className="text-center py-16 bg-[#FAF5EE] rounded-3xl border border-[#EADBCE] my-4 px-4">
                    <p className="font-therapique text-xl text-gray-800 font-bold mb-2">
                        No articles found
                    </p>
                    <p className="text-sm text-gray-600 max-w-md mx-auto mb-5">
                        We couldn't find any articles matching your search or category filter. Try clearing your search or browsing all topics.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All');
                        }}
                        className="px-5 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition cursor-pointer"
                    >
                        Browse All Articles
                    </button>
                </div>
            )}
        </section>
    );
};

export default React.memo(BlogArticlesGrid);
