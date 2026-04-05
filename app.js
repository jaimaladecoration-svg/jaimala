// --- CONFIGURATION ---
const SUPABASE_URL = 'https://groivrufuhcnhbygghog.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2l2cnVmdWhjbmhieWdnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTA4NzEsImV4cCI6MjA4OTEyNjg3MX0.MpEkthbuaeojJS_mUwyh-RrnHTLQ5SNKnscysqMC7hw';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz7IuzRgMjnU7-HmJTHnD8uolneSnZai44_RjlhQvcWJ5wYNXfQUfvo5fmhnQmU20Bn/exec';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- GOOGLE SHEET SYNC FUNCTION ---
async function syncToGoogleSheet(orderData) {
    console.log("Sending to Sheet...");
    try {
        // Yaha humne 'no-cors' hata diya hai aur plain text bhej rahe hain jo Google accept karta hai
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors', 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(orderData)
        });
        console.log("Sheet Sync Done");
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

    alert("Booking process ho rahi hai, please wait...");

    // 1. Google Sheet mein bhejlo
    await syncToGoogleSheet({
        customer_name: customerName,
        items: itemsList,
        image_url: firstProductImg
    });

    // 2. Supabase mein save karo
    try {
        await supabaseClient.from('orders').insert([{ 
            customer_name: customerName, 
            items: itemsList,
            image_url: firstProductImg 
        }]);
    } catch (err) {
        console.error("Supabase Error:", err);
    }

    alert('Booking Successful! Aapka order Sheet mein save ho gaya hai.');
    
    // Cart saaf karo aur modal band karo
    cart = [];
    if(typeof updateCartUI === 'function') updateCartUI();
    document.getElementById('cart-modal').style.display = 'none';
};
