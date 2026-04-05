// --- CONFIG ---
const SUPABASE_URL = 'https://groivrufuhcnhbygghog.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2l2cnVmdWhjbmhieWdnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTA4NzEsImV4cCI6MjA4OTEyNjg3MX0.MpEkthbuaeojJS_mUwyh-RrnHTLQ5SNKnscysqMC7hw';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1kUNHHjgDVp2IbTAiRMVg3Z8tRIE-34K73fC2Ed9jtsI5ljSGIwl1nOyylWfFDC94/exec';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- SYNC TO SHEET FUNCTION ---
async function syncToGoogleSheet(orderData) {
    console.log("Sending to Google Sheet...");
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Google Script ke liye mandatory hai
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(orderData)
        });
        console.log("Sheet Sync Success!");
    } catch (e) {
        console.error("Sheet Error:", e);
    }
}

// --- CHECKOUT LOGIC ---
document.getElementById('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const customerName = e.target.name.value;
    const itemsList = cart.map(i => i.name).join(', ');
    const firstProductImg = cart.length > 0 ? cart[0].img : '';

    alert("Booking processing... Please wait!");

    // 1. Google Sheet Update
    await syncToGoogleSheet({
        customer_name: customerName,
        items: itemsList,
        image_url: firstProductImg
    });

    // 2. Supabase Update
    try {
        await supabaseClient.from('orders').insert([{ 
            customer_name: customerName, 
            items: itemsList,
            image_url: firstProductImg 
        }]);
    } catch (err) {
        console.error("Supabase Error:", err);
    }

    alert('Booking Successful! Sheet aur Supabase check karein.');
    
    // Cart clear
    cart = [];
    if(typeof updateCartUI === 'function') updateCartUI();
    document.getElementById('cart-modal').style.display = 'none';
};
