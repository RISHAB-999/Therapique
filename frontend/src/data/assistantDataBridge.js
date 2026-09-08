// ═══════════════════════════════════════════════════════════════════════════
// Assistant Data Bridge — Reads existing Therapique data sources and produces
// compact summaries for the AI context. NO data duplication.
// The backend fetches doctors/books directly from the database.
// This bridge only provides blog article info for blog-specific navigation.
// ═══════════════════════════════════════════════════════════════════════════

import { blogArticles, blogCategories, specialtyGuide } from './blogData';

/**
 * Get a compact summary of blog articles for display purposes.
 * This is used by the frontend chat component to show blog-related
 * action buttons with correct article IDs — NOT sent to the AI.
 */
export const getArticleSummaries = () => {
    return blogArticles.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        category: a.category,
        excerpt: a.excerpt?.slice(0, 120) || '',
        relatedSpecialties: a.relatedSpecialties || [],
    }));
};

/**
 * Get specialty guide summaries for frontend display purposes.
 */
export const getSpecialtySummaries = () => {
    return specialtyGuide.map(s => ({
        id: s.id,
        speciality: s.speciality,
        shortTitle: s.shortTitle,
        tagline: s.tagline,
    }));
};

/**
 * Get all blog category names.
 */
export const getCategoryList = () => [...blogCategories];

/**
 * Find a blog article by searching title/category/content keywords.
 * Used to resolve AI-suggested topics to actual articles for navigation.
 */
export const findArticleByTopic = (topic) => {
    if (!topic || typeof topic !== 'string') return null;
    const lower = topic.toLowerCase().trim();

    // Exact title match first
    const exactMatch = blogArticles.find(a =>
        a.title.toLowerCase() === lower
    );
    if (exactMatch) return exactMatch;

    // Partial title match
    const titleMatch = blogArticles.find(a =>
        a.title.toLowerCase().includes(lower) || lower.includes(a.title.toLowerCase())
    );
    if (titleMatch) return titleMatch;

    // Category match
    const categoryMatch = blogArticles.find(a =>
        a.category.toLowerCase().includes(lower)
    );
    if (categoryMatch) return categoryMatch;

    // Keyword match in excerpt
    const keywordMatch = blogArticles.find(a =>
        a.excerpt?.toLowerCase().includes(lower)
    );
    if (keywordMatch) return keywordMatch;

    return null;
};

/**
 * Strict route allowlist for the frontend to validate action buttons.
 * Must match the backend allowlist exactly.
 */
export const VALID_ROUTES = new Set([
    '/',
    '/doctors',
    '/about',
    '/contact',
    '/Library',
    '/blog',
    '/Shop',
    '/coins-shop',
    '/login',
    '/privacy-terms',
    '/privacy-policy',
    // Speciality routes
    '/doctors/Clinical Psychologist',
    '/doctors/Counseling Psychologist',
    '/doctors/Child & Adolescent Therapist',
    '/doctors/Marriage & Family Therapist',
    '/doctors/Trauma Therapist',
    '/doctors/Addiction Counselor',
    '/doctors/Cognitive Behavioral Therapist (CBT)',
    '/doctors/Art & Music Therapist',
    // Shop category routes
    '/Shop/CBT & Psychology',
    '/Shop/Mental Health',
    '/Shop/Self-Help & Counseling',
    '/Shop/Children & Parenting',
    '/Shop/Relationships & Family',
    '/Shop/Relationships & Communication',
    '/Shop/Trauma Recovery',
    '/Shop/Trauma & Recovery',
    '/Shop/Addiction Recovery',
    '/Shop/Addiction & Recovery',
    '/Shop/Creative Therapy',
    '/Shop/Mindfulness & Meditation',
]);

/**
 * Frontend-side route validation.
 * Double-checks that action routes from the AI are valid before rendering.
 */
export const isValidRoute = (route) => {
    if (!route || typeof route !== 'string') return false;
    const lower = route.toLowerCase().trim();
    if (lower.startsWith('javascript:')) return false;
    if (lower.startsWith('data:')) return false;
    if (lower.startsWith('http')) return false;
    if (lower.startsWith('//')) return false;
    if (!route.startsWith('/')) return false;
    return VALID_ROUTES.has(route);
};
