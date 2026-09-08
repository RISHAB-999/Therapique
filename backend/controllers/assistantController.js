import { GoogleGenerativeAI } from '@google/generative-ai';
import doctorModel from '../models/doctorModel.js';
import bookModel from '../models/bookModel.js';

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING — In-memory sliding window per IP
// ═══════════════════════════════════════════════════════════════════════════
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 12;      // max 12 requests per minute per IP

const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of rateLimitMap.entries()) {
        const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
        if (valid.length === 0) {
            rateLimitMap.delete(ip);
        } else {
            rateLimitMap.set(ip, valid);
        }
    }
}, 5 * 60 * 1000); // cleanup every 5 minutes

// Prevent memory leak on server shutdown
if (typeof process !== 'undefined') {
    process.on('SIGTERM', () => clearInterval(cleanupInterval));
    process.on('SIGINT', () => clearInterval(cleanupInterval));
}

function checkRateLimit(ip) {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

    if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
        return false; // rate limited
    }

    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);
    return true; // allowed
}

// ═══════════════════════════════════════════════════════════════════════════
// STRICT ROUTE ALLOWLIST — Only real, existing Therapique routes
// ═══════════════════════════════════════════════════════════════════════════
const ALLOWED_ROUTES = new Set([
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
]);

// Dynamic route prefixes (must start with these exactly)
const ALLOWED_ROUTE_PREFIXES = [
    '/doctors/',    // e.g. /doctors/Clinical Psychologist
    '/Shop/',       // e.g. /Shop/CBT & Psychology
    '/appointment/', // e.g. /appointment/docId
];

// Valid speciality names (for /doctors/:speciality routes)
const VALID_SPECIALITIES = [
    'Clinical Psychologist',
    'Counseling Psychologist',
    'Child & Adolescent Therapist',
    'Marriage & Family Therapist',
    'Trauma Therapist',
    'Addiction Counselor',
    'Cognitive Behavioral Therapist (CBT)',
    'Art & Music Therapist',
];

// Valid shop categories (for /Shop/:category routes)
const VALID_SHOP_CATEGORIES = [
    'CBT & Psychology',
    'Mental Health',
    'Self-Help & Counseling',
    'Children & Parenting',
    'Relationships & Family',
    'Relationships & Communication',
    'Trauma Recovery',
    'Trauma & Recovery',
    'Addiction Recovery',
    'Addiction & Recovery',
    'Creative Therapy',
    'Mindfulness & Meditation',
];

function isRouteAllowed(route) {
    if (!route || typeof route !== 'string') return false;

    // Block javascript:, data:, http/https external URLs
    const lower = route.toLowerCase().trim();
    if (lower.startsWith('javascript:')) return false;
    if (lower.startsWith('data:')) return false;
    if (lower.startsWith('http://')) return false;
    if (lower.startsWith('https://')) return false;
    if (lower.startsWith('//')) return false;
    if (!lower.startsWith('/')) return false;

    // Exact match
    if (ALLOWED_ROUTES.has(route)) return true;

    // Prefix match with validation
    for (const prefix of ALLOWED_ROUTE_PREFIXES) {
        if (route.startsWith(prefix)) {
            const param = route.slice(prefix.length);
            // Block path traversal
            if (param.includes('..') || param.includes('<') || param.includes('>')) return false;

            if (prefix === '/doctors/') {
                return VALID_SPECIALITIES.includes(decodeURIComponent(param));
            }
            if (prefix === '/Shop/') {
                return VALID_SHOP_CATEGORIES.includes(decodeURIComponent(param));
            }
            // /appointment/ allows any docId (alphanumeric/hex)
            if (prefix === '/appointment/') {
                return /^[a-zA-Z0-9]{10,30}$/.test(param);
            }
            return false;
        }
    }

    return false;
}

