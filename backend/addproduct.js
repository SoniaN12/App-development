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
      const response = await fetch("http://localhost:5000/api/products", {
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
      if (formMessage) {
        formMessage.textContent = "Failed to add product.";
        formMessage.style.color = "#ff8f8f";
      }
      console.error(error);
    }
  });
}