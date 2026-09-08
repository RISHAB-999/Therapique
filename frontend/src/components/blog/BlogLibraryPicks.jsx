import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';

const BlogLibraryPicks = () => {
    const navigate = useNavigate();
    const { books } = useContext(ShopContext);

    // Pick top curated books from existing library
    const featuredBooks = useMemo(() => {
        if (!Array.isArray(books) || books.length === 0) return [];
        // Get up to 4 distinct books across different categories if possible
        const seenCategories = new Set();
        const picked = [];

        for (const book of books) {
            if (book && (book._id || book.id)) {
                if (!seenCategories.has(book.category) && picked.length < 4) {
                    seenCategories.add(book.category);
                    picked.push(book);
                }
            }
        }

        // If fewer than 4, fill with whatever books exist
        if (picked.length < 4) {
            for (const book of books) {
                if (!picked.some(p => (p._id || p.id) === (book._id || book.id)) && picked.length < 4) {
                    picked.push(book);
                }
            }
        }

        return picked;
    }, [books]);

    if (featuredBooks.length === 0) return null;

    const handleNavigateBook = (book) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/Shop/${encodeURIComponent(book.category)}/${book._id || book.id}`);
    };

    return (
        <section className="pt-12 sm:pt-16 pb-14 border-t border-[#EADBCE]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Curated Literature</span>
                    </div>
                    <h2 className="font-therapique text-2xl sm:text-3xl md:text-4xl font-bold text-gray-950 tracking-tight">
                        Recommended Reads from our <span className="font-normal underline decoration-gray-400 underline-offset-4">Library</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mt-2 font-medium leading-relaxed">
                        Deepen your self-understanding with evidence-based books written by leading clinicians, researchers, and mindful practitioners.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        navigate('/Library');
                    }}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900 hover:text-purple-700 transition-colors shrink-0"
                >
                    <span>Browse All Library Books</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* 4 Books Grid */}
            <div className="flex flex-col gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {featuredBooks.map((book, idx) => {
                    const bookImg = Array.isArray(book.image) ? book.image[0] : book.image;
                    return (
                        <div
                            key={book._id || book.id}
                            onClick={() => handleNavigateBook(book)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigateBook(book); }}
                            className="group bg-white rounded-3xl p-4 border border-[#EADBCE] shadow-md sm:shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 hover:-translate-y-1 sticky top-20 sm:static sm:top-auto"
                            style={{
                                top: `${74 + (idx % 4) * 8}px`
                            }}
                        >
                            <div>
                                <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#FAF5EE] border border-gray-100 mb-3 relative">
                                    <img
                                        src={bookImg}
                                        alt={book.name || book.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-gray-200 text-gray-800 shadow-2xs">
                                        {book.category}
                                    </span>
                                </div>
                                <h3 className="font-therapique text-sm sm:text-base font-bold text-gray-950 line-clamp-2 leading-snug group-hover:text-purple-900 transition-colors">
                                    {book.name || book.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    By {book.author || 'Therapique Clinical Press'}
                                </p>
                            </div>

                            <div className="pt-3 mt-3 border-t border-[#F3E8DE] flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">
                                    ₹{book.offerPrice || book.price}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 group-hover:text-purple-900 transition-colors">
                                    View in Library
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default React.memo(BlogLibraryPicks);