function validateAndFilterActions(actions) {
    if (!Array.isArray(actions)) return [];
    return actions
        .filter(a => a && typeof a === 'object' && typeof a.label === 'string' && typeof a.route === 'string')
        .filter(a => isRouteAllowed(a.route))
        .map(a => ({
            label: String(a.label).slice(0, 80), // cap label length
            route: a.route,
            type: a.type === 'primary' ? 'primary' : 'secondary'
        }))
        .slice(0, 5); // max 5 actions per response
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUT VALIDATION & SANITIZATION
// ═══════════════════════════════════════════════════════════════════════════
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES_IN_HISTORY = 20;

function sanitizeMessage(text) {
    if (typeof text !== 'string') return '';
    // Strip potential injection markers, HTML tags, and control characters
    return text
        .replace(/<[^>]*>/g, '')           // strip HTML tags
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
        .trim()
        .slice(0, MAX_MESSAGE_LENGTH);
}

function validateMessages(messages) {
    if (!Array.isArray(messages)) return [];
    return messages
        .filter(m => m && typeof m === 'object')
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
            role: m.role,
            content: sanitizeMessage(m.content)
        }))
        .filter(m => m.content.length > 0)
        .slice(-MAX_MESSAGES_IN_HISTORY); // keep only recent history
}

