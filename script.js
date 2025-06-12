// Global Variables
let currentUser = null;
let products = [];
let cart = [];
let orders = [];
let userProducts = [];
let currentUserRole = null;
let deliveryPartners = [];
let isOnline = navigator.onLine;
let offlineQueue = [];

// Sample data for subcategories
const subcategories = {
  fruits: ['Apples', 'Bananas', 'Oranges', 'Mangoes', 'Grapes', 'Watermelon', 'Papaya', 'Guava', 'Pomegranate', 'Pineapple', 'Strawberries', 'Kiwi', 'Seasonal Fruits', 'Citrus Fruits', 'Tropical Fruits', 'Berries'],
  vegetables: ['Leafy Greens', 'Spinach', 'Lettuce', 'Kale', 'Methi', 'Palak', 'Root Vegetables', 'Carrots', 'Radish', 'Beetroot', 'Tomatoes', 'Onions', 'Potatoes', 'Brinjal', 'Okra', 'Capsicum', 'Cauliflower', 'Cabbage', 'Seasonal Vegetables'],
  'homemade-food': ['Snacks', 'Sweets', 'Pickles', 'Jams', 'Baked Items', 'Traditional Food', 'Namkeen', 'Laddu', 'Barfi', 'Murukku', 'Chakli', 'Samosa', 'Homemade Bread'],
  'organic-oils': ['Coconut Oil', 'Mustard Oil', 'Sesame Oil', 'Groundnut Oil', 'Olive Oil', 'Spice Powders', 'Whole Spices', 'Turmeric Powder', 'Chili Powder', 'Garam Masala'],
  pickles: ['Mango Pickle', 'Lemon Pickle', 'Mixed Vegetable', 'Garlic Pickle', 'Chili Pickle', 'Ginger Pickle', 'Amla Pickle', 'Carrot Pickle'],
  plants: ['Vegetable Saplings', 'Fruit Plants', 'Herbs', 'Flowering Plants', 'Indoor Plants', 'Medicinal Plants', 'Succulents', 'Bonsai'],
  grains: ['Rice', 'Wheat', 'Lentils', 'Chickpeas', 'Millets', 'Quinoa', 'Barley', 'Oats', 'Black Gram', 'Green Gram'],
  dairy: ['Goat Milk', 'Buffalo Milk', 'Cow Milk', 'Donkey Milk', 'Fresh Ghee', 'Curd', 'Butter', 'Cheese', 'Paneer', 'Buttermilk'],
  livestock: ['Cows (Milking)', 'Cows (Pregnant)', 'Cows (Dry)', 'Bulls', 'Calves (Male)', 'Calves (Female)', 'Goats (Adult)', 'Goats (Kids)', 'Sheep (Adult)', 'Sheep (Lambs)', 'Buffaloes', 'Fresh Meat'],
  poultry: ['Desi Chickens (1-3 months)', 'Desi Chickens (3-6 months)', 'Desi Chickens (6+ months)', 'Broiler Chickens', 'Fancy Chicks', 'Laying Hens', 'Roosters', 'Ducks', 'Fresh Eggs', 'Chicken Meat', 'Duck Meat'],
  crafts: ['Kitchen Tools', 'Handmade Knives', 'Designer Ropes', 'Baskets', 'Wooden Items', 'Clay Pots', 'Musical Instruments', 'Handicrafts'],
  'farming-supplies': ['Cow Dung Manure', 'Goat Manure', 'Chicken Manure', 'Vermicompost', 'Organic Compost', 'Seeds', 'Tools', 'Organic Fertilizers', 'Natural Pesticides'],
  manure: ['Fresh Cow Dung', 'Dried Cow Dung', 'Goat Manure', 'Chicken Manure', 'Buffalo Dung', 'Vermicompost', 'Organic Compost', 'Kitchen Waste Compost'],
  donate: ['Food Donation', 'Money Donation', 'Clothing', 'Books', 'Medicines', 'Farm Produce', 'Cooked Meals', 'Other Items'],
  'products-for-free': ['Surplus Vegetables', 'Extra Fruits', 'Sample Products', 'Expired Soon Items', 'Bulk Extras', 'Community Share', 'Trial Products']
};

// Authentication Functions
function showLogin() {
  document.getElementById('login-modal').classList.remove('hidden');
}

function showSignup() {
  document.getElementById('signup-modal').classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function loginWithGoogle() {
  currentUser = {
    id: 'google_' + Date.now(),
    name: 'Google User',
    phone: '+91-9876543210',
    email: 'user@gmail.com',
    pincode: '110001'
  };
  handleSuccessfulLogin();
}

function loginWithYahoo() {
  currentUser = {
    id: 'yahoo_' + Date.now(),
    name: 'Yahoo User',
    phone: '+91-9876543210',
    email: 'user@yahoo.com',
    pincode: '110001'
  };
  handleSuccessfulLogin();
}

function handleSuccessfulLogin() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('user-section').classList.remove('hidden');
  document.getElementById('username').textContent = currentUser.name;
  document.getElementById('role-selection').classList.remove('hidden');
  closeModal('login-modal');
  closeModal('signup-modal');
  showNotification('Welcome to Home Harvest Market! What would you like to do today?');
}

function logout() {
  currentUser = null;
  currentUserRole = null;
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('user-section').classList.add('hidden');
  document.getElementById('role-selection').classList.add('hidden');
  document.getElementById('add-product').classList.add('hidden');
  cart = [];
  updateCartDisplay();
  showNotification('Thank you for using Home Harvest Market! Come back soon!');
}

// Role Selection
function setUserRole(role) {
  currentUserRole = role;
  document.getElementById('role-selection').classList.add('hidden');

  if (role === 'seller') {
    document.getElementById('add-product').classList.remove('hidden');
    showNotification('Great! Let\'s add your products to our marketplace and help your community!');
  } else {
    showNotification('Happy shopping! Discover fresh local products from your neighbors!');
  }
}

// Location Functions
function filterByLocation() {
  const pincode = document.getElementById('pincode-filter').value;
  if (pincode) {
    const filteredProducts = products.filter(p => p.pincode === pincode);
    displayProducts(filteredProducts);
    showNotification(`Found ${filteredProducts.length} products near ${pincode}`);
  }
}

function getGPSLocation() {
  if ("geolocation" in navigator) {
    showNotification('📍 Getting your location...');
    navigator.geolocation.getCurrentPosition(function(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Convert coordinates to pincode using reverse geocoding
      reverseGeocode(lat, lon).then(pincode => {
        document.getElementById('pincode-filter').value = pincode;
        filterByLocation();
        showNotification('📍 Location detected! Showing nearby products.');
      }).catch(error => {
        console.error('Geocoding error:', error);
        // Fallback to default pincode
        document.getElementById('pincode-filter').value = "110001";
        filterByLocation();
        showNotification('📍 Using approximate location to show nearby products.');
      });

    }, function(error) {
      let errorMessage = '❌ Unable to get your location. ';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Please allow location access and try again.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timed out.';
          break;
        default:
          errorMessage += 'An unknown error occurred.';
      }
      showNotification(errorMessage);
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    });
  } else {
    showNotification('❌ Geolocation is not supported by this device.');
  }
}

async function reverseGeocode(lat, lon) {
  // Simplified reverse geocoding - in production, use a proper service
  // For demo purposes, return a sample pincode based on coordinates
  const pincodes = ['110001', '110002', '110003', '110004', '110005'];
  return pincodes[Math.floor(Math.random() * pincodes.length)];
}

// Category Functions
function showCategory(category) {
  const categoryProducts = products.filter(p => p.category === category);
  displayProducts(categoryProducts);
  document.getElementById('products-section').scrollIntoView();

  if (category === 'donate') {
    showNotification('❤️ Thank you for choosing to help your community through donations!');
  } else if (category === 'products-for-free') {
    showNotification('🆓 Discover free products from generous community members!');
  } else if (category === 'manure') {
    showNotification('🌱 Perfect for your home garden! Fresh organic manure from local farms.');
  }
}

// Delivery Options Management
document.getElementById('delivery-partner').addEventListener('change', function() {
  const deliveryCharges = document.getElementById('delivery-charges');
  if (this.checked) {
    deliveryCharges.classList.remove('hidden');
  } else if (!document.getElementById('home-delivery').checked) {
    deliveryCharges.classList.add('hidden');
  }
});

document.getElementById('home-delivery').addEventListener('change', function() {
  const deliveryCharges = document.getElementById('delivery-charges');
  if (this.checked) {
    deliveryCharges.classList.remove('hidden');
  } else if (!document.getElementById('delivery-partner').checked) {
    deliveryCharges.classList.add('hidden');
  }
});

// Product Management
document.getElementById('product-category').addEventListener('change', function() {
  const category = this.value;
  const subcategorySelect = document.getElementById('product-subcategory');
  const priceField = document.getElementById('product-price');
  const livestockFields = document.getElementById('livestock-fields');
  const poultryFields = document.getElementById('poultry-fields');

  // Reset subcategory
  subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';

  // Hide all special fields
  livestockFields.classList.add('hidden');
  poultryFields.classList.add('hidden');

  // Show/hide price field based on category
  if (category === 'products-for-free' || category === 'donate') {
    priceField.style.display = 'none';
    priceField.required = false;
    priceField.value = '0';
  } else {
    priceField.style.display = 'block';
    priceField.required = true;
  }

  // Show special fields for livestock and poultry
  if (category === 'livestock') {
    livestockFields.classList.remove('hidden');
  } else if (category === 'poultry') {
    poultryFields.classList.remove('hidden');
  }

  // Populate subcategories
  if (category && subcategories[category]) {
    subcategories[category].forEach(sub => {
      const option = document.createElement('option');
      option.value = sub.toLowerCase().replace(/\s+/g, '-');
      option.textContent = sub;
      subcategorySelect.appendChild(option);
    });
  }
});

