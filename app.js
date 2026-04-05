const SUPABASE_URL = 'https://groivrufuhcnhbygghog.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2l2cnVmdWhjbmhieWdnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTA4NzEsImV4cCI6MjA4OTEyNjg3MX0.MpEkthbuaeojJS_mUwyh-RrnHTLQ5SNKnscysqMC7hw';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- GOOGLE SHEET SYNC FUNCTION ---
async function syncToGoogleSheet(orderData) {
    // YAHA APNA NAYA VERSION 6 WALA URL DALO
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzaYG4ZogZfn_-38l4HBKQNcQyfc68Q_jzmCbdZEXFDb-vHJPAspP-5RquK4DdwfXLo/exec';

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST', // Check spelling: P-O-S-T
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        console.log("Sheet Sync Sent");
    } catch (e) {
        console.error("Sheet Error:", e);
    }
}

// Product Grid, Cart Logic aur Checkout Logic
const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
let cart = [];

// ... (Baki ke filters aur functions wahi rehne do)

// Checkout Logic (Main Part)
document.getElementById('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const customerName = e.target.name.value;
    const itemsList = cart.map(i => i.name).join(', ');
    const firstProductImg = cart.length > 0 ? cart[0].img : '';

    // 1. Alert for user
    alert("Wait... Order Sheet mein bheja ja raha hai!");

    // 2. Google Sheet Sync call
    await syncToGoogleSheet({
        customer_name: customerName,
        items: itemsList,
        image_url: firstProductImg
    });

    // 3. Supabase Logic (Optional for now, but let's keep it)
    const { data: { user } } = await supabaseClient.auth.getUser();
    if(user) {
        await supabaseClient.from('orders').insert([{ 
            user_id: user.id, 
            customer_name: customerName, 
            items: itemsList,
            image_url: firstProductImg 
        }]);
    }

    alert('Booking Finalized! Ab apni Sheet check karein.');
    cart = []; 
    if(typeof updateCartUI === 'function') updateCartUI();
    document.getElementById('cart-modal').style.display = 'none';
};
