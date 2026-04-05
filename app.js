// --- CONFIG ---
const SUPABASE_URL = 'https://groivrufuhcnhbygghog.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2l2cnVmdWhjbmhieWdnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTA4NzEsImV4cCI6MjA4OTEyNjg3MX0.MpEkthbuaeojJS_mUwyh-RrnHTLQ5SNKnscysqMC7hw';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwN6tYawPRTzxZ0Y4VXLW_Stg3KNOIqhPJri9AtZ6tYtGtpEEt0AMxlLfOZ2AqNzWoC/exec';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- SYNC TO SHEET FUNCTION ---
async function syncToGoogleSheet(orderData) {
    console.log("Sending data to Google Sheet...");
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Google Apps Script ke liye yahi mode kaam karta hai
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(orderData)
        });
        console.log("Sync request sent!");
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

    alert("Booking process ho rahi hai... Please wait!");

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
        console.log("Supabase Success!");
    } catch (err) {
        console.error("Supabase Error:", err);
    }

    alert('Booking Successful! Aapka order Sheet aur History mein save ho gaya hai.');
    
    // Cart clear
    cart = [];
    if(typeof updateCartUI === 'function') updateCartUI();
    document.getElementById('cart-modal').style.display = 'none';
};