document.getElementById('product-form').addEventListener('submit', function(e) {
  e.preventDefault();

  if (!currentUser) {
    showNotification('Please login first to add products!');
    return;
  }

  const category = document.getElementById('product-category').value;
  const subcategory = document.getElementById('product-subcategory').value;
  const name = document.getElementById('product-name').value;
  const description = document.getElementById('product-description').value;
  const price = (category === 'products-for-free' || category === 'donate') ? 0 : parseFloat(document.getElementById('product-price').value);
  const unit = document.getElementById('product-unit').value;
  const quantity = parseInt(document.getElementById('product-quantity').value);
  const selfPickup = document.getElementById('self-pickup').checked;
  const homeDelivery = document.getElementById('home-delivery').checked;
  const deliveryPartner = document.getElementById('delivery-partner').checked;
  const deliveryCharge = document.getElementById('delivery-charge').value || 0;

  // Collect livestock specific data
  const livestockData = category === 'livestock' ? {
    age: document.getElementById('animal-age').value,
    gender: document.getElementById('animal-gender').value,
    pregnancyStatus: document.getElementById('pregnancy-status').value,
    milkYield: document.getElementById('milk-yield').value,
    healthStatus: document.getElementById('animal-health').value
  } : null;

  // Collect poultry specific data
  const poultryData = category === 'poultry' ? {
    ageMonths: document.getElementById('bird-age-months').value,
    birdType: document.getElementById('bird-type').value,
    purpose: document.getElementById('bird-purpose').value,
    eggProduction: document.getElementById('egg-production').value
  } : null;

  const product = {
    id: 'prod_' + Date.now(),
    name,
    description,
    price,
    unit,
    quantity,
    category,
    subcategory,
    sellerId: currentUser.id,
    sellerName: currentUser.name,
    sellerPhone: currentUser.phone,
    pincode: currentUser.pincode,
    deliveryOptions: {
      selfPickup,
      homeDelivery,
      deliveryPartner
    },
    deliveryCharge: parseFloat(deliveryCharge),
    livestockData,
    poultryData,
    images: [],
    rating: Math.random() * 2 + 3,
    reviews: [],
    dateAdded: new Date().toISOString()
  };

  products.push(product);
  userProducts.push(product);

  document.getElementById('product-form').reset();
  document.getElementById('delivery-charges').classList.add('hidden');

  if (category === 'donate') {
    showNotification('❤️ Thank you for your generous donation! Your kindness will help many in need.');
  } else if (category === 'products-for-free') {
    showNotification('🆓 Amazing! Your free product will bring joy to someone in your community!');
  } else if (category === 'manure') {
    showNotification('🌱 Great! Your organic manure will help fellow gardeners grow healthy plants!');
  } else if (category === 'livestock') {
    showNotification('🐄 Your livestock listing is now live! Buyers can see all the important details.');
  } else if (category === 'poultry') {
    showNotification('🐓 Your poultry listing is ready! Complete with age and purpose details.');
  } else {
    showNotification('🎉 Product added successfully! It\'s now available in the marketplace.');
  }

  displayProducts(products);
});

// Camera functionality for product photos
function captureProductImage() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',  // Use back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    })
    .then(stream => {
      showCameraModal(stream);
    })
    .catch(error => {
      console.error('Camera error:', error);
      showNotification('📷 Camera not available. Please select an image file instead.');
    });
  } else {
    showNotification('📷 Camera not supported on this device.');
  }
}

function showCameraModal(stream) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content camera-modal">
      <div class="camera-header">
        <h3>📷 Capture Product Image</h3>
        <button onclick="closeCameraModal()" class="close">&times;</button>
      </div>
      <video id="camera-video" autoplay playsinline></video>
      <canvas id="camera-canvas" style="display: none;"></canvas>
      <div class="camera-controls">
        <button class="btn-secondary" onclick="closeCameraModal()">Cancel</button>
        <button class="btn-primary" onclick="capturePhoto()">📸 Capture</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const video = document.getElementById('camera-video');
  video.srcObject = stream;

  window.currentCameraStream = stream;
  window.cameraModal = modal;
}

function capturePhoto() {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('camera-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });

    // Add to product form
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    document.getElementById('product-image').files = dataTransfer.files;

    showNotification('📸 Photo captured successfully!');
    closeCameraModal();
  }, 'image/jpeg', 0.8);
}

function closeCameraModal() {
  if (window.currentCameraStream) {
    window.currentCameraStream.getTracks().forEach(track => track.stop());
  }
  if (window.cameraModal) {
    window.cameraModal.remove();
  }
}

