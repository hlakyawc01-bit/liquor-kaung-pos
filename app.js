// ================================
// LIQUOR KAUNG POS - app.js
// ================================

const STORE = {
  products: "lk_products",
  sales: "lk_sales",
  user: "lk_logged_in"
};

let cart = [];

// ----------------
// START APP
// ----------------
window.onload = function () {
  if (localStorage.getItem(STORE.user) === "true") {
    showApp();
  } else {
    showLogin();
  }

  renderProducts();
  renderCart();
  renderReport();
};


// ----------------
// LOGIN
// ----------------
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter Username and Password");
    return;
  }

  // Demo login
  localStorage.setItem(STORE.user, "true");

  showApp();
}


// ----------------
// LOGOUT
// ----------------
function logout() {
  localStorage.removeItem(STORE.user);

  showLogin();
}


// ----------------
// SHOW LOGIN
// ----------------
function showLogin() {
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
}


// ----------------
// SHOW APP
// ----------------
function showApp() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  renderProducts();
  renderCart();
  renderReport();
}


// ----------------
// PAGE NAVIGATION
// ----------------
function showPage(pageId, button) {

  document.querySelectorAll(".page").forEach(function (page) {
    page.classList.add("hidden");
  });

  document.getElementById(pageId).classList.remove("hidden");

  document.querySelectorAll(".nav").forEach(function (nav) {
    nav.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  }

  if (pageId === "products") {
    renderProducts();
  }

  if (pageId === "report") {
    renderReport();
  }
}


// ================================
// PRODUCT FUNCTIONS
// ================================

// Get Products
function getProducts() {
  return JSON.parse(
    localStorage.getItem(STORE.products) || "[]"
  );
}


// Save Products
function setProducts(products) {
  localStorage.setItem(
    STORE.products,
    JSON.stringify(products)
  );
}


// SAVE PRODUCT
function saveProduct() {

  const code =
    document.getElementById("pcode").value.trim();

  const barcode =
    document.getElementById("pbarcode").value.trim();

  const name =
    document.getElementById("pname").value.trim();

  const price =
    Number(document.getElementById("pprice").value);

  const stock =
    Number(document.getElementById("pstock").value);


  if (!code || !name) {
    alert("Please enter Product Code and Product Name");
    return;
  }


  if (price < 0 || !Number.isFinite(price)) {
    alert("Please enter a valid price");
    return;
  }


  if (stock < 0 || !Number.isFinite(stock)) {
    alert("Please enter a valid stock");
    return;
  }


  let products = getProducts();

  const existingIndex = products.findIndex(function (p) {
    return p.code === code;
  });


  const product = {
    code: code,
    barcode: barcode,
    name: name,
    price: price,
    stock: stock
  };


  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }


  setProducts(products);


  // Clear inputs
  document.getElementById("pcode").value = "";
  document.getElementById("pbarcode").value = "";
  document.getElementById("pname").value = "";
  document.getElementById("pprice").value = "";
  document.getElementById("pstock").value = "";


  renderProducts();

  alert("Product Saved Successfully");
}


// ----------------
// RENDER PRODUCTS
// ----------------
function renderProducts() {

  const productList =
    document.getElementById("productList");

  if (!productList) return;


  const products = getProducts();


  if (products.length === 0) {

    productList.innerHTML = `
      <p style="color:#777">
        No products yet.
        Add a product above or restore demo products.
      </p>
    `;

    return;
  }


  productList.innerHTML = products
    .map(function (p) {

      return `
        <div class="productItem">

          <div>
            <b>${escapeHtml(p.name)}</b>
            <br>

            <small>
              Code: ${escapeHtml(p.code)}
              ${p.barcode ? " | Barcode: " + escapeHtml(p.barcode) : ""}
            </small>

            <br>

            <small>
              Price: ${money(p.price)} Ks
              | Stock: ${p.stock}
            </small>
          </div>

          <button
            class="remove"
            onclick="deleteProduct('${jsEscape(p.code)}')"
          >
            DELETE
          </button>

        </div>
      `;
    })
    .join("");
}


// ----------------
// DELETE PRODUCT
// ----------------
function deleteProduct(code) {

  if (!confirm("Delete this product?")) {
    return;
  }


  let products = getProducts();

  products = products.filter(function (p) {
    return p.code !== code;
  });


  setProducts(products);

  renderProducts();
}


// ================================
// CART FUNCTIONS
// ================================


