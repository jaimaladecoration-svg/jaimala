const SUPABASE_URL = 'https://groivrufuhcnhbygghog.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2l2cnVmdWhjbmhieWdnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTA4NzEsImV4cCI6MjA4OTEyNjg3MX0.MpEkthbuaeojJS_mUwyh-RrnHTLQ5SNKnscysqMC7hw';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
let cart = [];

// --- GOOGLE SHEET SYNC FUNCTION ---
async function syncToGoogleSheet(orderData) {
    const GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/AKfycbzvZRFnwfD517mp89eNQwElY_iR0vMrXLuOzmWRmcnc0-g3Rmj-sbcjWvMMsyoFPrjG/exec;

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        console.log("Google Sheet Updated!");
    } catch (error) {
        console.error("Sheet Sync Error:", error);
    }
}

// Category Section Toggle
function showCategories() {
    document.getElementById('category-section').style.display = 'block';
    document.getElementById('product-section').style.display = 'none';
}

function scrollToCategories() {
    document.getElementById('category-section').scrollIntoView({ behavior: 'smooth' });
}

// Filter Function
async function filterByCategory(categoryName) {
    document.getElementById('category-section').style.display = 'none';
    document.getElementById('product-section').style.display = 'block';
    document.getElementById('selected-category-name').innerText = categoryName;
    
    productGrid.innerHTML = '<p>Loading...</p>';

    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('category', categoryName);

    if (error) {
        console.error('Error:', error);
        return;
    }

    productGrid.innerHTML = '';
    if (data.length === 0) {
        productGrid.innerHTML = '<p>No Products Available</p>';
    }

    data.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.media_url}" alt="${product.name}" class="product-media">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price.toLocaleString()}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.media_url}')">Add to cart</button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Cart Logic Updated to include Image
function addToCart(id, name, price, img) {
    const existing = cart.find(item => item.id === id);
    if (existing) { 
        alert('Already in cart'); 
    } else {
        cart.push({ id, name, price, img }); // Image bhi save kar rahe hain
        alert(`'${name}' Added to cart`);
    }
    updateCartUI();
}

function updateCartUI() {
    cartCount.innerText = cart.length;
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.length === 0 ? '<p>Empty</p>' : '';
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<span>${item.name}</span> <strong>₹${item.price}</strong>`;
        list.appendChild(div);
    });
}

// Modal Toggle
const modal = document.getElementById('cart-modal');
const openBtn = document.getElementById('open-cart-btn');
if(openBtn) openBtn.onclick = () => { modal.style.display = 'block'; updateCartUI(); }

const closeBtn = document.querySelector('.close-button');
if(closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; }

// Checkout Logic Updated
document.getElementById('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        alert("Pehle login karein!");
        return;
    }

    const customerName = e.target.name.value; // Form se naam uthaya
    const itemsList = cart.map(i => i.name).join(', ');
    const firstProductImg = cart.length > 0 ? cart[0].img : '';

    try {
        // 1. Supabase mein Save karo
        const { error } = await supabaseClient
            .from('orders')
            .insert([{ 
                user_id: user.id, 
                customer_name: customerName, 
                items: itemsList,
                image_url: firstProductImg // Table mein image_url column hona chahiye
            }]);

        if (error) throw error;

        // 2. Google Sheet mein bhejo
        await syncToGoogleSheet({
            customer_name: customerName,
            items: itemsList,
            image_url: firstProductImg
        });

        alert('Booking Successful! Owner ko detail bhej di gayi hai.');
        cart = []; 
        updateCartUI(); 
        modal.style.display = 'none';

    } catch (err) {
        alert("Error: " + err.message);
    }
};