function displayProducts(productsToShow = products) {
  const container = document.getElementById('products');
  container.innerHTML = '';

  if (productsToShow.length === 0) {
    container.innerHTML = '<div class="no-products"><h3>No products found in this area</h3><p>Be the first to add products in your locality!</p></div>';
    return;
  }

  productsToShow.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';

    const priceDisplay = product.category === 'products-for-free' 
      ? '<div class="product-price">🆓 FREE</div>' 
      : product.category === 'donate'
      ? '<div class="product-price">❤️ DONATION</div>'
      : `<div class="product-price">₹${product.price}/${product.unit}</div>`;

    // Build special information display
    let specialInfo = '';
    if (product.livestockData) {
      const livestock = product.livestockData;
      specialInfo = `
        <div class="special-info">
          ${livestock.age ? `<strong>Age:</strong> ${livestock.age} years<br>` : ''}
          ${livestock.gender ? `<strong>Gender:</strong> ${livestock.gender}<br>` : ''}
          ${livestock.pregnancyStatus ? `<strong>Status:</strong> ${livestock.pregnancyStatus}<br>` : ''}
          ${livestock.milkYield ? `<strong>Milk Yield:</strong> ${livestock.milkYield} L/day<br>` : ''}
        </div>
      `;
    } else if (product.poultryData) {
      const poultry = product.poultryData;
      specialInfo = `
        <div class="special-info">
          ${poultry.ageMonths ? `<strong>Age:</strong> ${poultry.ageMonths} months<br>` : ''}
          ${poultry.birdType ? `<strong>Type:</strong> ${poultry.birdType}<br>` : ''}
          ${poultry.purpose ? `<strong>Purpose:</strong> ${poultry.purpose}<br>` : ''}
          ${poultry.eggProduction ? `<strong>Eggs:</strong> ${poultry.eggProduction}/week<br>` : ''}
        </div>
      `;
    }

    const deliveryInfo = [];
    if (product.deliveryOptions.selfPickup) deliveryInfo.push('🚶 Self Pickup');
    if (product.deliveryOptions.homeDelivery) deliveryInfo.push('🚚 Home Delivery');
    if (product.deliveryOptions.deliveryPartner) deliveryInfo.push('🤝 Partner Delivery');

    productCard.innerHTML = `
      <div class="product-image-placeholder" style="background: linear-gradient(45deg, #e8f5e8, #d4edda); height: 200px; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
        ${getCategoryIcon(product.category)}
      </div>
      <div class="product-details">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        ${priceDisplay}
        <div class="seller-info">
          <strong>Seller:</strong> ${product.sellerName}<br>
          <strong>Available:</strong> ${product.quantity} ${product.unit}<br>
          <strong>Rating:</strong> ${'⭐'.repeat(Math.floor(product.rating))} (${product.rating.toFixed(1)})<br>
          ${product.deliveryCharge > 0 ? `<strong>Delivery:</strong> ₹${product.deliveryCharge}<br>` : ''}
        </div>
        ${specialInfo}
        <div class="delivery-info">
          <small>${deliveryInfo.join(' • ')}</small>
        </div>
        <div class="product-actions">
          ${product.category !== 'donate' ? `<button class="btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>` : `<button class="btn-primary" onclick="makeDonation('${product.id}')">Donate Now</button>`}
          <button class="btn-secondary" onclick="chatWithSeller('${product.sellerId}')">Chat with Seller</button>
        </div>
      </div>
    `;
    container.appendChild(productCard);
  });
}

function getCategoryIcon(category) {
  const icons = {
    fruits: '🍎',
    vegetables: '🥕',
    'homemade-food': '🍯',
    'organic-oils': '🫒',
    pickles: '🥒',
    plants: '🌱',
    grains: '🌾',
    dairy: '🥛',
    livestock: '🐄',
    poultry: '🐓',
    crafts: '🔨',
    'farming-supplies': '🪴',
    manure: '🌱',
    donate: '❤️',
    'products-for-free': '🆓'
  };
  return icons[category] || '🛒';
}

// Enhanced Cart Functions
function addToCart(productId) {
  if (!currentUser) {
    showNotification('Please login to add items to cart!');
    return;
  }

  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  updateCartDisplay();
  showNotification(`${product.name} added to cart! 🛒`);
}

function updateCartQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  updateCartDisplay();
}

function updateCartDisplay() {
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartItems.innerHTML = '';

  // Group cart items by seller
  const groupedCart = cart.reduce((groups, item) => {
    const key = item.sellerId;
    if (!groups[key]) {
      groups[key] = {
        seller: item.sellerName,
        items: [],
        totalAmount: 0,
        deliveryCharge: item.deliveryCharge || 0
      };
    }
    groups[key].items.push(item);
    groups[key].totalAmount += item.price * item.quantity;
    return groups;
  }, {});

  let grandTotal = 0;

  Object.values(groupedCart).forEach(group => {
    const sellerDiv = document.createElement('div');
    sellerDiv.className = 'seller-group';

    let groupHTML = `<h4>📦 ${group.seller}</h4>`;

    group.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      groupHTML += `
        <div class="cart-item">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h5>${item.name}</h5>
              <p>₹${item.price}/${item.unit}</p>
            </div>
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
              <span style="margin: 0 1rem; font-weight: bold;">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
            <span><strong>₹${itemTotal}</strong></span>
            <button onclick="removeFromCart('${item.id}')" style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">Remove</button>
          </div>
        </div>
      `;
    });

    const groupTotal = group.totalAmount + group.deliveryCharge;
    grandTotal += groupTotal;

    groupHTML += `
      <div style="border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>₹${group.totalAmount}</span>
        </div>
        ${group.deliveryCharge > 0 ? `
        <div style="display: flex; justify-content: space-between;">
          <span>Delivery:</span>
          <span>₹${group.deliveryCharge}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>Group Total:</span>
          <span>₹${groupTotal}</span>
        </div>
      </div>
    `;

    sellerDiv.innerHTML = groupHTML;
    cartItems.appendChild(sellerDiv);
  });

  cartTotal.textContent = grandTotal.toFixed(2);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartDisplay();
  showNotification('Item removed from cart');
}

