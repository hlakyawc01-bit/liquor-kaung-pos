import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const STORE_NAME = "LIQUOR TR";
const CURRENCY = "S$";

const INITIAL_PRODUCTS = [
  {
    id: "B10135",
    barcode: "2072984745",
    name: "Macallan Colour Collection 15Y 700ml",
    price: 204.8,
    stock: 20,
  },
  {
    id: "B20012",
    barcode: "2073616340",
    name: "Suntory Hibiki 12YO 700ml",
    price: 250,
    stock: 10,
  },
  {
    id: "B30001",
    barcode: "5000267024232",
    name: "Johnnie Walker Black Label 1L",
    price: 80,
    stock: 50,
  },
  {
    id: "B30002",
    barcode: "5000267014202",
    name: "Johnnie Walker Red Label 1L",
    price: 55,
    stock: 50,
  },
  {
    id: "B30003",
    barcode: "080432400120",
    name: "Chivas Regal 12Y 1L",
    price: 75,
    stock: 30,
  },
];

export default function App() {
  const [page, setPage] = useState("POS");

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);

  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("CASH");

  const [passport, setPassport] = useState("");
  const [nationality, setNationality] = useState("MM");
  const [flightCode, setFlightCode] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [memberId, setMemberId] = useState("");

  const [cashier, setCashier] = useState("ADMIN");
  const [shopName, setShopName] = useState(STORE_NAME);

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [showAddProduct, setShowAddProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    id: "",
    barcode: "",
    name: "",
    price: "",
    stock: "",
  });

  const money = (value) => Number(value || 0).toFixed(2);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.qty,
      0
    );
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.barcode.includes(q)
    );
  }, [products, search]);

  function login() {
    if (
      username.trim() === "admin" &&
      password === "1234"
    ) {
      setCashier("ADMIN");
      setLoggedIn(true);
      setUsername("");
      setPassword("");
    } else {
      Alert.alert(
        "Login Failed",
        "Username: admin\nPassword: 1234"
      );
    }
  }

  function logout() {
    setLoggedIn(false);
    setPassword("");
  }

  function addToCart(product) {
    if (product.stock <= 0) {
      Alert.alert("Out of Stock", product.name);
      return;
    }

    setCart((oldCart) => {
      const existing = oldCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        if (existing.qty >= product.stock) {
          Alert.alert("Stock", "Maximum stock reached.");
          return oldCart;
        }

        return oldCart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [
        ...oldCart,
        {
          id: product.id,
          barcode: product.barcode,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ];
    });
  }

  function changeQuantity(id, amount) {
    setCart((oldCart) =>
      oldCart
        .map((item) => {
          if (item.id !== id) return item;

          const product = products.find(
            (p) => p.id === id
          );

          const nextQty = item.qty + amount;

          if (
            product &&
            nextQty > product.stock
          ) {
            Alert.alert(
              "Stock",
              "Maximum stock reached."
            );

            return item;
          }

          return {
            ...item,
            qty: nextQty,
          };
        })
        .filter((item) => item.qty > 0)
    );
  }

  function removeCartItem(id) {
    setCart((oldCart) =>
      oldCart.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setCart([]);
  }

  function completeSale() {
    if (cart.length === 0) {
      Alert.alert(
        "Cart Empty",
        "Please add products first."
      );
      return;
    }

    const now = new Date();

    const receipt = {
      id: `R${Date.now()}`,
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB"),
      items: cart,
      subtotal,
      total: subtotal,
      payment,
      passport,
      nationality,
      flightCode,
      flightNumber,
      memberId,
      cashier,
      shopName,
    };

    setProducts((oldProducts) =>
      oldProducts.map((product) => {
        const soldItem = cart.find(
          (item) => item.id === product.id
        );

        if (!soldItem) return product;

        return {
          ...product,
          stock: Math.max(
            0,
            product.stock - soldItem.qty
          ),
        };
      })
    );

    setSales((oldSales) => [
      ...oldSales,
      receipt,
    ]);

    setSelectedReceipt(receipt);
    setShowReceipt(true);

    setCart([]);
  }

  function saveProduct() {
    const id = newProduct.id.trim();
    const barcode = newProduct.barcode.trim();
    const name = newProduct.name.trim();

    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock);

    if (!id || !barcode || !name) {
      Alert.alert(
        "Error",
        "Please fill Product Code, Barcode and Product Name."
      );
      return;
    }

    if (isNaN(price) || price <= 0) {
      Alert.alert(
        "Error",
        "Please enter a valid price."
      );
      return;
    }

    if (isNaN(stock) || stock < 0) {
      Alert.alert(
        "Error",
        "Please enter valid stock."
      );
      return;
    }

    if (products.some((p) => p.id === id)) {
      Alert.alert(
        "Error",
        "Product code already exists."
      );
      return;
    }

    setProducts((old) => [
      ...old,
      {
        id,
        barcode,
        name,
        price,
        stock,
      },
    ]);

    setNewProduct({
      id: "",
      barcode: "",
      name: "",
      price: "",
      stock: "",
    });

    setShowAddProduct(false);
  }

  function deleteProduct(id) {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setProducts((old) =>
              old.filter((p) => p.id !== id)
            );

            setCart((old) =>
              old.filter((p) => p.id !== id)
            );
          },
        },
      ]
    );
  }

  function Receipt({ receipt }) {
    if (!receipt) return null;

    return (
      <View style={styles.receipt}>
        <Text style={styles.receiptTitle}>
          {receipt.shopName}
        </Text>

        <Text style={styles.center}>
          DUTY FREE / TRAVEL RETAIL
        </Text>

        <Text style={styles.center}>
          POS RECEIPT
        </Text>

        <View style={styles.dash} />

        <Text>Cashier: {receipt.cashier}</Text>
        <Text>Date: {receipt.date}</Text>
        <Text>Time: {receipt.time}</Text>
        <Text>Receipt: {receipt.id}</Text>

        <View style={styles.dash} />

        <Text>
          Passport: {receipt.passport || "N/A"}
        </Text>

        <Text>
          Nationality: {receipt.nationality || "N/A"}
        </Text>

        <Text>
          Flight Code: {receipt.flightCode || "N/A"}
        </Text>

        <Text>
          Flight No: {receipt.flightNumber || "N/A"}
        </Text>

        <View style={styles.dash} />

        {receipt.items.map((item) => (
          <View
            key={item.id}
            style={styles.receiptItem}
          >
            <Text style={styles.receiptBold}>
              {item.name}
            </Text>

            <Text>
              {item.qty} × {CURRENCY}
              {money(item.price)}
            </Text>

            <Text>
              {CURRENCY}
              {money(item.qty * item.price)}
            </Text>
          </View>
        ))}

        <View style={styles.dash} />

        <Text>
          Items:{" "}
          {receipt.items.reduce(
            (sum, item) => sum + item.qty,
            0
          )}
        </Text>

        <Text style={styles.receiptTotal}>
          TOTAL: {CURRENCY}
          {money(receipt.total)}
        </Text>

        <Text>
          Payment: {receipt.payment}
        </Text>

        <View style={styles.dash} />

        <Text style={styles.center}>
          Thank you for shopping with us.
        </Text>
      </View>
    );
  }

  function POSPage() {
    return (
      <ScrollView
        style={styles.body}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <TextInput
          style={styles.search}
          placeholder="Search / Barcode"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />

        <Text style={styles.title}>
          PRODUCTS
        </Text>

        <View style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              activeOpacity={0.7}
              style={[
                styles.product,
                product.stock <= 0 &&
                  styles.disabled,
              ]}
              onPress={() =>
                addToCart(product)
              }
            >
              <Text style={styles.productName}>
                {product.name}
              </Text>

              <Text style={styles.small}>
                CODE: {product.id}
              </Text>

              <Text style={styles.small}>
                STOCK: {product.stock}
              </Text>

              <Text style={styles.price}>
                {CURRENCY}
                {money(product.price)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            CUSTOMER / TRAVEL
          </Text>

          <Input
            placeholder="Passport Number"
            value={passport}
            onChangeText={setPassport}
          />

          <Input
            placeholder="Nationality"
            value={nationality}
            onChangeText={setNationality}
          />

          <Input
            placeholder="Flight Code"
            value={flightCode}
            onChangeText={setFlightCode}
          />

          <Input
            placeholder="Flight Number"
            value={flightNumber}
            onChangeText={setFlightNumber}
          />

          <Input
            placeholder="Membership ID"
            value={memberId}
            onChangeText={setMemberId}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            CART ({totalItems})
          </Text>

          {cart.length === 0 ? (
            <Text style={styles.empty}>
              Cart is empty
            </Text>
          ) : (
            cart.map((item) => (
              <View
                key={item.id}
                style={styles.cartRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>
                    {item.name}
                  </Text>

                  <Text>
                    {CURRENCY}
                    {money(item.price)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() =>
                    changeQuantity(
                      item.id,
                      -1
                    )
                  }
                >
                  <Text style={styles.qtyButtonText}>
                    −
                  </Text>
                </TouchableOpacity>

                <Text style={styles.qty}>
                  {item.qty}
                </Text>

                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() =>
                    changeQuantity(
                      item.id,
                      1
                    )
                  }
                >
                  <Text style={styles.qtyButtonText}>
                    +
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    removeCartItem(item.id)
                  }
                >
                  <Text style={styles.delete}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>
              TOTAL
            </Text>

            <Text style={styles.total}>
              {CURRENCY}
              {money(subtotal)}
            </Text>
          </View>

          <Text style={styles.title}>
            PAYMENT
          </Text>

          <View style={styles.paymentRow}>
            {["CASH", "CARD", "TRANSFER"].map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.payment,
                    payment === type &&
                      styles.paymentActive,
                  ]}
                  onPress={() =>
                    setPayment(type)
                  }
                >
                  <Text
                    style={
                      payment === type
                        ? styles.white
                        : styles.black
                    }
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.complete}
              onPress={completeSale}
            >
              <Text style={styles.white}>
                COMPLETE SALE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clear}
              onPress={clearCart}
            >
              <Text style={styles.white}>
                CLEAR
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  function StockPage() {
    return (
      <ScrollView
        style={styles.body}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.primary}
          onPress={() =>
            setShowAddProduct(true)
          }
        >
          <Text style={styles.white}>
            + ADD PRODUCT
          </Text>
        </TouchableOpacity>

        {products.map((product) => (
          <View
            key={product.id}
            style={styles.stockCard}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>
                {product.name}
              </Text>

              <Text>
                Code: {product.id}
              </Text>

              <Text style={styles.small}>
                {product.barcode}
              </Text>
            </View>

            <View style={styles.stockRight}>
              <Text>
                Stock: {product.stock}
              </Text>

              <Text style={styles.price}>
                {CURRENCY}
                {money(product.price)}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  deleteProduct(product.id)
                }
              >
                <Text style={styles.delete}>
                  DELETE
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  function SalesPage() {
    const totalSales = sales.reduce(
      (sum, sale) => sum + sale.total,
      0
    );

    return (
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>
            SALES SUMMARY
          </Text>

          <Text style={styles.summaryText}>
            Transactions: {sales.length}
          </Text>

          <Text style={styles.summaryTotal}>
            {CURRENCY}
            {money(totalSales)}
          </Text>
        </View>

        <Text style={styles.title}>
          SALES HISTORY
        </Text>

        {sales.length === 0 ? (
          <Text style={styles.empty}>
            No sales yet.
          </Text>
        ) : (
          [...sales]
            .reverse()
            .map((sale) => (
              <TouchableOpacity
                key={sale.id}
                style={styles.saleCard}
                onPress={() => {
                  setSelectedReceipt(sale);
                  setShowReceipt(true);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>
                    {sale.id}
                  </Text>

                  <Text>
                    {sale.date} {sale.time}
                  </Text>

                  <Text>
                    Cashier: {sale.cashier}
                  </Text>
                </View>

                <Text style={styles.price}>
                  {CURRENCY}
                  {money(sale.total)}
                </Text>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
    );
  }

  function SettingsPage() {
    return (
      <ScrollView
        style={styles.body}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            STORE SETTINGS
          </Text>

          <Input
            placeholder="Shop Name"
            value={shopName}
            onChangeText={setShopName}
          />

          <Input
            placeholder="Cashier Name"
            value={cashier}
            onChangeText={setCashier}
          />

          <TouchableOpacity
            style={styles.primary}
            onPress={() =>
              Alert.alert(
                "Saved",
                "Settings saved successfully."
              )
            }
          >
            <Text style={styles.white}>
              SAVE SETTINGS
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            SECURITY
          </Text>

          <TouchableOpacity
            style={styles.logout}
            onPress={logout}
          >
            <Text style={styles.white}>
              LOGOUT
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.loginScreen}>
        <KeyboardAvoidingView
          style={styles.loginKeyboard}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
        >
          <Text style={styles.loginTitle}>
            {STORE_NAME}
          </Text>

          <Text style={styles.loginSub}>
            OFFLINE POS SYSTEM
          </Text>

          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={login}
          >
            <Text style={styles.white}>
              LOGIN
            </Text>
          </TouchableOpacity>

          <Text style={styles.loginHint}>
            Demo: admin / 1234
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              {shopName}
            </Text>

            <Text style={styles.headerSub}>
              CASHIER: {cashier}
            </Text>
          </View>

          <Text style={styles.headerTotal}>
            {CURRENCY}
            {money(subtotal)}
          </Text>
        </View>

        <View style={styles.pageContainer}>
          {page === "POS" && <POSPage />}
          {page === "STOCK" && <StockPage />}
          {page === "SALES" && <SalesPage />}
          {page === "SETTINGS" && (
            <SettingsPage />
          )}
        </View>

        <View style={styles.nav}>
          <NavButton
            icon="🛒"
            text="POS"
            active={page === "POS"}
            onPress={() => setPage("POS")}
          />

          <NavButton
            icon="📦"
            text="Stock"
            active={page === "STOCK"}
            onPress={() =>
              setPage("STOCK")
            }
          />

          <NavButton
            icon="📊"
            text="Sales"
            active={page === "SALES"}
            onPress={() =>
              setPage("SALES")
            }
          />

          <NavButton
            icon="⚙️"
            text="Settings"
            active={page === "SETTINGS"}
            onPress={() =>
              setPage("SETTINGS")
            }
          />
        </View>

        {/* RECEIPT MODAL */}
        <Modal
          visible={showReceipt}
          animationType="slide"
          onRequestClose={() =>
            setShowReceipt(false)
          }
        >
          <SafeAreaView style={styles.safe}>
            <View style={styles.modalHeader}>
              <Text style={styles.title}>
                RECEIPT
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowReceipt(false)
                }
              >
                <Text style={styles.close}>
                  CLOSE
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                paddingBottom: 30,
              }}
            >
              <Receipt
                receipt={selectedReceipt}
              />

              <TouchableOpacity
                style={styles.printButton}
                onPress={() =>
                  Alert.alert(
                    "Print",
                    "Printer connection will be added later."
                  )
                }
              >
                <Text style={styles.white}>
                  🖨 PRINT RECEIPT
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* ADD PRODUCT MODAL */}
        <Modal
          visible={showAddProduct}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setShowAddProduct(false)
          }
        >
          <KeyboardAvoidingView
            style={styles.overlay}
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : "height"
            }
          >
            <ScrollView
              contentContainerStyle={
                styles.modalScroll
              }
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.addModal}>
                <Text style={styles.title}>
                  ADD PRODUCT
                </Text>

                <Input
                  placeholder="Product Code"
                  value={newProduct.id}
                  onChangeText={(v) =>
                    setNewProduct((old) => ({
                      ...old,
                      id: v,
                    }))
                  }
                />

                <Input
                  placeholder="Barcode"
                  value={newProduct.barcode}
                  onChangeText={(v) =>
                    setNewProduct((old) => ({
                      ...old,
                      barcode: v,
                    }))
                  }
                  keyboardType="numeric"
                />

                <Input
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChangeText={(v) =>
                    setNewProduct((old) => ({
                      ...old,
                      name: v,
                    }))
                  }
                />

                <Input
                  placeholder="Price"
                  value={newProduct.price}
                  onChangeText={(v) =>
                    setNewProduct((old) => ({
                      ...old,
                      price: v,
                    }))
                  }
                  keyboardType="decimal-pad"
                />

                <Input
                  placeholder="Stock"
                  value={newProduct.stock}
                  onChangeText={(v) =>
                    setNewProduct((old) => ({
                      ...old,
                      stock: v,
                    }))
                  }
                  keyboardType="numeric"
                />

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.complete}
                    onPress={saveProduct}
                  >
                    <Text style={styles.white}>
                      ADD PRODUCT
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.clear}
                    onPress={() =>
                      setShowAddProduct(false)
                    }
                  >
                    <Text style={styles.white}>
                      CANCEL
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* INPUT COMPONENT */

function Input({
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#888"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
      editable={true}
    />
  );
}

/* NAV BUTTON */

function NavButton({
  icon,
  text,
  active,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.navButton,
        active && styles.navButtonActive,
      ]}
      onPress={onPress}
    >
      <Text style={styles.navIcon}>
        {icon}
      </Text>

      <Text
        style={
          active
            ? styles.navTextActive
            : styles.navText
        }
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f2f3f5",
  },

  pageContainer: {
    flex: 1,
  },

  header: {
    backgroundColor: "#111",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "900",
  },

  headerSub: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 3,
  },

  headerTotal: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
  },

  body: {
    flex: 1,
    paddingHorizontal: 12,
  },

  scrollContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },

  search: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    color: "#111",
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
    color: "#111",
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  product: {
    width: "48.5%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  disabled: {
    opacity: 0.4,
  },

  productName: {
    fontWeight: "800",
    fontSize: 14,
    color: "#111",
  },

  small: {
    fontSize: 10,
    color: "#777",
    marginTop: 3,
  },

  price: {
    fontSize: 16,
    fontWeight: "900",
    marginVertical: 5,
    color: "#111",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginVertical: 7,
  },

  input: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
    color: "#111",
    minHeight: 48,
  },

  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 11,
  },

  qtyButton: {
    backgroundColor: "#eee",
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  qtyButtonText: {
    fontSize: 18,
    fontWeight: "800",
  },

  qty: {
    fontWeight: "800",
    minWidth: 25,
    textAlign: "center",
    marginLeft: 5,
  },

  delete: {
    color: "#c00",
    fontWeight: "900",
    fontSize: 13,
    marginLeft: 10,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
  },

  totalText: {
    fontSize: 18,
    fontWeight: "900",
  },

  total: {
    fontSize: 22,
    fontWeight: "900",
  },

  paymentRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  payment: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 3,
  },

  paymentActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  actionRow: {
    flexDirection: "row",
  },

  complete: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 9,
    padding: 14,
    alignItems: "center",
    marginRight: 4,
  },

  clear: {
    backgroundColor: "#777",
    borderRadius: 9,
    padding: 14,
    alignItems: "center",
    minWidth: 100,
    marginLeft: 4,
  },

  primary: {
    backgroundColor: "#111",
    borderRadius: 9,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  logout: {
    backgroundColor: "#b00020",
    borderRadius: 9,
    padding: 14,
    alignItems: "center",
  },

  white: {
    color: "#fff",
    fontWeight: "900",
  },

  black: {
    color: "#111",
    fontWeight: "700",
  },

  empty: {
    textAlign: "center",
    color: "#888",
    padding: 20,
  },

  stockCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 13,
    marginBottom: 9,
    flexDirection: "row",
  },

  stockRight: {
    alignItems: "flex-end",
    marginLeft: 10,
  },

  summary: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
  },

  summaryTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 17,
  },

  summaryText: {
    color: "#ddd",
    marginTop: 8,
  },

  summaryTotal: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 8,
  },

  saleCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  nav: {
    height: 70,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection
