const SUPABASE_URL = 'https://groivrufuhcnhbygghog.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2l2cnVmdWhjbmhieWdnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTA4NzEsImV4cCI6MjA4OTEyNjg3MX0.MpEkthbuaeojJS_mUwyh-RrnHTLQ5SNKnscysqMC7hw';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
let cart = [];

// --- GOOGLE SHEET CONFIG ---
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyRw1RZku_Ci1VEZEfpD30bEe8AG8kDcONeYl0FDVQxZS-yWSzChxtscmugWn7mPw7k/exec';

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
                <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to cart</button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Cart Logic
function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) { alert('Already in cart'); }
    else {
        cart.push({ id, name, price });
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
document.getElementById('open-cart-btn').onclick = () => { modal.style.display = 'block'; updateCartUI(); }
document.querySelector('.close-button').onclick = () => { modal.style.display = 'none'; }

// --- CHECKOUT LOGIC (GOOGLE SHEETS + WEB3FORMS) ---
document.getElementById('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const name = e.target.name.value; // Form se naam uthao
    const phone = e.target.phone.value; // Form se phone uthao
    const itemsNames = cart.map(item => item.name).join(', '); // Items ki list banao
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0); // Total price

    const orderData = {
        name: name,
        phone: phone,
        items: itemsNames,
        price: totalPrice
    };

    try {
        // 1. Google Sheet mein bhej rahe hain (For Systematic Records)
        fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(orderData)
        });

        // 2. Web3Forms ya normal notification (Optional, jaisa pehle tha)
        // Yahan tumhara purana fetch code Web3Forms wala chalega

        alert('Success! Order Sheet mein record ho gaya hai.');
        
        // Reset Cart
        cart = []; 
        updateCartUI(); 
        modal.style.display = 'none';
        e.target.reset();

    } catch (err) {
        alert('Kuch gadbad hui: ' + err);
    }
};