// ADD BY CODE
function addByCode() {

  const input =
    document.getElementById("scan");

  const value =
    input.value.trim();


  if (!value) {
    alert("Enter Product Code or Barcode");
    return;
  }


  const products = getProducts();


  const product = products.find(function (p) {
    return (
      p.code === value ||
      p.barcode === value
    );
  });


  if (!product) {
    alert("Product not found");
    return;
  }


  if (product.stock <= 0) {
    alert("Out of stock");
    return;
  }


  const cartItem = cart.find(function (item) {
    return item.code === product.code;
  });


  if (cartItem) {

    if (cartItem.qty >= product.stock) {
      alert("Not enough stock");
      return;
    }

    cartItem.qty++;

  } else {

    cart.push({
      code: product.code,
      name: product.name,
      price: Number(product.price),
      qty: 1
    });

  }


  input.value = "";

  renderCart();
}


// ----------------
// RENDER CART
// ----------------
function renderCart() {

  const cartBox =
    document.getElementById("cart");

  const totalBox =
    document.getElementById("total");

  if (!cartBox || !totalBox) return;


  if (cart.length === 0) {

    cartBox.innerHTML = `
      <p style="color:#777">
        Cart is empty.
      </p>
    `;

    totalBox.textContent = "0";

    return;
  }


  cartBox.innerHTML = cart
    .map(function (item, index) {

      return `
        <div class="cartItem">

          <div class="cartName">

            <b>${escapeHtml(item.name)}</b>

            <br>

            <small>
              ${money(item.price)} Ks
              ×
              ${item.qty}
              =
              ${money(item.price * item.qty)} Ks
            </small>

          </div>


          <button
            class="qtyBtn"
            onclick="changeQty(${index}, -1)"
          >
            −
          </button>


          <b>${item.qty}</b>


          <button
            class="qtyBtn"
            onclick="changeQty(${index}, 1)"
          >
            +
          </button>


          <button
            class="remove"
            onclick="removeCartItem(${index})"
          >
            X
          </button>

        </div>
      `;
    })
    .join("");


  totalBox.textContent =
    money(getCartTotal());
}


// ----------------
// CHANGE QUANTITY
// ----------------
function changeQty(index, change) {

  const item = cart[index];

  if (!item) return;


  const products = getProducts();


  const product = products.find(function (p) {
    return p.code === item.code;
  });


  if (!product) return;


  const newQty =
    item.qty + change;


  if (newQty <= 0) {
    cart.splice(index, 1);

    renderCart();

    return;
  }


  if (newQty > product.stock) {
    alert("Not enough stock");

    return;
  }


  item.qty = newQty;

  renderCart();
}


// ----------------
// REMOVE CART ITEM
// ----------------
function removeCartItem(index) {

  cart.splice(index, 1);

  renderCart();
}


// ----------------
// CART TOTAL
// ----------------
function getCartTotal() {

  return cart.reduce(function (total, item) {

    return total +
      (item.price * item.qty);

  }, 0);
}


// ================================
// CHECKOUT
// ================================
function checkout() {

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }


  const products = getProducts();


  // Check stock again
  for (let i = 0; i < cart.length; i++) {

    const item = cart[i];

    const product = products.find(function (p) {
      return p.code === item.code;
    });


    if (!product || product.stock < item.qty) {

      alert(
        "Not enough stock for: " +
        item.name
      );

      return;
    }

  }


  // Reduce stock
  cart.forEach(function (item) {

    const product = products.find(function (p) {
      return p.code === item.code;
    });


    product.stock -= item.qty;

  });


  setProducts(products);


  const sales = getSales();


  const payment =
    document.getElementById("payment").value;


  const duplicate =
    document.getElementById("duplicate").checked;


  const sale = {

    id:
      "LK-" +
      Date.now(),

    date:
      new Date().toLocaleString(),

    payment:
      payment,

    duplicate:
      duplicate,

    items:
      JSON.parse(JSON.stringify(cart)),

    total:
      getCartTotal()

  };


  sales.unshift(sale);


  setSales(sales);


  generateReceipt(sale);


  // Clear cart
  cart = [];


  document.getElementById("duplicate").checked = false;


  renderCart();
  renderProducts();
  renderReport();


  document
    .getElementById("receiptModal")
    .classList
    .remove("hidden");

}


// ================================
// SALES FUNCTIONS
// ================================

function getSales() {

  return JSON.parse(
    localStorage.getItem(STORE.sales) || "[]"
  );

}


function setSales(sales) {

  localStorage.setItem(
    STORE.sales,
    JSON.stringify(sales)
  );

}


