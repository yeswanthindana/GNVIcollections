import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    console.log('👤 Attempting to create Admin user...');

    const email = 'indanayeswanth@gmail.com';
    const password = 'Yeswanth@97';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        if (error.message.includes('already registered')) {
            console.log('ℹ️ User already exists in the system.');
        } else {
            console.error('❌ Error creating user:', error.message);
        }
    } else {
        console.log('✅ Admin user created successfully!');
        console.log('⚠️ IMPORTANT: Please check your email for a confirmation link (if enabled) or disable "Confirm Email" in Supabase Auth Settings.');
    }
}

createAdmin();
