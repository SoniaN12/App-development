const API_BASE = "http://localhost:5000/api";

console.log("app.js loaded");

/* ---------- helpers ---------- */
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/* ---------- add product ---------- */
function setupProductForm() {
  const form = document.getElementById("productForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameInput = document.getElementById("name");
    const descInput = document.getElementById("desc");
    const priceInput = document.getElementById("price");
    const imageInput = document.getElementById("image");
    const formMessage = document.getElementById("formMessage");

    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const price = parseFloat(priceInput.value);
    const image = imageInput.value.trim();

    if (!name || !description || !image || isNaN(price) || price < 0) {
      if (formMessage) {
        formMessage.textContent = "Please fill in all fields correctly.";
        formMessage.style.color = "#ff8f8f";
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          description,
          price,
          image
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      form.reset();

      if (formMessage) {
        formMessage.textContent = "Product added successfully.";
        formMessage.style.color = "#8dffb0";
      }
    } catch (error) {
      console.error(error);

      if (formMessage) {
        formMessage.textContent = "Failed to add product.";
        formMessage.style.color = "#ff8f8f";
      }
    }
  });
}

/* ---------- render products ---------- */
async function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    if (!products.length) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-box-open"></i>
          <p>No products found. Add some products first.</p>
        </div>
      `;
      return;
    }

    let html = "";

    products.forEach(function (product) {
      html += `
        <div class="card">
          <img
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            onerror="this.src='https://via.placeholder.com/400x300?text=No+Image';"
          />
          <h3>${escapeHTML(product.name)}</h3>
          <p>${escapeHTML(product.description)}</p>
          <div class="price">$${Number(product.price).toFixed(2)}</div>

          <div class="card-actions">
            <a class="btn" href="product.html?id=${product._id}">
              <i class="fa-solid fa-eye"></i>
              View Details
            </a>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Failed to load products.</p>
      </div>
    `;
  }
}

/* ---------- render single product ---------- */
async function renderProductDetail() {
  const container = document.getElementById("productDetail");
  if (!container) return;

  const productId = getQueryParam("id");

  if (!productId) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p>Product not found.</p>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    const product = await response.json();

    if (!response.ok || !product._id) {
      throw new Error("Product not found");
    }

    container.innerHTML = `
      <div class="glass-card" style="padding:24px;">
        <div class="product-detail-layout">
          <div class="product-detail-image-wrap">
            <img
              src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}"
              class="product-detail-image"
              onerror="this.src='https://via.placeholder.com/400x300?text=No+Image';"
            />
          </div>

          <div class="product-detail-info">
            <h2>${escapeHTML(product.name)}</h2>
            <p>${escapeHTML(product.description)}</p>
            <div class="product-detail-price">$${Number(product.price).toFixed(2)}</div>

            <button class="btn" id="buyBtn">
              <i class="fa-solid fa-credit-card"></i>
              Buy
            </button>

            <div id="paypal-button-container" class="paypal-wrap" style="display:none;"></div>
          </div>
        </div>
      </div>
    `;

    const buyBtn = document.getElementById("buyBtn");
    const paypalContainer = document.getElementById("paypal-button-container");

    buyBtn.addEventListener("click", function () {
      buyBtn.style.display = "none";
      paypalContainer.style.display = "block";

      if (typeof paypal === "undefined") {
        alert("PayPal SDK failed to load. Check your PayPal client ID.");
        return;
      }

      paypal.Buttons({
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [
              {
                description: product.name,
                amount: {
                  value: Number(product.price).toFixed(2)
                }
              }
            ]
          });
        },

        onApprove: async function (data, actions) {
          const details = await actions.order.capture();

          const saveResponse = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              productId: product._id,
              productName: product.name,
              price: product.price,
              payment: details.id,
              status: "Paid"
            })
          });

          if (!saveResponse.ok) {
            alert("Payment succeeded, but saving the order failed.");
            return;
          }

          window.location.href = "success.html";
        },

        onError: function (err) {
          console.error(err);
          alert("Payment failed.");
        }
      }).render("#paypal-button-container");
    });
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p>Failed to load product details.</p>
      </div>
    `;
  }
}

/* ---------- render orders ---------- */
async function renderOrders() {
  const container = document.getElementById("ordersContainer");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/orders`);
    const orders = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    if (!orders.length) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-receipt"></i>
          <p>No orders yet. Buy a product from the Products page.</p>
        </div>
      `;
      return;
    }

    let html = "";

    orders.forEach(function (order) {
      html += `
        <div class="order-card">
          <h3>${escapeHTML(order.productName)}</h3>
          <p><strong>Price:</strong> $${Number(order.price).toFixed(2)}</p>
          <p><strong>Payment ID:</strong> ${escapeHTML(order.payment)}</p>
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
          <div class="status-badge">${escapeHTML(order.status)}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Failed to load orders.</p>
      </div>
    `;
  }
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", function () {
  setupProductForm();
  renderProducts();
  renderProductDetail();
  renderOrders();
});