function toggleCart() {
  const cartSidebar = document.getElementById('cart');
  cartSidebar.classList.toggle('hidden');
  cartSidebar.classList.toggle('active');
}

// Donation Function
function makeDonation(productId) {
  if (!currentUser) {
    showNotification('Please login to make donations!');
    return;
  }

  const product = products.find(p => p.id === productId);
  showNotification(`❤️ Thank you for your generous heart! Your donation of ${product.name} will be processed. We'll connect you with those in need.`);
}

// Payment Functions
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', function() {
    const paymentDetails = document.getElementById('payment-details');
    const methodDetails = document.querySelectorAll('.payment-method-details');

    methodDetails.forEach(detail => detail.classList.add('hidden'));

    if (this.value !== 'cod') {
      paymentDetails.classList.remove('hidden');
      const selectedMethod = document.getElementById(`${this.value}-details`);
      if (selectedMethod) {
        selectedMethod.classList.remove('hidden');
      }
    } else {
      paymentDetails.classList.add('hidden');
    }
  });
});

// Enhanced Checkout Functions
function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty! Add some products first.');
    return;
  }

  document.getElementById('checkout-modal').classList.remove('hidden');

  const checkoutItems = document.getElementById('checkout-items');
  checkoutItems.innerHTML = '<h4>🛒 Order Summary:</h4>';

  // Group by seller for checkout display
  const groupedCart = cart.reduce((groups, item) => {
    const key = item.sellerId;
    if (!groups[key]) {
      groups[key] = {
        seller: item.sellerName,
        items: [],
        totalAmount: 0,
        deliveryCharge: item.deliveryCharge || 0
      };
    }
    groups[key].items.push(item);
    groups[key].totalAmount += item.price * item.quantity;
    return groups;
  }, {});

  let grandTotal = 0;

  Object.values(groupedCart).forEach(group => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'grouped-cart';

    let groupHTML = `<h5>📦 From: ${group.seller}</h5>`;

    group.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      groupHTML += `
        <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
          <span>${item.name} × ${item.quantity}</span>
          <span>₹${itemTotal}</span>
        </div>
      `;
    });

    const groupTotal = group.totalAmount + group.deliveryCharge;
    grandTotal += groupTotal;

    groupHTML += `
      <div style="border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>₹${group.totalAmount}</span>
        </div>
        ${group.deliveryCharge > 0 ? `
        <div style="display: flex; justify-content: space-between;">
          <span>Delivery:</span>
          <span>₹${group.deliveryCharge}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>Group Total:</span>
          <span>₹${groupTotal}</span>
        </div>
      </div>
    `;

    groupDiv.innerHTML = groupHTML;
    checkoutItems.appendChild(groupDiv);
  });

  const totalDiv = document.createElement('div');
  totalDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; padding: 1rem 0; font-weight: bold; font-size: 1.3rem; border-top: 2px solid #28a745; color: #28a745;">
      <span>Grand Total:</span>
      <span>₹${grandTotal.toFixed(2)}</span>
    </div>
  `;
  checkoutItems.appendChild(totalDiv);
}

function placeOrder() {
  const address = document.getElementById('delivery-address').value;
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  if (!address) {
    showNotification('Please enter delivery address!');
    return;
  }

  // Validate payment details if not COD
  if (paymentMethod !== 'cod') {
    if (!validatePaymentDetails(paymentMethod)) {
      return;
    }
  }

  const order = {
    id: 'order_' + Date.now(),
    userId: currentUser.id,
    items: [...cart],
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity) + (item.deliveryCharge || 0), 0),
    address,
    paymentMethod,
    status: 'confirmed',
    orderDate: new Date().toISOString()
  };

  orders.push(order);
  cart = [];

  updateCartDisplay();
  closeModal('checkout-modal');
  toggleCart();

  showSuccessMessage(order);
}

