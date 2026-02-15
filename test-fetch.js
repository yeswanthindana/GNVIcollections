import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    console.log('--- START TEST ---');
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories:category_id(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.log('❌ MAIN QUERY FAILED');
            console.log('Error Code:', error.code);
            console.log('Error Message:', error.message);
            console.log('Hint:', error.hint);

            // Fallback
            const { data: rawData, error: rawErr } = await supabase.from('products').select('*');
            if (rawErr) {
                console.log('❌ FALLBACK FAILED TOO');
                console.log('Error:', rawErr.message);
            } else {
                console.log(`✅ Fallback Succeeded with ${rawData.length} products.`);
            }

        } else {
            console.log(`✅ MAIN QUERY SUCCEEDED with ${data.length} products.`);
            if (data.length > 0) {
                console.log('First Item Category:', data[0].categories);
            }
        }
    } catch (e) {
        console.log('❌ UNCAUGHT EXCEPTION:', e);
    }
    console.log('--- END TEST ---');
}
test();
