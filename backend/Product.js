function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  try {
    const response = await fetch("http://localhost:5000/api/products");
    const products = await response.json();

    if (!products.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No products found.</p>
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
              View Details
            </a>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `<p>Failed to load products.</p>`;
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", renderProducts);