function buildGeminiHistory(messages) {
    // Exclude the last message (which will be sent via sendMessage)
    const historyMessages = messages.slice(0, -1);

    // Find the index of the first 'user' message (Gemini requires first turn to be 'user')
    const firstUserIdx = historyMessages.findIndex(m => m.role === 'user');
    if (firstUserIdx === -1) {
        return []; // No previous user turns, start with empty history
    }

    const trimmed = historyMessages.slice(firstUserIdx);
    const history = [];
    let expectedRole = 'user';

    for (const m of trimmed) {
        const geminiRole = m.role === 'user' ? 'user' : 'model';
        if (geminiRole === expectedRole && m.content) {
            history.push({
                role: geminiRole,
                parts: [{ text: m.content }]
            });
            expectedRole = expectedRole === 'user' ? 'model' : 'user';
        }
    }

    // Gemini history must end with a 'model' turn so that the incoming sendMessage is a 'user' turn
    while (history.length > 0 && history[history.length - 1].role !== 'model') {
        history.pop();
    }

    return history;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER-SIDE DATA GATHERING — reads from DB, not from frontend payload
// ═══════════════════════════════════════════════════════════════════════════
async function gatherTherapiqueContext() {
    let doctorSummaries = [];
    let bookSummaries = [];

    try {
        // Only fetch PUBLIC profile fields — no email, password, slots, address
        const doctors = await doctorModel.find({ available: true })
            .select('name speciality degree experience about fees image')
            .lean();

        doctorSummaries = doctors.map(d => ({
            name: d.name,
            speciality: d.speciality,
            degree: d.degree,
            experience: d.experience,
            about: d.about ? d.about.slice(0, 200) : '',
            fees: d.fees,
        }));
    } catch (e) {
        console.log('Assistant: Could not fetch doctors:', e.message);
    }

    try {
        // Only fetch PUBLIC catalog fields — no internal IDs, stock internals
        const books = await bookModel.find({})
            .select('title author category description price image inStock')
            .lean();

        bookSummaries = books.map(b => ({
            title: b.title,
            author: b.author,
            category: b.category,
            description: b.description ? b.description.slice(0, 300) : '',
            price: b.price,
            inStock: b.inStock !== false,
        }));
    } catch (e) {
        console.log('Assistant: Could not fetch books:', e.message);
    }

    return { doctorSummaries, bookSummaries };
}

// ═══════════════════════════════════════════════════════════════════════════
// STATIC THERAPIQUE KNOWLEDGE (from blogData.js & platform config)
// This is embedded server-side so the frontend cannot tamper with it.
// ═══════════════════════════════════════════════════════════════════════════
const THERAPIQUE_STATIC_KNOWLEDGE = `
ABOUT THERAPIQUE:
Therapique is a dedicated mental wellness platform that connects individuals with accredited, compassionate therapists. It offers therapy appointments, a curated psychology book library, an educational blog, a token-based wallet system, and specialty-based practitioner discovery. Therapique makes professional mental healthcare private, accessible, and deeply personal.

WEBSITE PAGES & ROUTES:
- Home: /
- All Doctors/Specialists: /doctors
- Specialists by Speciality: /doctors/{speciality name}
- About Us: /about
- Contact: /contact
- Library (Bookstore): /Library or /Shop
- Token Wallet & Shop: /coins-shop
- Blog & Mental Wellness Insights: /blog
- Login/Register: /login
- Privacy & Terms: /privacy-terms

THERAPIQUE TOKENS / COINS (DIGITAL WALLET & CURRENCY):
Therapique Tokens (also called Coins) are the platform's official digital currency designed for seamless, fast, and secure transactions.
Uses and Benefits of Tokens:
1. Instant Therapy Appointments: Book therapy consultations with one click without entering card/UPI details or waiting for bank OTP verification.
2. Psychology Bookstore Purchases: Use tokens to purchase books from the Therapique Library/Shop.
3. Instant Refund Wallet: If an appointment is cancelled, refunded credits are returned instantly to the user's token balance with zero banking delays.
4. Live Balance: Users can view their live token counter at the top navigation bar.

Available Token Packages in the Coins Shop (/coins-shop):
- Basic Pack: ₹99 for 100 Tokens (₹0.99 per coin, 0 bonus)
- Standard Pack (Most Popular): ₹499 for 550 Tokens (500 Base + 50 Bonus Coins, extra value)
- Premium Pack: ₹999 for 1,150 Tokens (1,000 Base + 150 Bonus Coins)
- Mega Pack: ₹1,899 for 2,400 Tokens (2,000 Base + 400 Bonus Coins, best value)

Purchasing Tokens: Users can easily buy token packages via Razorpay in the Token Wallet & Shop at route /coins-shop.

8 THERAPIQUE SPECIALITIES (these are the exact names):
1. Clinical Psychologist — Comprehensive psychological evaluation, diagnostic clarity, evidence-based interventions for moderate-to-severe conditions.
2. Counseling Psychologist — Life transitions, grief, career stress, self-esteem, interpersonal communication support.
3. Child & Adolescent Therapist — Developmental, emotional, social needs of young minds; play therapy, parental guidance.
4. Marriage & Family Therapist — Relationship repair, de-escalating conflict cycles, deepening partner/family connection.
5. Trauma Therapist — PTSD, complex trauma, somatic experiencing, EMDR-informed approaches.
6. Addiction Counselor — Substance dependence, behavioral addictions, relapse prevention, harm reduction.
7. Cognitive Behavioral Therapist (CBT) — Thought-behavior-emotion patterns, cognitive distortions, anxiety, depression, OCD.
8. Art & Music Therapist — Creative expression, sensory engagement, non-verbal emotional processing.

BLOG CATEGORIES:
Mental Health, Anxiety, Stress Management, Mindfulness, Self-Care, Sleep & Rest, Relationships, Personal Growth, Mind-Body Wellness, CBT & Psychology, Children & Parenting, Trauma Recovery, Addiction Recovery, Creative Therapy.

APPOINTMENT FLOW:
Users browse specialists at /doctors, select a therapist, view their profile, and book an appointment. Payment can be made directly with Therapique tokens (instant 1-click booking) or via Razorpay online. Appointments include integrated video consultation capabilities.

LIBRARY/BOOKSTORE:
Therapique has a curated psychology book collection. Users can browse by category (CBT & Psychology, Mental Health, Self-Help & Counseling, Children & Parenting, Relationships & Family, Trauma Recovery, Addiction Recovery, Creative Therapy), view book details, and purchase in various formats (Standard Paperback, Deluxe Hardcover, E-Book, Audiobook, Pocket/Travel Edition).
`;

// ═══════════════════════════════════════════════════════════════════════════
// BLOG ARTICLE SUMMARIES — statically embedded for server-side context
// These represent the real article titles/topics available on the blog.
// Updated whenever blogData.js is updated.
// ═══════════════════════════════════════════════════════════════════════════
const BLOG_ARTICLE_SUMMARIES = `
AVAILABLE BLOG ARTICLES (these are real articles users can read on /blog):
1. "Small Ways to Feel More Grounded Every Day" — Category: Mindfulness. About: grounding techniques, 5-4-3-2-1 sensory technique, nervous system regulation, bilateral tapping.
2. "Understanding Your Stress Response" — Category: Stress Management. About: stress biology, cortisol, fight-or-flight, stress management techniques.
3. "The Art of Saying No Without Guilt" — Category: Self-Care. About: boundaries, people-pleasing, assertiveness, self-respect.
4. "Why Sleep Is the Foundation of Mental Wellness" — Category: Sleep & Rest. About: sleep hygiene, circadian rhythms, sleep and mental health connection.
5. "Nurturing Emotional Intelligence in Children" — Category: Children & Parenting. About: EQ in kids, emotional coaching, parenting strategies.
6. "Finding Calm in the Chaos — A Quick Practice" — Category: Mindfulness. Interactive 4-step practice: breathing, body scan, grounding, reflection.
7. "Journaling for Mental Clarity" — Category: Personal Growth. About: expressive writing, thought processing, journaling techniques.
8. "Building Resilience Through Everyday Habits" — Category: Personal Growth. About: resilience science, daily habits for mental strength.
9. "How CBT Helps Manage Anxiety" — Category: CBT & Psychology. About: cognitive behavioral therapy for anxiety, thought records, cognitive restructuring.
10. "Healing From Trauma — A Gentle Introduction" — Category: Trauma Recovery. About: trauma types, recovery paths, EMDR, somatic experiencing.
11. "The Connection Between Body and Mind" — Category: Mind-Body Wellness. About: mind-body connection, somatic awareness, psychosomatic health.
12. "Overcoming Creative Blocks Through Art Therapy" — Category: Creative Therapy. About: art therapy techniques, creative expression for healing.
13. "Supporting a Loved One Through Addiction Recovery" — Category: Addiction Recovery. About: family support, enabling vs helping, recovery journey.
14. "Strengthening Bonds — Communication in Relationships" — Category: Relationships. About: active listening, conflict resolution, attachment styles.
15. "Anxiety in the Digital Age" — Category: Anxiety. About: screen time, social media anxiety, digital wellness, tech-life balance.
16. "Understanding the Role of a Clinical Psychologist" — Category: Mental Health. About: what clinical psychologists do, assessment, diagnosis, treatment.
17. "The Science of Gratitude and Happiness" — Category: Personal Growth. About: gratitude practices, positive psychology, wellbeing research.
18. "Managing Burnout Before It Manages You" — Category: Stress Management. About: burnout signs, prevention strategies, work-life balance.
`;

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT — heavily guardrailed
// ═══════════════════════════════════════════════════════════════════════════
function buildSystemPrompt(doctorSummaries, bookSummaries) {
    const doctorInfo = doctorSummaries.length > 0
        ? `\nCURRENT AVAILABLE THERAPISTS:\n${doctorSummaries.map(d => `- ${d.name} (${d.speciality}, ${d.degree}, ${d.experience} experience, ₹${d.fees} fee)`).join('\n')}\n`
        : '\nNo therapist data currently available.\n';

    const bookInfo = bookSummaries.length > 0
        ? `\nCURRENT LIBRARY BOOKS (The Therapique Library Catalog - use ONLY these real books):\n${bookSummaries.map(b => `- "${b.title}" by ${b.author} | Category: ${b.category} | Explores: ${b.description}`).join('\n')}\n`
        : '\nNo book catalog data currently available.\n';

    return `You are the Therapique Website Assistant — a friendly, knowledgeable guide that helps visitors explore and navigate the Therapique mental wellness platform.

CRITICAL RULES YOU MUST ALWAYS FOLLOW:
1. You are NOT a therapist. NEVER diagnose conditions, provide treatment plans, or claim to replace professional therapy.
2. If a user describes symptoms or asks "Do I have [condition]?", respond: "I can't determine that, but I can help you learn about this topic and connect you with a Therapique specialist." Then suggest relevant educational content and specialist links.
3. ONLY reference information from the Therapique data provided below. Do NOT invent therapists, books, authors, articles, services, prices, or features that don't exist.
4. When you don't have information, honestly say: "I don't have that information in the Therapique resources I can access."
5. RESPONSE FORMATTING:
   - Keep answers concise, clear, and easy to read (2-4 short paragraphs maximum).
   - Use short paragraphs separated by clean double line breaks so ideas are well-spaced and readable.
   - You may use markdown bolding (e.g. **Book Title** or **Token Pack**) for titles or emphasis.
   - Never output literal backslash-n characters in the text.
   - NEVER display raw JSON, property names (like "text", "actions", "route"), code blocks, or internal structures in the response text.

6. SPECIAL INSTRUCTIONS FOR BOOK & LIBRARY QUESTIONS:
   - When a user asks about books or the Library (e.g., "Do you have a book about something emotional?", "Do you have books about emotional intelligence?", "Any books about feelings?", "Show me books about mental health", "Do you have a book about CBT?", "Do you have books about trauma?"):
     * Match user intent flexibly and semantically across topics, feelings, emotions, coping strategies, and mental wellness areas (for instance, "something emotional" or "feelings" matches emotional intelligence, emotional awareness, ACT, vulnerability, and self-awareness).
     * Search across title, author, category, and description in CURRENT LIBRARY BOOKS.
     * When matching books exist, you MUST recommend 2 to 3 actual matching books from the catalog with their title, author, and a 1-sentence description.
     * YOU MUST FOLLOW THIS EXACT MULTI-LINE FORMAT:

       Yes! We have several books related to [topic/emotions/mental health].

       Here are a few you might explore:

       **Book Title 1** — Author 1
       Short 1-sentence description of what the book explores.

       **Book Title 2** — Author 2
       Short 1-sentence description of what the book explores.

       Would you like to explore these books or browse our full Library?

     * NEVER collapse the book recommendations into a generic single paragraph without individual titles, authors, and descriptions.
     * NEVER make medical claims. Use phrases like "explores...", "discusses...", "offers insights on...", "provides practical tools for..." rather than "treats", "cures", or "will fix".
     * DO NOT just say "visit library" without listing matching books when relevant books exist in the catalog.
     * Provide 2 to 3 valid action buttons to explore the category or library (e.g., [Explore CBT Books] -> "/Shop/CBT & Psychology", [Browse Mental Health Books] -> "/Shop/Mental Health", [Visit Library] -> "/Library").
   - If NO matching book exists for the requested topic, say:
     "I couldn't find a closely matching book in the current Therapique Library."
     Then provide a [Visit Library] button (route: "/Library").

7. SPECIAL INSTRUCTIONS FOR THERAPIQUE TOKENS / COINS QUESTIONS:
   - When a user asks about tokens, coins, purchasing coins, or how tokens work (e.g., "What are tokens?", "How much do tokens cost?", "What are tokens used for?", "Can I pay for therapy with coins?", "How do I buy tokens?"):
     * Explain clearly what Therapique Tokens/Coins are: the platform's digital wallet currency for fast, 1-click booking with therapists, purchasing psychology books, and instant refund credits without bank delays.
     * Provide the exact token packages and pricing available in the Coins Shop:
       - **Basic Pack**: ₹99 for 100 Tokens
       - **Standard Pack** (Most Popular): ₹499 for 550 Tokens (includes 50 bonus coins)
       - **Premium Pack**: ₹999 for 1,150 Tokens (includes 150 bonus coins)
       - **Mega Pack**: ₹1,899 for 2,400 Tokens (includes 400 bonus coins)
     * Explain that users can purchase and manage tokens securely via Razorpay at the Token Wallet & Shop.
     * Provide action buttons:
       - [Visit Token Shop] -> route: "/coins-shop"
       - [Meet Our Specialists] -> route: "/doctors"
       - [Browse Library] -> route: "/Library"

8. ACTION BUTTON PRESENTATION:
   - ALWAYS provide 1 to 3 highly relevant action buttons using ONLY the valid routes listed below.
   - Typical pairings:
     * Token / Coin question ("What are tokens?", "How to buy coins?"):
       - [Visit Token Shop] -> "/coins-shop"
       - [Meet Our Specialists] -> "/doctors"
     * Specialty question ("What is CBT?", "What does a Trauma therapist do?"):
       - [Find a CBT Specialist] -> "/doctors/Cognitive Behavioral Therapist (CBT)"
       - [Read About CBT on Blog] -> "/blog"
       - [Explore CBT Books] -> "/Shop/CBT & Psychology"
     * Services question ("What services do you provide?"):
       - [Explore Specialists] -> "/doctors"
       - [Token Shop & Wallet] -> "/coins-shop"
       - [Explore Library] -> "/Library"
     * Booking question ("How do I book an appointment?"):
       - [Book an Appointment] -> "/doctors"
       - [Buy Tokens for Booking] -> "/coins-shop"
     * Book question:
       - [Explore Category Books] -> "/Shop/{Category Name}"
       - [Browse Full Library] -> "/Library"
9. NEVER generate external URLs, arbitrary paths, or routes not listed in VALID ROUTES.

RESPONSE FORMAT:
You MUST respond with valid JSON only. Do not output markdown code fences around the JSON object.
{
  "text": "Your natural human-readable response text here. Use double newlines between paragraphs. For book queries, ALWAYS format each book as:\\n\\n**Book Title** — Author\\nShort description of what the book explores.",
  "actions": [
    { "label": "Button Label", "route": "/valid-route", "type": "primary" },
    { "label": "Another Button", "route": "/valid-route", "type": "secondary" }
  ]
}

VALID ROUTES FOR ACTIONS (use ONLY these exact routes):
- "/" — Home page
- "/blog" — Blog & Articles
- "/doctors" — All Specialists
- "/doctors/Clinical Psychologist" — Clinical Psychologists
- "/doctors/Counseling Psychologist" — Counseling Psychologists
- "/doctors/Child & Adolescent Therapist" — Child & Adolescent Therapists
- "/doctors/Marriage & Family Therapist" — Marriage & Family Therapists
- "/doctors/Trauma Therapist" — Trauma Therapists
- "/doctors/Addiction Counselor" — Addiction Counselors
- "/doctors/Cognitive Behavioral Therapist (CBT)" — CBT Therapists
- "/doctors/Art & Music Therapist" — Art & Music Therapists
- "/Shop" — Library / Bookstore
- "/Shop/CBT & Psychology" — CBT & Psychology books
- "/Shop/Mental Health" — Mental Health books
- "/Shop/Self-Help & Counseling" — Self-Help books
- "/Shop/Children & Parenting" — Children & Parenting books
- "/Shop/Relationships & Family" — Relationships & Family books
- "/Shop/Trauma Recovery" — Trauma Recovery books
- "/Shop/Addiction Recovery" — Addiction Recovery books
- "/Shop/Creative Therapy" — Creative Therapy books
- "/coins-shop" — Token Wallet & Shop
- "/about" — About Therapique
- "/contact" — Contact Us
- "/Library" — Library page
- "/login" — Login/Register

${THERAPIQUE_STATIC_KNOWLEDGE}
${BLOG_ARTICLE_SUMMARIES}
${doctorInfo}
${bookInfo}

Remember: You are a helpful Therapique website guide. Be warm, clear, and always direct users to real Therapique resources with appropriate action buttons.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CONTROLLER — POST /api/assistant/chat
// ═══════════════════════════════════════════════════════════════════════════
export const chatWithAssistant = async (req, res) => {
    try {
        // 1. Rate limiting
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || 'unknown';
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please wait a moment before sending another message.',
                retryAfter: 60
            });
        }

        // 2. Check API key is configured
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here' || apiKey.trim().length < 10) {
            return res.json({
                success: true,
                response: {
                    text: "The Therapique Assistant is currently being set up. In the meantime, feel free to explore our website! You can browse our Blog for mental wellness articles, check out our Specialists, or visit our Library for curated psychology books.",
                    actions: [
                        { label: "Explore Blog", route: "/blog", type: "primary" },
                        { label: "Meet Our Specialists", route: "/doctors", type: "secondary" },
                        { label: "Visit Library", route: "/Shop", type: "secondary" }
                    ]
                }
            });
        }

        // 3. Validate and sanitize input
        const { messages: rawMessages } = req.body;
        const messages = validateMessages(rawMessages);

        if (messages.length === 0) {
            return res.json({
                success: false,
                message: 'Please provide a valid message.'
            });
        }

        // Get the last user message
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (!lastUserMessage || lastUserMessage.content.length === 0) {
            return res.json({
                success: false,
                message: 'Please provide a valid message.'
            });
        }

        // 4. Gather Therapique data SERVER-SIDE (not trusting frontend payload)
        const { doctorSummaries, bookSummaries } = await gatherTherapiqueContext();

        // 5. Build system prompt with real data
        const systemPrompt = buildSystemPrompt(doctorSummaries, bookSummaries);

        // 6. Call Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: 0.3,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1024,
                responseMimeType: 'application/json',
            },
        });

        // Build conversation history for Gemini (strictly formatted: user-first, alternating, model-last)
        const chatHistory = buildGeminiHistory(messages);

        const chat = model.startChat({
            history: chatHistory,
        });

        // Send with timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI response timeout')), 30000)
        );

        const responsePromise = chat.sendMessage(lastUserMessage.content);
        const result = await Promise.race([responsePromise, timeoutPromise]);

        const responseText = result.response.text();

        // 7. Parse and validate AI response
        let parsed = null;
        let cleanText = (responseText || '').trim();
        cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        try {
            parsed = JSON.parse(cleanText);
        } catch (parseError) {
            // Attempt to extract json block if surrounded by other characters
            const firstBrace = cleanText.indexOf('{');
            const lastBrace = cleanText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                try {
                    parsed = JSON.parse(cleanText.slice(firstBrace, lastBrace + 1));
                } catch (_) {}
            }
        }

        if (!parsed || typeof parsed !== 'object') {
            parsed = {
                text: cleanText,
                actions: []
            };
        }

        // Ensure text is clean natural language and does not expose raw JSON
        if (typeof parsed.text !== 'string' || parsed.text.trim().length === 0) {
            parsed.text = "I'm here to help you explore Therapique. What would you like to know?";
        } else {
            let innerText = parsed.text.trim();

            // Guard against stringified JSON inside parsed.text
            if (innerText.startsWith('{') && innerText.endsWith('}')) {
                try {
                    const nested = JSON.parse(innerText);
                    if (nested && typeof nested.text === 'string') {
                        innerText = nested.text.trim();
                    }
                } catch (_) {}
            }

            // Strip any raw JSON artifacts if accidentally present
            innerText = innerText
                .replace(/^\{[\s\S]*?"text"\s*:\s*"/i, '')
                .replace(/"\s*,\s*"actions"[\s\S]*?\}\s*$/i, '')
                .replace(/\\r\\n/g, '\n')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, ' ')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            parsed.text = innerText;
        }

        // Cap response text length
        parsed.text = parsed.text.slice(0, 2000);

        // 8. VALIDATE AND FILTER ALL ACTIONS through the strict allowlist
        parsed.actions = validateAndFilterActions(parsed.actions);

        return res.json({
            success: true,
            response: {
                text: parsed.text,
                actions: parsed.actions,
            }
        });

    } catch (error) {
        console.log('Assistant chat error:', error.message);

        // Differentiate timeout from other errors
        if (error.message === 'AI response timeout') {
            return res.status(504).json({
                success: false,
                message: 'The assistant is taking longer than expected. Please try again.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Something went wrong with the assistant. Please try again later.',
        });
    }
};