function validatePaymentDetails(method) {
  switch (method) {
    case 'upi':
      const upiId = document.getElementById('upi-id').value;
      if (!upiId || !upiId.includes('@')) {
        showNotification('Please enter a valid UPI ID!');
        return false;
      }
      break;
    case 'card':
      const cardNumber = document.getElementById('card-number').value;
      const expiry = document.getElementById('expiry').value;
      const cvv = document.getElementById('cvv').value;
      if (!cardNumber || cardNumber.length < 16 || !expiry || !cvv) {
        showNotification('Please fill all card details!');
        return false;
      }
      break;
    case 'netbanking':
      const bank = document.getElementById('bank-select').value;
      if (!bank) {
        showNotification('Please select your bank!');
        return false;
      }
      break;
    case 'wallet':
      const wallet = document.getElementById('wallet-select').value;
      if (!wallet) {
        showNotification('Please select your wallet!');
        return false;
      }
      break;
  }
  return true;
}

function showSuccessMessage(order) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="success-message">
        <div class="success-icon">🎉</div>
        <h2>YAY! Order Placed Successfully!        </h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Total Amount:</strong> ₹${order.total}</p>
        <p>Thank you for choosing Home Harvest Market!</p>
        <p>💚 You're supporting local farmers and contributing to a sustainable community.</p>
        <p>📞 You will receive a confirmation call within 30 minutes.</p>
        <p>🚚 Our delivery partners will ensure fresh products reach you safely.</p>
        <button class="btn-primary" onclick="this.closest('.modal').remove()" style="margin-top: 1rem;">Continue Shopping</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  setTimeout(() => {
    modal.remove();
  }, 10000);
}

// Chat Functions
function chatWithSeller(sellerId) {
  if (!currentUser) {
    showNotification('Please login to chat!');
    return;
  }

  document.getElementById('chat-modal').classList.remove('hidden');
  showNotification('💬 Chat feature will connect you directly with sellers for better coordination!');
}

function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();

  if (message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
      <div style="margin-bottom: 1rem; padding: 0.5rem; background: #e8f5e8; border-radius: 8px;">
        <strong>You:</strong> ${message}
        <span style="float: right; font-size: 0.8rem; color: #666;">${new Date().toLocaleTimeString()}</span>
      </div>
    `;
    chatMessages.appendChild(messageDiv);

    messageInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Dashboard Functions
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(tabName).classList.remove('hidden');
  event.target.classList.add('active');

  if (tabName === 'my-orders') {
    displayUserOrders();
  } else if (tabName === 'my-products') {
    displayUserProducts();
  }
}

function displayUserOrders() {
  const ordersList = document.getElementById('orders-list');
  const userOrders = orders.filter(order => order.userId === currentUser?.id);

  if (userOrders.length === 0) {
    ordersList.innerHTML = '<p>No orders yet. Start shopping and support local farmers! 🌱</p>';
    return;
  }

  ordersList.innerHTML = '';
  userOrders.forEach(order => {
    const orderDiv = document.createElement('div');
    orderDiv.innerHTML = `
      <div style="background: white; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <h4>📦 Order #${order.id}</h4>
        <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p><strong>Status:</strong> <span style="color: green;">✅ ${order.status}</span></p>
        <p><strong>Items:</strong> ${order.items.length} items</p>
        <p><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
      </div>
    `;
    ordersList.appendChild(orderDiv);
  });
}

function displayUserProducts() {
  const productsList = document.getElementById('seller-products-list');

  if (userProducts.length === 0) {
    productsList.innerHTML = '<p>No products added yet. Add your first product and start earning! 💰</p>';
    return;
  }

  productsList.innerHTML = '';
  userProducts.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.innerHTML = `
      <div style="background: white; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <h4>${getCategoryIcon(product.category)} ${product.name}</h4>
        <p><strong>Price:</strong> ${product.category === 'free' ? '🆓 FREE' : product.category === 'donate' ? '❤️ DONATION' : `₹${product.price}/${product.unit}`}</p>
        <p><strong>Available:</strong> ${product.quantity} ${product.unit}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <button onclick="editProduct('${product.id}')" class="btn-secondary" style="margin-right: 1rem;">Edit</button>
        <button onclick="deleteProduct('${product.id}')" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Delete</button>
      </div>
    `;
    productsList.appendChild(productDiv);
  });
}

function editProduct(productId) {
  showNotification('Edit functionality coming soon! For now, you can delete and re-add the product.');
}

function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    products = products.filter(p => p.id !== productId);
    userProducts = userProducts.filter(p => p.id !== productId);
    displayProducts();
    displayUserProducts();
    showNotification('Product deleted successfully!');
  }
}

// Navigation Functions
function showHome() {
  document.getElementById('categories').scrollIntoView();
}

function showCategories() {
  document.getElementById('categories').scrollIntoView();
}

function showAddProduct() {
  if (!currentUser) {
    showNotification('Please login first to add products!');
    showLogin();
    return;
  }

  setUserRole('seller');
  document.getElementById('add-product').scrollIntoView();
}

function showDashboard() {
  if (!currentUser) {
    showNotification('Please login first!');
    showLogin();
    return;
  }

  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('dashboard').scrollIntoView();
}

// Utility Functions
function sortProducts() {
  const sortBy = document.getElementById('sort-by').value;
  let sortedProducts = [...products];

  switch (sortBy) {
    case 'price-low':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      sortedProducts.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
    default:
      sortedProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      break;
  }

  displayProducts(sortedProducts);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 1.5rem 2rem;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    max-width: 400px;
    animation: slideInBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-weight: 600;
    font-size: 0.95rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  `;

  // Add icon based on message content
  let icon = '🎉';
  if (message.includes('error') || message.includes('failed')) icon = '❌';
  else if (message.includes('success') || message.includes('added')) icon = '✅';
  else if (message.includes('cart')) icon = '🛒';
  else if (message.includes('order')) icon = '📦';
  else if (message.includes('payment')) icon = '💳';
  else if (message.includes('location')) icon = '📍';

  notification.innerHTML = `<span style="margin-right: 0.5rem; font-size: 1.2rem;">${icon}</span>${message}`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutBounce 0.4s ease-in';
    setTimeout(() => notification.remove(), 400);
  }, 4000);
}

