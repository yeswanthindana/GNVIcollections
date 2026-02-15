import { supabase } from './src/lib/supabase.js';

const sampleProducts = [
    {
        name: 'Classic Leather Watch',
        description: 'Handcrafted leather strap with a minimalist stainless steel dial. Water-resistant and timeless.',
        price: 129.99,
        image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
        category: 'Watches',
        available: true
    },
    {
        name: 'Wireless Studio Headphones',
        description: 'Active noise-cancelling headphones with 40-hour battery life and high-fidelity sound.',
        price: 249.50,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
        category: 'Audio',
        available: true
    },
    {
        name: 'Premium Leather Work Bag',
        description: 'Professional top-grain leather briefcase with padded laptop compartment and organizing pockets.',
        price: 185.00,
        image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
        category: 'Home',
        available: true
    },
    {
        name: 'Modern Table Lamp',
        description: 'Minimalist LED lamp with adjustable brightness and warm color temperature setting.',
        price: 75.00,
        image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed657f9971?auto=format&fit=crop&q=80&w=800',
        category: 'Home',
        available: true
    },
    {
        name: 'Smart Fitness Tracker',
        description: 'Heart rate monitor, sleep tracking, and GPS. Lightweight design with waterproof casing.',
        price: 89.99,
        image_url: 'https://images.unsplash.com/photo-1557166983-5939644443a0?auto=format&fit=crop&q=80&w=800',
        category: 'Electronics',
        available: true
    },
    {
        name: 'Geometric Gold Ring',
        description: '14k solid gold band with a unique hexagonal design. Polished finish.',
        price: 320.00,
        image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
        category: 'Watches',
        available: true
    }
];

async function seed() {
    console.log('🌱 Seeding sample data...');

    // 1. Clear existing products (Optional)
    // const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert sample products
    const { data, error } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select();

    if (error) {
        console.error('❌ Error seeding products:', error.message);
        return;
    }

    console.log(`✅ Successfully seeded ${data.length} products!`);
}

seed();
