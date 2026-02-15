import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🌱 Starting refined seeding for GNVI Collections (v2)...');

    // 1. Fetch Categories
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError || !categories || categories.length === 0) {
        console.error('❌ Categories not found. Please run the SQL in SUPABASE_SETUP.md first.');
        return;
    }

    const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
    }, {});

    const sampleProducts = [
        {
            name: 'Imperial Emerald Ring',
            description: 'A 2-carat vivid green emerald set in 18k BIS Hallmarked Yellow Gold, surrounded by brilliant-cut diamonds.',
            original_price: 145000,
            current_price: 125000,
            image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000',
            category_id: categoryMap['Rings'],
            stock_status: 'In Stock',
            rating: 5.0,
            featured: true
        },
        {
            name: 'Royal Heritage Necklace',
            description: 'Intricate Kundan work with Meenakari detailing. Traditional Indian bridal masterpiece.',
            original_price: 450000,
            current_price: 395000,
            image_url: 'https://images.unsplash.com/photo-1599643478123-dc9109059083?auto=format&fit=crop&q=80&w=1000',
            category_id: categoryMap['Necklaces'],
            stock_status: 'In Stock',
            rating: 4.9,
            featured: true
        },
        {
            name: 'Diamond Solitaire Studs',
            description: 'Classic 1-carat total weight diamond studs set in platinum. VVS1 clarity, E color.',
            original_price: 85000,
            current_price: 72000,
            image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1000',
            category_id: categoryMap['Earrings'],
            stock_status: 'In Stock',
            rating: 4.8,
            featured: false
        },
        {
            name: 'Gold Temple Bracelet',
            description: 'Antique finish 22k gold bracelet featuring divine motifs and ruby accents.',
            original_price: 120000,
            current_price: 110000,
            image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1000',
            category_id: categoryMap['Bracelets'],
            stock_status: 'In Stock',
            rating: 4.7,
            featured: false
        },
        {
            name: 'Maharaja Rose Gold Watch',
            description: 'Limited edition chronometer with rose gold casing and hand-stitched crocodile leather strap.',
            original_price: 280000,
            current_price: 245000,
            image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000',
            category_id: categoryMap['Watches'],
            stock_status: 'In Stock',
            rating: 5.0,
            featured: true
        },
        {
            name: 'Nizam Pearl Choker',
            description: 'Rare Basra pearls intertwined with 22k gold and diamond drops. A symbol of royal elegance.',
            original_price: 320000,
            current_price: 290000,
            image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=1000',
            category_id: categoryMap['Necklaces'],
            stock_status: 'In Stock',
            rating: 4.9,
            featured: false
        }
    ];

    console.log('📦 Updating the vault with new treasures...');
    // Delete existing to avoid duplicates during re-seed
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { data, error } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select();

    if (error) {
        console.error('❌ Error seeding products:', error.message);
        return;
    }

    console.log(`✅ Successfully seeded ${data.length} premium products in INR!`);
}

seed();