// Add enhanced visual effects
function addVisualEffects() {
  // Add floating particles
  const particleContainer = document.createElement('div');
  particleContainer.className = 'particles';
  particleContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  `;
  
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: floatUp ${Math.random() * 10 + 10}s infinite linear;
      left: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 10}s;
    `;
    particleContainer.appendChild(particle);
  }
  
  document.body.appendChild(particleContainer);
}

// Initialize visual effects
document.addEventListener('DOMContentLoaded', () => {
  addVisualEffects();
});

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Event Listeners
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  currentUser = {
    id: 'user_' + Date.now(),
    name: 'Community Member',
    phone: document.getElementById('login-phone').value,
    email: 'member@example.com',
    pincode: '110001'
  };
  handleSuccessfulLogin();
});

document.getElementById('signup-form').addEventListener('submit', function(e) {
  e.preventDefault();
  currentUser = {
    id: 'user_' + Date.now(),
    name: document.getElementById('signup-name').value,
    phone: document.getElementById('signup-phone').value,
    email: document.getElementById('signup-email').value,
    pincode: document.getElementById('signup-pincode').value
  };
  handleSuccessfulLogin();
});

// Card number formatting
document.getElementById('card-number').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  e.target.value = formattedValue;
});

// Expiry formatting
document.getElementById('expiry').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  e.target.value = value;
});