// ----------------
// RENDER REPORT
// ----------------
function renderReport() {

  const reportBox =
    document.getElementById("reportBox");

  const salesList =
    document.getElementById("salesList");


  if (!reportBox || !salesList) return;


  const sales = getSales();


  const totalSales =
    sales.reduce(function (sum, sale) {
      return sum + Number(sale.total);
    }, 0);


  reportBox.innerHTML = `
    <div class="bigTotal">
      Total Sales:
      ${money(totalSales)} Ks
    </div>

    <p>
      Number of Sales:
      <b>${sales.length}</b>
    </p>
  `;


  if (sales.length === 0) {

    salesList.innerHTML =
      "<p>No sales yet.</p>";

    return;
  }


  salesList.innerHTML =
    sales.slice(0, 20)
      .map(function (sale) {

        return `
          <div class="saleItem">

            <div style="flex:1">

              <b>${escapeHtml(sale.id)}</b>

              <br>

              <small>
                ${escapeHtml(sale.date)}
              </small>

              <br>

              <small>
                Payment:
                ${escapeHtml(sale.payment)}
              </small>

            </div>


            <div>
              <b>
                ${money(sale.total)} Ks
              </b>
            </div>

          </div>
        `;

      })
      .join("");

}


// ================================
// RECEIPT
// ================================
function generateReceipt(sale) {

  const receipt =
    document.getElementById("receipt");


  let text = "";


  text += "        LIQUOR KAUNG\n";
  text += "          OFFLINE POS\n";
  text += "--------------------------------\n";

  text +=
    "Receipt: " +
    sale.id +
    "\n";


  text +=
    sale.date +
    "\n";


  text +=
    "Payment: " +
    sale.payment +
    "\n";


  if (sale.duplicate) {

    text +=
      "*** DUPLICATE RECEIPT ***\n";

  }


  text +=
    "--------------------------------\n";


  sale.items.forEach(function (item) {

    text +=
      item.name +
      "\n";


    text +=
      item.qty +
      " x " +
      money(item.price) +
      " = " +
      money(item.price * item.qty) +
      " Ks\n";

  });


  text +=
    "--------------------------------\n";


  text +=
    "TOTAL: " +
    money(sale.total) +
    " Ks\n";


  text +=
    "--------------------------------\n";


  text +=
    "      THANK YOU!\n";


  receipt.textContent = text;
}


// ----------------
// CLOSE RECEIPT
// ----------------
function closeReceipt() {

  document
    .getElementById("receiptModal")
    .classList
    .add("hidden");

}


// ----------------
// PRINT RECEIPT
// ----------------
function printReceipt() {

  window.print();

}


// ================================
// DEMO PRODUCTS
// ================================
function seedProducts() {

  const demoProducts = [

    {
      code: "LK001",
      barcode: "885000000001",
      name: "Whisky",
      price: 25000,
      stock: 20
    },

    {
      code: "LK002",
      barcode: "885000000002",
      name: "Vodka",
      price: 18000,
      stock: 15
    },

    {
      code: "LK003",
      barcode: "885000000003",
      name: "Beer",
      price: 3500,
      stock: 50
    },

    {
      code: "LK004",
      barcode: "885000000004",
      name: "Red Wine",
      price: 30000,
      stock: 10
    }

  ];


  if (
    confirm(
      "Restore demo products? Existing products will be replaced."
    )
  ) {

    setProducts(demoProducts);

    renderProducts();

    alert(
      "Demo products restored successfully"
    );

  }

}


// ================================
// BACKUP DATA
// ================================
function exportData() {

  const data = {

    products:
      getProducts(),

    sales:
      getSales(),

    exportDate:
      new Date().toISOString()

  };


  const json =
    JSON.stringify(data, null, 2);


  const blob =
    new Blob(
      [json],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const a =
    document.createElement("a");


  a.href = url;


  a.download =
    "liquor-kaung-backup.json";


  a.click();


  URL.revokeObjectURL(url);

}


// ================================
// IMPORT BACKUP
// ================================
function importData(event) {

  const file =
    event.target.files[0];


  if (!file) return;


  const reader =
    new FileReader();


  reader.onload =
    function (e) {

      try {

        const data =
          JSON.parse(
            e.target.result
          );


        if (
          !data.products ||
          !data.sales
        ) {

          alert(
            "Invalid backup file"
          );

          return;

        }


        if (
          !confirm(
            "Restore backup? Current data will be replaced."
          )
        ) {

          return;

        }


        setProducts(
          data.products
        );


        setSales(
          data.sales
        );


        renderProducts();
        renderCart();
        renderReport();


        alert(
          "Backup restored successfully"
        );

      } catch (error) {

        alert(
          "Error reading backup file"
        );

      }

    };


  reader.readAsText(file);

}


// ================================
// HELPER FUNCTIONS
// ================================

function money(value) {

  return Number(value || 0)
    .toLocaleString("en-US");

}


function escapeHtml(text) {

  return String(text || "")

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


function jsEscape(text) {

  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");

}
