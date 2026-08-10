import { v2 as cloudinary } from 'cloudinary';
import bookModel from '../models/bookModel.js';
import orderModel from '../models/orderModel.js';

const multiImageBooks48 = [
  // 1. Mental Health (6)
  {
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    description: "Psychiatrist Viktor Frankl's memoir of surviving Nazi death camps and his discovery of logotherapy to find deep purpose.",
    price: 1199,
    category: "Mental Health",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "E-Book", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 4800000
  },
  {
    title: "Emotional Intelligence",
    author: "Daniel Goleman",
    description: "Why IQ isn't everything and how emotional quotient (EQ) shapes our relationships, success, and psychological well-being.",
    price: 1299,
    category: "Mental Health",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 4700000
  },
  {
    title: "The Happiness Trap",
    author: "Russ Harris",
    description: "How to stop struggling and start living through Acceptance and Commitment Therapy (ACT) principles.",
    price: 1099,
    category: "Mental Health",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 4600000
  },
  {
    title: "Lost Connections",
    author: "Johann Hari",
    description: "Uncovering the real unexpected causes of depression and the radical solutions that offer authentic hope.",
    price: 1399,
    category: "Mental Health",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 4500000
  },
  {
    title: "The Myth of Normal",
    author: "Gabor Maté",
    description: "Trauma, illness, and healing in a toxic culture exploring the deep connection between mind and body health.",
    price: 1599,
    category: "Mental Health",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 4400000
  },
  {
    title: "The Upward Spiral",
    author: "Alex Korb",
    description: "Using neuroscience to reverse the course of depression, one small neurochemical change at a time.",
    price: 1249,
    category: "Mental Health",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 4300000
  },

  // 2. Self-Help & Counseling (6)
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "An easy and proven framework for building good habits, breaking bad ones, and mastering tiny behavioral changes.",
    price: 1499,
    category: "Self-Help & Counseling",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "E-Book", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 4200000
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    description: "Powerful lessons in personal change, character ethics, and principles for personal and professional effectiveness.",
    price: 1399,
    category: "Self-Help & Counseling",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 4100000
  },
  {
    title: "The Gifts of Imperfection",
    author: "Brené Brown",
    description: "Let go of who you think you're supposed to be and embrace who you are through wholehearted living.",
    price: 1149,
    category: "Self-Help & Counseling",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 4000000
  },
  {
    title: "Daring Greatly",
    author: "Brené Brown",
    description: "How the courage to be vulnerable transforms the way we live, love, parent, and lead.",
    price: 1299,
    category: "Self-Help & Counseling",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3900000
  },
  {
    title: "The Mountain Is You",
    author: "Brianna Wiest",
    description: "Transforming self-sabotage into self-mastery by identifying triggers, building resilience, and healing.",
    price: 1199,
    category: "Self-Help & Counseling",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3800000
  },
  {
    title: "Tiny Habits",
    author: "BJ Fogg",
    description: "The small changes that change everything—behavior design principles from Stanford's Behavior Design Lab.",
    price: 1299,
    category: "Self-Help & Counseling",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3700000
  },

  // 3. Children & Parenting (6)
  {
    title: "The Whole-Brain Child",
    author: "Daniel J. Siegel & Tina Payne Bryson",
    description: "12 revolutionary strategies to nurture your child's developing mind and foster emotional intelligence.",
    price: 1399,
    category: "Children & Parenting",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3600000
  },
  {
    title: "Parenting from the Inside Out",
    author: "Daniel J. Siegel & Mary Hartzell",
    description: "How a deeper self-understanding can help you raise children who thrive emotionally and socially.",
    price: 1249,
    category: "Children & Parenting",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3500000
  },
  {
    title: "No-Drama Discipline",
    author: "Daniel J. Siegel & Tina Payne Bryson",
    description: "The whole-brain way to calm the chaos and nurture your child's developing mind without tantrums or tears.",
    price: 1299,
    category: "Children & Parenting",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3400000
  },
  {
    title: "Raising Good Humans",
    author: "Hunter Clarke-Fields",
    description: "A mindful guide to breaking the cycle of reactive parenting and raising kind, confident, resilient kids.",
    price: 1199,
    category: "Children & Parenting",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3300000
  },
  {
    title: "How to Talk So Kids Will Listen & Listen So Kids Will Talk",
    author: "Adele Faber & Elaine Mazlish",
    description: "The ultimate parenting bible for effective communication, conflict resolution, and mutual respect.",
    price: 1099,
    category: "Children & Parenting",
    sizes: ["Standard Paperback", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3200000
  },
  {
    title: "The Explosive Child",
    author: "Ross W. Greene",
    description: "A new approach for understanding and parenting easily frustrated, chronically inflexible children.",
    price: 1349,
    category: "Children & Parenting",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3100000
  },

  // 4. Relationships & Family (6)
  {
    title: "Attached",
    author: "Amir Levine & Rachel Heller",
    description: "The new science of adult attachment and how it can help you find—and keep—love.",
    price: 1299,
    category: "Relationships & Family",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 3000000
  },
  {
    title: "Hold Me Tight",
    author: "Dr. Sue Johnson",
    description: "Seven conversations for a lifetime of love using Emotionally Focused Therapy (EFT) principles.",
    price: 1399,
    category: "Relationships & Family",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2900000
  },
  {
    title: "The Five Love Languages",
    author: "Gary Chapman",
    description: "The secret to love that lasts—discovering how you and your partner express and receive affection.",
    price: 999,
    category: "Relationships & Family",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2800000
  },
  {
    title: "The Seven Principles for Making Marriage Work",
    author: "John M. Gottman & Nan Silver",
    description: "A practical guide from the country's foremost relationship expert based on decades of empirical research.",
    price: 1449,
    category: "Relationships & Family",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2700000
  },
  {
    title: "Nonviolent Communication",
    author: "Marshall B. Rosenberg",
    description: "A language of life for connecting compassionately with yourself and others across all relationships.",
    price: 1199,
    category: "Relationships & Family",
    sizes: ["Standard Paperback", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2600000
  },
  {
    title: "The Relationship Cure",
    author: "John M. Gottman",
    description: "A 5-step guide to strengthening your marriage, family, and friendships through emotional bids.",
    price: 1299,
    category: "Relationships & Family",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2500000
  },

  // 5. Trauma Recovery (6)
  {
    title: "The Body Keeps the Score",
    author: "Dr. Bessel van der Kolk",
    description: "Brain, mind, and body in the healing of trauma, PTSD, and somatic emotional recovery.",
    price: 1599,
    category: "Trauma Recovery",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "E-Book", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2400000
  },
  {
    title: "What Happened to You?",
    author: "Bruce D. Perry & Oprah Winfrey",
    description: "Conversations on trauma, resilience, and healing—shifting from 'what's wrong with you?' to 'what happened to you?'.",
    price: 1499,
    category: "Trauma Recovery",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2300000
  },
  {
    title: "Trauma and Recovery",
    author: "Judith L. Herman",
    description: "The neurobiological and psychological aftermath of violence—from domestic abuse to political terror.",
    price: 1399,
    category: "Trauma Recovery",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2200000
  },
  {
    title: "Complex PTSD",
    author: "Pete Walker",
    description: "From surviving to thriving: a guide and map for recovering from childhood trauma and emotional abuse.",
    price: 1299,
    category: "Trauma Recovery",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2100000
  },
  {
    title: "Healing Developmental Trauma",
    author: "Laurence Heller & Aline LaPierre",
    description: "How early trauma affects self-regulation, self-image, and the capacity for relationship (NARM model).",
    price: 1449,
    category: "Trauma Recovery",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 2000000
  },
  {
    title: "Waking the Tiger",
    author: "Peter A. Levine",
    description: "Healing trauma through Somatic Experiencing—normalizing symptoms and releasing bound instinctual energy.",
    price: 1299,
    category: "Trauma Recovery",
    sizes: ["Standard Paperback", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1900000
  },

  // 6. Addiction Recovery (6)
  {
    title: "In the Realm of Hungry Ghosts",
    author: "Gabor Maté",
    description: "Close encounters with addiction—combining science, clinical stories, and compassionate wisdom.",
    price: 1499,
    category: "Addiction Recovery",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1800000
  },
  {
    title: "Recovery",
    author: "Russell Brand",
    description: "Freedom from our addictions: a modern, humorous, and heartfelt guide to the 12-step recovery program.",
    price: 1199,
    category: "Addiction Recovery",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1700000
  },
  {
    title: "Clean",
    author: "David Sheff",
    description: "Overcoming addiction and saving lives through evidence-based treatment, prevention, and compassionate care.",
    price: 1299,
    category: "Addiction Recovery",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1600000
  },
  {
    title: "Unbroken Brain",
    author: "Maia Szalavitz",
    description: "A revolutionary new way of understanding addiction as a developmental learning disorder.",
    price: 1399,
    category: "Addiction Recovery",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1500000
  },
  {
    title: "Staying Sober",
    author: "Terence T. Gorski & Merlene Miller",
    description: "A guide for relapse prevention based on the Gorski developmental model of recovery.",
    price: 1149,
    category: "Addiction Recovery",
    sizes: ["Standard Paperback", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1400000
  },
  {
    title: "Beyond Addiction",
    author: "Jeffrey Foote, Carrie Wilkens & Nicole Kosanke",
    description: "How science and kindness can help people you love change their addictive behaviors (CRAFT approach).",
    price: 1349,
    category: "Addiction Recovery",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1300000
  },

  // 7. CBT & Psychology (6)
  {
    title: "Feeling Good",
    author: "David D. Burns",
    description: "The clinically proven mood therapy workbook to eliminate cognitive distortions and overcome anxiety.",
    price: 1299,
    category: "CBT & Psychology",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1200000
  },
  {
    title: "Mind Over Mood",
    author: "Dennis Greenberger & Christine A. Padesky",
    description: "Change how you feel by changing the way you think with Cognitive Behavioral Therapy worksheets.",
    price: 1399,
    category: "CBT & Psychology",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1100000
  },
  {
    title: "Retrain Your Brain",
    author: "Seth J. Gillihan",
    description: "Cognitive Behavioral Therapy in 7 weeks: a workbook for managing depression and anxiety.",
    price: 1199,
    category: "CBT & Psychology",
    sizes: ["Standard Paperback", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 1000000
  },
  {
    title: "Cognitive Behavior Therapy: Basics and Beyond",
    author: "Judith S. Beck",
    description: "The foundational textbook for CBT theory, case conceptualization, structure, and clinical techniques.",
    price: 1699,
    category: "CBT & Psychology",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 900000
  },
  {
    title: "The CBT Workbook for Anxiety",
    author: "William J. Knaus",
    description: "Step-by-step CBT exercises to overcome worry, panic, and social anxiety.",
    price: 1249,
    category: "CBT & Psychology",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 800000
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    description: "Nobel laureate Daniel Kahneman's masterwork on the two systems that drive the way we think and decide.",
    price: 1499,
    category: "CBT & Psychology",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 700000
  },

  // 8. Creative Therapy (6)
  {
    title: "The Art Therapy Sourcebook",
    author: "Cathy A. Malchiodi",
    description: "Using art for self-discovery, emotional expression, stress relief, and psychological healing.",
    price: 1399,
    category: "Creative Therapy",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 600000
  },
  {
    title: "Art as Therapy",
    author: "Alain de Botton & John Armstrong",
    description: "How art can help us with our most intimate and ordinary dilemmas—from love to career choices.",
    price: 1499,
    category: "Creative Therapy",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 500000
  },
  {
    title: "Drawing from Within",
    author: "Lisa D. Hinz",
    description: "Using art to treat eating disorders, body dysmorphia, and deep emotional trauma.",
    price: 1299,
    category: "Creative Therapy",
    sizes: ["Standard Paperback", "E-Book"],
    image: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 400000
  },
  {
    title: "Musicophilia",
    author: "Oliver Sacks",
    description: "Tales of music and the brain—how music moves us, heals us, and reshapes neurological function.",
    price: 1349,
    category: "Creative Therapy",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 300000
  },
  {
    title: "The Creative Act",
    author: "Rick Rubin",
    description: "A way of being: timeless wisdom on creativity, intuition, expression, and spiritual connection.",
    price: 1599,
    category: "Creative Therapy",
    sizes: ["Standard Paperback", "Deluxe Hardcover", "Audiobook"],
    image: [
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 200000
  },
  {
    title: "Creative Arts Therapy Manual",
    author: "Stephanie L. Brooke",
    description: "Comprehensive guide to art, music, movement, drama, and poetry therapy techniques.",
    price: 1449,
    category: "Creative Therapy",
    sizes: ["Standard Paperback", "Deluxe Hardcover"],
    image: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop"
    ],
    inStock: true,
    date: Date.now() - 100000
  }
];

// Controller to Add a New Book with Multiple Gallery Images
const addBook = async (req, res) => {
    try {
        const { title, author, description, price, category, sizes, inStock } = req.body;
        
        const image1 = req.files && req.files.image1 && req.files.image1[0];
        const image2 = req.files && req.files.image2 && req.files.image2[0];
        const image3 = req.files && req.files.image3 && req.files.image3[0];
        const image4 = req.files && req.files.image4 && req.files.image4[0];

        const rawImages = [image1, image2, image3, image4].filter(item => item !== undefined);

        if (!title || !author || !description || !price || !category || (rawImages.length === 0 && !req.file)) {
            return res.json({ success: false, message: "Missing required book details or at least 1 cover image" });
        }

        // Upload images to Cloudinary
        let imagesUrl = await Promise.all(
            rawImages.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        if (imagesUrl.length === 0 && req.file) {
            let result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
            imagesUrl.push(result.secure_url);
        }

        let parsedSizes = ["Standard Paperback"];
        if (sizes) {
            try {
                parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            } catch (e) {
                parsedSizes = [sizes];
            }
        }

        let parsedOutOfStockSizes = [];
        if (req.body.outOfStockSizes) {
            try {
                parsedOutOfStockSizes = typeof req.body.outOfStockSizes === 'string' ? JSON.parse(req.body.outOfStockSizes) : req.body.outOfStockSizes;
            } catch (e) {
                parsedOutOfStockSizes = [req.body.outOfStockSizes];
            }
        }

        const bookData = {
            title,
            author,
            description,
            price: Number(price),
            category,
            sizes: parsedSizes,
            outOfStockSizes: parsedOutOfStockSizes,
            image: imagesUrl,
            inStock: inStock === 'false' || inStock === false ? false : true,
            date: Date.now()
        };

        const newBook = new bookModel(bookData);
        await newBook.save();

        res.json({ success: true, message: "Book Added to Library Successfully with Gallery Images!" });

    } catch (error) {
        console.log("Error in addBook:", error);
        res.json({ success: false, message: error.message });
    }
};

// Controller to List All Books (Seeds 48 books if database is empty)
const listBooks = async (req, res) => {
    try {
        let books = await bookModel.find({}).sort({ date: -1 });
        if (books.length === 0) {
            await bookModel.insertMany(multiImageBooks48);
            books = await bookModel.find({}).sort({ date: -1 });
        } else {
            let hasUpdated = false;
            for (let b of books) {
                if (b.sizes && Array.isArray(b.sizes) && !b.sizes.includes("Pocket / Travel Edition")) {
                    b.sizes.push("Pocket / Travel Edition");
                    b.markModified('sizes');
                    await b.save();
                    hasUpdated = true;
                }
            }
            if (hasUpdated) {
                books = await bookModel.find({}).sort({ date: -1 });
            }
        }
        res.json({ success: true, books });
    } catch (error) {
        console.log("Error in listBooks:", error);
        res.json({ success: false, message: error.message });
    }
};

// Controller to Remove a Book
const removeBook = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.json({ success: false, message: "Book ID required" });
        }
        await bookModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Book Removed from Library" });
    } catch (error) {
        console.log("Error in removeBook:", error);
        res.json({ success: false, message: error.message });
    }
};

// Controller to Toggle Stock Status
const toggleStock = async (req, res) => {
    try {
        const { id } = req.body;
        const book = await bookModel.findById(id);
        if (!book) {
            return res.json({ success: false, message: "Book not found" });
        }
        book.inStock = !book.inStock;
        await book.save();
        res.json({ success: true, message: `Stock status updated to ${book.inStock ? 'In Stock' : 'Out of Stock'}` });
    } catch (error) {
        console.log("Error in toggleStock:", error);
        res.json({ success: false, message: error.message });
    }
};

const computeAutoStatus = (orderDate, currentStatus) => {
    if (currentStatus === 'Cancelled') return 'Cancelled';
    const elapsedMinutes = (Date.now() - new Date(orderDate).getTime()) / (1000 * 60);
    if (elapsedMinutes < 2) return 'Order Placed';
    if (elapsedMinutes < 5) return 'Packing & Preparing';
    if (elapsedMinutes < 10) return 'Shipped';
    if (elapsedMinutes < 15) return 'Out for Delivery';
    return 'Delivered';
};

// Controller to Get All Book Orders for Admin
const allOrders = async (req, res) => {
    try {
        let orders = await orderModel.find({}).populate('userId', 'name email phone').sort({ date: -1 });
        
        // Auto update & persist order status based on time elapsed
        for (let order of orders) {
            if (order.status !== 'Cancelled') {
                const autoStatus = computeAutoStatus(order.date, order.status);
                if (order.status !== autoStatus) {
                    order.status = autoStatus;
                    await order.save();
                }
            }
        }

        res.json({ success: true, orders });
    } catch (error) {
        console.log("Error in allOrders:", error);
        res.json({ success: false, message: error.message });
    }
};

// Controller to Update Order Status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.json({ success: false, message: "Order ID and status required" });
        }
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: `Order status updated to '${status}'` });
    } catch (error) {
        console.log("Error in updateOrderStatus:", error);
        res.json({ success: false, message: error.message });
    }
};