// Initialize app with enhanced sample data
function initializeApp() {
  const sampleProducts = [
    {
      id: 'prod_1',
      name: 'Fresh Organic Tomatoes',
      description: 'Locally grown organic tomatoes, pesticide-free and full of flavor',
      price: 60,
      unit: 'kg',
      quantity: 50,
      category: 'vegetables',
      subcategory: 'tomatoes',
      sellerId: 'seller_1',
      sellerName: 'Ramesh Kumar',
      sellerPhone: '+91-9876543210',
      pincode: '110001',
      deliveryOptions: { selfPickup: true, homeDelivery: true, deliveryPartner: true },
      deliveryCharge: 25,
      rating: 4.5,
      dateAdded: new Date().toISOString()
    },
    {
      id: 'prod_2',
      name: 'Pure Desi Ghee',
      description: 'Traditional cow ghee made at home with love and care',
      price: 800,
      unit: 'kg',
      quantity: 10,
      category: 'dairy',
      subcategory: 'ghee',
      sellerId: 'seller_2',
      sellerName: 'Sunita Devi',
      sellerPhone: '+91-9876543211',
      pincode: '110001',
      deliveryOptions: { selfPickup: true, homeDelivery: false, deliveryPartner: true },
      deliveryCharge: 40,
      rating: 4.8,
      dateAdded: new Date().toISOString()
    },
    {
      id: 'prod_3',
      name: 'Surplus Garden Vegetables',
      description: 'Fresh mixed vegetables from my kitchen garden - sharing with community',
      price: 0,
      unit: 'bag',
      quantity: 5,
      category: 'products-for-free',
      subcategory: 'surplus-vegetables',
      sellerId: 'seller_3',
      sellerName: 'Priya Sharma',
      sellerPhone: '+91-9876543212',
      pincode: '110001',
      deliveryOptions: { selfPickup: true, homeDelivery: false, deliveryPartner: true },
      deliveryCharge: 30,
      rating: 4.9,
      dateAdded: new Date().toISOString()
    },
    {
      id: 'prod_4',
      name: 'Food for Needy Families',
      description: 'Cooked meals and grocery items for families in need - please help distribute',
      price: 0,
      unit: 'package',
      quantity: 20,
      category: 'donate',
      subcategory: 'food-donation',
      sellerId: 'seller_4',
      sellerName: 'Rajesh Gupta',
      sellerPhone: '+91-9876543213',
      pincode: '110001',
      deliveryOptions: { selfPickup: true, homeDelivery: true, deliveryPartner: true },
      deliveryCharge: 0,
      rating: 5.0,
      dateAdded: new Date().toISOString()
    },
    {
      id: 'prod_5',
      name: 'Fresh Goat Milk',
      description: 'Pure, fresh goat milk from healthy goats, collected daily',
      price: 120,
      unit: 'liter',
      quantity: 10,
      category: 'dairy',
      subcategory: 'goat-milk',
      sellerId: 'seller_5',
      sellerName: 'Meera Devi',
      sellerPhone: '+91-9876543214',
      pincode: '110001',
      deliveryOptions: { selfPickup: true, homeDelivery: true, deliveryPartner: false },
      deliveryCharge: 20,
      rating: 4.7,
      dateAdded: new Date().toISOString()
    },
    {
      id: 'prod_6',
      name: 'Milking Cow - Jersey Cross',
      description: '4-year-old healthy Jersey cross cow, giving 15L milk daily',
      price: 45000,
      unit: 'piece',
      quantity: 1,
      category: 'livestock',
      subcategory: 'cows-milking',
      sellerId: 'seller_6',
      sellerName: 'Ramesh Singh',
      sellerPhone: '+91-9876543215',
      pincode: '110001',
      deliveryOptions: { selfPickup: true, homeDelivery: false, deliveryPartner: false },
      deliveryCharge: 0,
      livestockData: {
        age: '4',
        gender: 'female',
        pregnancyStatus: 'not-pregnant',
        milkYield: '15',
        healthStatus: 'Healthy, vaccinated, good milk producer'
      },
      rating: 4.8,
      dateAdded: new Date().toISOString()
    },
    {
      id: 'prod_7',
      name: 'Desi Chickens - 6 months',
      description: 'Healthy desi chickens, perfect for backyard farming',
      price: 800,
      unit: 'piece',
      quantity: 12,
      category: 'poultry',
      subcategory: 'desi-chickens-3-6-months',
      sellerId: 'seller_7',
      sellerName: 'Suresh Kumar',
      sellerPhone: '+91-9876543216',
      pincode: '110001',
      deliveryOptions: { selfPickup: true, homeDelivery: true, deliveryPartner: true },
      deliveryCharge: 50,
      poultryData: {
        ageMonths: '6',
        birdType: 'desi',
        purpose: 'eggs',
        eggProduction: '4'
      },
      rating: 4.6,
      dateAdded: new Date().toISOString()
    },
    {
      id: 'prod_8',
      name: 'Fresh Cow Dung Manure',
      description: 'Well-composted cow dung manure, perfect for home gardens',
      price: 15,
      unit: 'kg',
      quantity: 100,
      category: 'manure',
      subcategory: 'fresh-cow-dung',
      sellerId: 'seller_8',
      sellerName: 'Krishna Prasad',
      sellerPhone: '+91-9876543217',
      pincode: '110001',
      deliveryOptions: { selfPickup: true, homeDelivery: true, deliveryPartner: true },
      deliveryCharge: 40,
      rating: 4.5,
      dateAdded: new Date().toISOString()
    }
  ];

  products.push(...sampleProducts);
  displayProducts();

  showNotification('🌱 Welcome to Home Harvest Market! Discover fresh local products and connect with your community!');
}

// Camera functionality for product photos
function captureProductImage() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',  // Use back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    })
    .then(stream => {
      showCameraModal(stream);
    })
    .catch(error => {
      console.error('Camera error:', error);
      showNotification('📷 Camera not available. Please select an image file instead.');
    });
  } else {
    showNotification('📷 Camera not supported on this device.');
  }
}

function showCameraModal(stream) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content camera-modal">
      <div class="camera-header">
        <h3>📷 Capture Product Image</h3>
        <button onclick="closeCameraModal()" class="close">&times;</button>
      </div>
      <video id="camera-video" autoplay playsinline></video>
      <canvas id="camera-canvas" style="display: none;"></canvas>
      <div class="camera-controls">
        <button class="btn-secondary" onclick="closeCameraModal()">Cancel</button>
        <button class="btn-primary" onclick="capturePhoto()">📸 Capture</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const video = document.getElementById('camera-video');
  video.srcObject = stream;

  window.currentCameraStream = stream;
  window.cameraModal = modal;
}

function capturePhoto() {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('camera-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });

    // Add to product form
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    document.getElementById('product-image').files = dataTransfer.files;

    showNotification('📸 Photo captured successfully!');
    closeCameraModal();
  }, 'image/jpeg', 0.8);
}

function closeCameraModal() {
  if (window.currentCameraStream) {
    window.currentCameraStream.getTracks().forEach(track => track.stop());
  }
  if (window.cameraModal) {
    window.cameraModal.remove();
  }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);