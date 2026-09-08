import React, { useState, useMemo, useRef, useEffect } from 'react';
import BentoHero from '../components/blog/BentoHero';
import BlogArticlesGrid from '../components/blog/BlogArticlesGrid';
import ExploreSpecialties from '../components/blog/ExploreSpecialties';
import BlogLibraryPicks from '../components/blog/BlogLibraryPicks';
import BlogAppointmentCta from '../components/blog/BlogAppointmentCta';
import ArticleModal from '../components/blog/ArticleModal';
import { blogArticles } from '../data/blogData';
import { ScrollFadeInOut } from '../components/ScrollReveal';

const Blog = () => {
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [activeSpecialty, setActiveSpecialty] = useState(null);
    const [sourceSpecialty, setSourceSpecialty] = useState(null);
    const [articleHistory, setArticleHistory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const exploreRef = useRef(null);

    // Set page title for SEO and accessibility
    useEffect(() => {
        document.title = 'Blog & Mental Wellness Insights | Therapique';
    }, []);

    // Filter articles based on active search input and selected category pill
    const filteredArticles = useMemo(() => {
        return blogArticles.filter((article) => {
            const matchesCategory =
                selectedCategory === 'All' ||
                article.category.toLowerCase() === selectedCategory.toLowerCase() ||
                (article.relatedSpecialties && article.relatedSpecialties.some(s => s.toLowerCase() === selectedCategory.toLowerCase())) ||
                (article.relatedLibraryCategory && article.relatedLibraryCategory.toLowerCase() === selectedCategory.toLowerCase());

            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !query ||
                article.title.toLowerCase().includes(query) ||
                article.excerpt.toLowerCase().includes(query) ||
                article.category.toLowerCase().includes(query) ||
                (article.relatedSpecialties && article.relatedSpecialties.some(s => s.toLowerCase().includes(query))) ||
                (article.relatedLibraryCategory && article.relatedLibraryCategory.toLowerCase().includes(query)) ||
                (article.author && article.author.name.toLowerCase().includes(query));

            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const handleScrollToExplore = () => {
        if (exploreRef.current) {
            exploreRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSelectCategoryFromHero = (category) => {
        setSelectedCategory(category);
        handleScrollToExplore();
    };

    const handleSelectArticle = (article, specialty = null) => {
        if (specialty) {
            setSourceSpecialty(specialty);
        } else {
            setSourceSpecialty(null);
        }
        setArticleHistory([]);
        setSelectedArticle(article);
    };

    const handleSelectRelated = (relatedArticle) => {
        if (selectedArticle) {
            setArticleHistory(prev => [...prev, selectedArticle]);
        }
        setSelectedArticle(relatedArticle);
    };

    const handleBackFromArticle = () => {
        if (articleHistory.length > 0) {
            const prev = articleHistory[articleHistory.length - 1];
            setArticleHistory(prevHistory => prevHistory.slice(0, -1));
            setSelectedArticle(prev);
        } else if (sourceSpecialty) {
            const specToRestore = sourceSpecialty;
            setSelectedArticle(null);
            setSourceSpecialty(null);
            setArticleHistory([]);
            setActiveSpecialty(specToRestore);
        }
    };

    const handleCloseArticleModal = () => {
        setSelectedArticle(null);
        setSourceSpecialty(null);
        setArticleHistory([]);
    };

    const backLabel = useMemo(() => {
        if (articleHistory.length > 0) {
            return 'Previous Article';
        }
        if (sourceSpecialty) {
            return sourceSpecialty.shortTitle || sourceSpecialty.speciality || 'Specialty Guide';
        }
        return null;
    }, [articleHistory, sourceSpecialty]);

    const hasBackOption = Boolean(articleHistory.length > 0 || sourceSpecialty);

    return (
        <div className="w-full min-h-screen">
            {/* 1. Bento Grid Top Section (Preserved visual design) */}
            <ScrollFadeInOut>
                <BentoHero
                    onSelectArticle={(art) => handleSelectArticle(art, null)}
                    onSelectCategory={handleSelectCategoryFromHero}
                    onScrollToExplore={handleScrollToExplore}
                />
            </ScrollFadeInOut>

            {/* 2. Explore Articles Grid Section */}
            <ScrollFadeInOut>
                <BlogArticlesGrid
                    articles={filteredArticles}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    onSelectArticle={(art) => handleSelectArticle(art, null)}
                    exploreRef={exploreRef}
                />
            </ScrollFadeInOut>

            {/* 3. Explore by Specialty Section (All 8 Therapique Specialties) */}
            <ScrollFadeInOut>
                <ExploreSpecialties
                    activeSpecialty={activeSpecialty}
                    setActiveSpecialty={setActiveSpecialty}
                    onSelectArticle={handleSelectArticle}
                />
            </ScrollFadeInOut>

            {/* 4. Recommended Reads from our Library (Real Books) */}
            <ScrollFadeInOut>
                <BlogLibraryPicks />
            </ScrollFadeInOut>

            {/* 5. Therapique Support / Appointment CTA */}
            <ScrollFadeInOut>
                <BlogAppointmentCta />
            </ScrollFadeInOut>

            {/* Article & Guided Practice Reader Modal */}
            {selectedArticle && (
                <ArticleModal
                    article={selectedArticle}
                    onClose={handleCloseArticleModal}
                    onSelectRelated={handleSelectRelated}
                    onBack={hasBackOption ? handleBackFromArticle : undefined}
                    backLabel={backLabel}
                />
            )}
        </div>
    );
};

export default Blog;
