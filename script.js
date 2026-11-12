
// 1. Get HTML elements

let productList = document.getElementById("product-list");
let searchInput = document.getElementById("search-input");
let categoryButtons = document.querySelectorAll(".category-btn");

let cartList = document.getElementById("cart-list");
let cartCount = document.getElementById("cart-count");
let totalPrice = document.getElementById("total-price");
let noProducts = document.getElementById("no-products");


// 2. Create variables

let products = [];
let selectedCategory = "All";

let cart = JSON.parse(localStorage.getItem("cart")) || [];


// 3. Load products using Fetch API

async function loadProducts() {

    try {

        let response = await fetch("products.json");

        products = await response.json();

        displayProducts(products);
        displayCart();

    } catch (error) {

        productList.innerHTML = "Unable to load products.";

        console.log("Error loading products:", error);

    }

}


// 4. Display products

function displayProducts(productArray) {

    productList.innerHTML = "";

    if (productArray.length === 0) {

        noProducts.style.display = "block";

    } else {

        noProducts.style.display = "none";

    }

    productArray.forEach(function(product) {

        let productCard = document.createElement("div");

        productCard.className = "product-card";

        // Check whether product is already in cart

        let cartItem = cart.find(function(item) {

            return item.id === product.id;

        });

        // Create product card

        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">

            <h3>${product.name}</h3>

            <p>${product.category}</p>

            <p class="price">₹${product.price}</p>

            <p class="original-price">₹${product.originalPrice}</p>

            <p>⭐ ${product.rating}</p>
        `;

        // If product is already in cart

        if (cartItem) {

            productCard.innerHTML += `
                <div class="quantity-buttons">

                    <button class="minus-btn" data-id="${product.id}">-</button>

                    <span>${cartItem.quantity}</span>

                    <button class="plus-btn" data-id="${product.id}">+</button>

                </div>
            `;

        } else {

            // If product is not in cart

            productCard.innerHTML += `
                <button class="add-btn" data-id="${product.id}">
                    Add to Cart
                </button>
            `;

        }

        productList.appendChild(productCard);

    });

}


// 5. Search and category filter

function filterProducts() {

    let searchText = searchInput.value.toLowerCase();

    let filteredProducts = products.filter(function(product) {

        let matchesSearch = product.name.toLowerCase().includes(searchText);

        let matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });

    displayProducts(filteredProducts);

}


// 6. Search event

searchInput.addEventListener("input", function() {

    filterProducts();

});


// 7. Category button events

categoryButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        selectedCategory = button.dataset.category;

        categoryButtons.forEach(function(btn) {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        filterProducts();

    });

});


// 8. Add product to cart

function addToCart(productId) {

    let existingProduct = cart.find(function(item) {

        return item.id === productId;

    });

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({
            id: productId,
            quantity: 1
        });

    }

    saveCart();

    displayCart();

    filterProducts();

}


// 9. Display cart items

function displayCart() {

    cartList.innerHTML = "";

    let total = 0;

    cart.forEach(function(item) {

        let product = products.find(function(product) {

            return product.id === item.id;

        });

        if (!product) {
            return;
        }

        let itemTotal = product.price * item.quantity;

        total = total + itemTotal;

        let cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div>
                <h3>${product.name}</h3>
                <p>₹${product.price} x ${item.quantity}</p>
            </div>

            <div class="quantity-buttons">

                <button class="minus-btn" data-id="${item.id}">-</button>

                <span>${item.quantity}</span>

                <button class="plus-btn" data-id="${item.id}">+</button>

                <button class="remove-btn" data-id="${item.id}">
                    Remove
                </button>

            </div>
        `;

        cartList.appendChild(cartItem);

    });

    totalPrice.textContent = total;

    updateCartCount();

}


// 10. Update quantity

function updateCart(productId, change) {

    let cartItem = cart.find(function(item) {

        return item.id === productId;

    });

    if (cartItem) {

        cartItem.quantity = cartItem.quantity + change;

        if (cartItem.quantity <= 0) {

            removeFromCart(productId);

            return;

        }

    }

    saveCart();

    displayCart();

    filterProducts();

}


// 11. Remove product from cart

function removeFromCart(productId) {

    cart = cart.filter(function(item) {

        return item.id !== productId;

    });

    saveCart();

    displayCart();

    filterProducts();

}


// 12. Save cart in localStorage

function saveCart() {

    localStorage.setItem("cart", JSON.stringify(cart));

}


// 13. Update cart count

function updateCartCount() {

    let count = cart.reduce(function(total, item) {

        return total + item.quantity;

    }, 0);

    cartCount.textContent = count;

}


// 14. Handle button clicks

document.addEventListener("click", function(event) {

    let productId = Number(event.target.dataset.id);

    if (event.target.classList.contains("add-btn")) {

        addToCart(productId);

    }

    if (event.target.classList.contains("plus-btn")) {

        updateCart(productId, 1);

    }

    if (event.target.classList.contains("minus-btn")) {

        updateCart(productId, -1);

    }

    if (event.target.classList.contains("remove-btn")) {

        removeFromCart(productId);

    }

});


// 15. Start application

loadProducts();
