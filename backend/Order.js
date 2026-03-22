function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function renderOrders() {
  const container = document.getElementById("ordersContainer");
  if (!container) return;

  try {
    const response = await fetch("http://localhost:5000/api/orders");
    const orders = await response.json();

    if (!orders.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No orders yet. Buy a product first.</p>
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
          <p><strong>Status:</strong> ${escapeHTML(order.status)}</p>
          <p><strong>Payment ID:</strong> ${escapeHTML(order.payment)}</p>
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `<p>Failed to load orders.</p>`;
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", renderOrders);