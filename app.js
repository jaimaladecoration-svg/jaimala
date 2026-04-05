// --- GOOGLE SHEET SYNC FUNCTION (TESTING MODE) ---
async function syncToGoogleSheet(orderData) {
    // APNA NAYA WALA URL YAHA DALO
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzaYG4ZogZfn_-38l4HBKQNcQyfc68Q_jzmCbdZEXFDb-vHJPAspP-5RquK4DdwfXLo/exec';

    console.log("Sending data to Sheet:", orderData);

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        alert("Google Sheet ko signal bhej diya gaya hai!");
    } catch (error) {
        console.error("Sheet Sync Error:", error);
        alert("Sheet Sync Fail: " + error.message);
    }
}

// Baki ka purana checkout logic...
document.getElementById('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    
    // Form se data nikalna
    const customerName = e.target.name.value;
    const itemsList = cart.map(i => i.name).join(', ');
    const firstProductImg = cart.length > 0 ? cart[0].img : '';

    // Test alert
    alert("Order process ho raha hai... Rukiye.");

    // Google Sheet function ko call karna
    await syncToGoogleSheet({
        customer_name: customerName,
        items: itemsList,
        image_url: firstProductImg
    });

    alert('Booking Done! Ab Sheet check karein.');
    cart = []; 
    updateCartUI(); 
    modal.style.display = 'none';
};