// Controller to Clear All Book Orders for Reset
const clearAllOrders = async (req, res) => {
    try {
        await orderModel.deleteMany({});
        res.json({ success: true, message: "All book orders removed from database successfully!" });
    } catch (error) {
        console.log("Error in clearAllOrders:", error);
        res.json({ success: false, message: error.message });
    }
};

// Controller to Toggle Stock Status for a Specific Format (e.g. Paperback, Hardcover)
const toggleFormatStock = async (req, res) => {
    try {
        const { id, format } = req.body;
        const book = await bookModel.findById(id);
        if (!book) {
            return res.json({ success: false, message: "Book not found" });
        }
        let outOfStockSizes = Array.isArray(book.outOfStockSizes) ? [...book.outOfStockSizes] : [];
        if (outOfStockSizes.includes(format)) {
            outOfStockSizes = outOfStockSizes.filter(s => s !== format);
        } else {
            outOfStockSizes.push(format);
        }
        book.outOfStockSizes = outOfStockSizes;
        book.markModified('outOfStockSizes');
        await book.save();
        const isNowOut = outOfStockSizes.includes(format);
        res.json({ success: true, message: `'${format}' format status updated to ${isNowOut ? 'Out of Stock' : 'In Stock'}` });
    } catch (error) {
        console.log("Error in toggleFormatStock:", error);
        res.json({ success: false, message: error.message });
    }
};

export {
    addBook,
    listBooks,
    removeBook,
    toggleStock,
    toggleFormatStock,
    allOrders,
    updateOrderStatus,
    clearAllOrders
};
