import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
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

  const [products, setProducts] =
    useState(INITIAL_PRODUCTS);

  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);

  const [search, setSearch] = useState("");

  const [payment, setPayment] =
    useState("CASH");

  const [passport, setPassport] =
    useState("");

  const [nationality, setNationality] =
    useState("MM");

  const [flightCode, setFlightCode] =
    useState("");

  const [flightNumber, setFlightNumber] =
    useState("");

  const [memberId, setMemberId] =
    useState("");

  const [cashier, setCashier] =
    useState("ADMIN");

  const [shopName, setShopName] =
    useState(STORE_NAME);

  const [showReceipt, setShowReceipt] =
    useState(false);

  const [selectedReceipt, setSelectedReceipt] =
    useState(null);

  const [showLogin, setShowLogin] =
    useState(false);

  const [loggedIn, setLoggedIn] =
    useState(true);

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showAddProduct, setShowAddProduct] =
    useState(false);

  const [newProduct, setNewProduct] =
    useState({
      id: "",
      barcode: "",
      name: "",
      price: "",
      stock: "",
    });

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + item.price * item.qty,
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

  function money(value) {
    return Number(value).toFixed(2);
  }

  function addToCart(product) {
    if (product.stock <= 0) {
      Alert.alert(
        "Out of Stock",
        product.name
      );
      return;
    }

    setCart((oldCart) => {
      const existing = oldCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        if (existing.qty >= product.stock) {
          Alert.alert(
            "Stock",
            "Not enough stock."
          );

          return oldCart;
        }

        return oldCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
              }
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
          if (item.id !== id) {
            return item;
          }

          const product =
            products.find(
              (p) => p.id === id
            );

          const next =
            item.qty + amount;

          if (next > product.stock) {
            Alert.alert(
              "Stock",
              "Maximum stock reached."
            );

            return item;
          }

          return {
            ...item,
            qty: next,
          };
        })
        .filter(
          (item) => item.qty > 0
        )
    );
  }

  function removeCartItem(id) {
    setCart((oldCart) =>
      oldCart.filter(
        (item) => item.id !== id
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  function makeReceipt() {
    const now = new Date();

    return {
      id: `D${Date.now()}`,
      date: now.toLocaleDateString(
        "en-GB"
      ),
      time: now.toLocaleTimeString(
        "en-GB"
      ),
      items: cart.map((x) => ({
        ...x,
      })),
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
  }

  function completeSale() {
    if (!cart.length) {
      Alert.alert(
        "Cart Empty",
        "Please add products first."
      );

      return;
    }

    const receipt = makeReceipt();

    setProducts((oldProducts) =>
      oldProducts.map((product) => {
        const sold = cart.find(
          (item) =>
            item.id === product.id
        );

        if (!sold) return product;

        return {
          ...product,
          stock:
            product.stock -
            sold.qty,
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

  function addProduct() {
    const id =
      newProduct.id.trim();

    const name =
      newProduct.name.trim();

    const barcode =
      newProduct.barcode.trim();

    const price =
      Number(newProduct.price);

    const stock =
      Number(newProduct.stock);

    if (
      !id ||
      !name ||
      !barcode ||
      !price ||
      stock < 0
    ) {
      Alert.alert(
        "Error",
        "Fill all product information."
      );

      return;
    }

    if (
      products.some(
        (p) => p.id === id
      )
    ) {
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
      "Delete this product?",
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
              old.filter(
                (p) => p.id !== id
              )
            );
          },
        },
      ]
    );
  }

  function login() {
    if (
      username === "admin" &&
      password === "1234"
    ) {
      setCashier("ADMIN");
      setLoggedIn(true);
      setShowLogin(false);
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
    setShowLogin(true);
  }

  function printReceipt() {
    Alert.alert(
      "Thermal Printer",
      "Receipt is ready for printing.\n\nConnect your 80mm Bluetooth thermal printer and add a Bluetooth printer library for real printing."
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
          DUTY FREE / TRAVEL RETAIL POS
        </Text>

        <Text style={styles.center}>
          SAMPLE RECEIPT
        </Text>

        <View style={styles.dash} />

        <Text>
          POS : 001
        </Text>

        <Text>
          Cashier : {receipt.cashier}
        </Text>

        <Text>
          Date : {receipt.date}
        </Text>

        <Text>
          Time : {receipt.time}
        </Text>

        <Text>
          Receipt No. : {receipt.id}
        </Text>

        <View style={styles.dash} />

        <Text>
          Passport No. :{" "}
          {receipt.passport || "N/A"}
        </Text>

        <Text>
          Nationality :{" "}
          {receipt.nationality || "N/A"}
        </Text>

        <Text>
          Flight Code :{" "}
          {receipt.flightCode || "N/A"}
        </Text>

        <Text>
          Flight Number :{" "}
          {receipt.flightNumber ||
            "N/A"}
        </Text>

        <Text>
          Membership ID :{" "}
          {receipt.memberId || "N/A"}
        </Text>

        <View style={styles.dash} />

        {receipt.items.map(
          (item) => (
            <View
              key={item.id}
              style={{
                marginBottom: 8,
              }}
            >
              <Text
                style={
                  styles.receiptBold
                }
              >
                {item.name}
              </Text>

              <Text>
                {item.id}
              </Text>

              <Text>
                {item.qty} ×{" "}
                {CURRENCY}
                {money(item.price)}
              </Text>

              <Text>
                TOTAL{" "}
                {CURRENCY}
                {money(
                  item.qty *
                    item.price
                )}
              </Text>
            </View>
          )
        )}

        <View style={styles.dash} />

        <Text>
          Total No. Items :{" "}
          {receipt.items.reduce(
            (sum, x) =>
              sum + x.qty,
            0
          )}
        </Text>

        <Text>
          Sub Total : {CURRENCY}
          {money(receipt.subtotal)}
        </Text>

        <Text>
          GST @ 0.00% : {CURRENCY}
          0.00
        </Text>

        <Text
          style={styles.receiptTotal}
        >
          Total : {CURRENCY}
          {money(receipt.total)}
        </Text>

        <View style={styles.dash} />

        <Text>
          Payment :{" "}
          {receipt.payment}
        </Text>

        <View style={styles.dash} />

        <Text style={styles.center}>
          Thank you for shopping
          with us.
        </Text>

        <Text style={styles.center}>
          {receipt.shopName} POS
        </Text>
      </View>
    );
  }

  function POSPage() {
    return (
      <ScrollView
        style={styles.body}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <TextInput
          style={styles.search}
          placeholder="🔎 Search / Barcode"
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.title}>
          Products
        </Text>

        <View
          style={styles.productGrid}
        >
          {filteredProducts.map(
            (product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.product,
                  product.stock <= 0 &&
                    styles.disabled,
                ]}
                onPress={() =>
                  addToCart(product)
                }
              >
                <Text
                  style={
                    styles.productName
                  }
                >
                  {product.name}
                </Text>

                <Text
                  style={styles.small}
                >
                  CODE: {product.id}
                </Text>

                <Text
                  style={styles.small}
                >
                  BARCODE:{" "}
                  {product.barcode}
                </Text>

                <Text
                  style={styles.price}
                >
                  {CURRENCY}
                  {money(product.price)}
                </Text>

                <Text>
                  Stock:{" "}
                  {product.stock}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Customer / Travel
          </Text>

          <Input
            placeholder="Passport No."
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
            Cart ({totalItems})
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
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.productName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text>
                    {CURRENCY}
                    {money(
                      item.price
                    )}
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.qtyButton
                  }
                  onPress={() =>
                    changeQuantity(
                      item.id,
                      -1
                    )
                  }
                >
                  <Text>−</Text>
                </TouchableOpacity>

                <Text
                  style={styles.qty}
                >
                  {item.qty}
                </Text>

                <TouchableOpacity
                  style={
                    styles.qtyButton
                  }
                  onPress={() =>
                    changeQuantity(
                      item.id,
                      1
                    )
                  }
                >
                  <Text>+</Text>
                </TouchableOpacity>

                <Text
                  style={styles.itemTotal}
                >
                  {CURRENCY}
                  {money(
                    item.qty *
                      item.price
                  )}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    removeCartItem(
                      item.id
                    )
                  }
                >
                  <Text
                    style={styles.delete}
                  >
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
            Payment
          </Text>

          <View
            style={styles.paymentRow}
          >
            {[
              "CASH",
              "CARD",
              "TRANSFER",
            ].map((type) => (
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
                      : null
                  }
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={styles.actionRow}
          >
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
        contentContainerStyle={{
          paddingBottom: 100,
        }}
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
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.productName
                }
              >
                {product.name}
              </Text>

              <Text>
                Code: {product.id}
              </Text>

              <Text>
                Barcode:{" "}
                {product.barcode}
              </Text>
            </View>

            <View>
              <Text>
                Stock:{" "}
                {product.stock}
              </Text>

              <Text
                style={styles.price}
              >
                {CURRENCY}
                {money(product.price)}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  deleteProduct(
                    product.id
                  )
                }
              >
                <Text
                  style={styles.delete}
                >
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
      (sum, sale) =>
        sum + sale.total,
      0
    );

    return (
      <ScrollView
        style={styles.body}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>
            SALES SUMMARY
          </Text>

          <Text>
            Transactions:{" "}
            {sales.length}
          </Text>

          <Text style={styles.summaryTotal}>
            {CURRENCY}
            {money(totalSales)}
          </Text>
        </View>

        <Text style={styles.title}>
          Sales History
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
                  setSelectedReceipt(
                    sale
                  );
                  setShowReceipt(
                    true
                  );
                }}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.productName
                    }
                  >
                    {sale.id}
                  </Text>

                  <Text>
                    {sale.date}{" "}
                    {sale.time}
                  </Text>

                  <Text>
                    Cashier:{" "}
                    {sale.cashier}
                  </Text>
                </View>

                <Text
                  style={styles.price}
                >
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
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            Store Settings
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
                "Settings saved."
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
            Printer
          </Text>

          <Text style={styles.info}>
            Receipt Width: 80mm
          </Text>

          <Text style={styles.info}>
            Printer: Bluetooth Thermal
          </Text>

          <TouchableOpacity
            style={styles.primary}
            onPress={() =>
              Alert.alert(
                "Printer",
                "Bluetooth printer setup requires a native printer package."
              )
            }
          >
            <Text style={styles.white}>
              CONNECT PRINTER
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Security
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
      <SafeAreaView
        style={styles.loginScreen}
      >
        <Text
          style={styles.loginTitle}
        >
          {STORE_NAME}
        </Text>

        <Text style={styles.loginSub}>
          POS LOGIN
        </Text>

        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.primary}
          onPress={login}
        >
          <Text style={styles.white}>
            LOGIN
          </Text>
        </TouchableOpacity>

        <Text style={styles.loginHint}>
          Demo Login: admin / 1234
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text
            style={styles.headerTitle}
          >
            {shopName}
          </Text>

          <Text
            style={styles.headerSub}
          >
            CASHIER: {cashier}
          </Text>
        </View>

        <Text
          style={styles.headerTotal}
        >
          {CURRENCY}
          {money(subtotal)}
        </Text>
      </View>

      {page === "POS" && <POSPage />}
      {page === "STOCK" && (
        <StockPage />
      )}
      {page === "SALES" && (
        <SalesPage />
      )}
      {page === "SETTINGS" && (
        <SettingsPage />
      )}

      <View style={styles.nav}>
        <NavButton
          icon="🛒"
          text="POS"
          active={page === "POS"}
          onPress={() =>
            setPage("POS")
          }
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
          active={
            page === "SETTINGS"
          }
          onPress={() =>
            setPage("SETTINGS")
          }
        />
      </View>

      <Modal
        visible={showReceipt}
        animationType="slide"
      >
        <SafeAreaView
          style={styles.safe}
        >
          <View
            style={styles.modalHeader}
          >
            <Text
              style={styles.title}
            >
              RECEIPT
            </Text>

            <TouchableOpacity
              onPress={() =>
                setShowReceipt(false)
              }
            >
              <Text
                style={styles.close}
              >
                CLOSE
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Receipt
              receipt={
                selectedReceipt
              }
            />

            <TouchableOpacity
              style={styles.primary}
              onPress={printReceipt}
            >
              <Text
                style={styles.white}
              >
                🖨 PRINT 80mm RECEIPT
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showAddProduct}
        animationType="slide"
        transparent
      >
        <View style={styles.overlay}>
          <View
            style={styles.addModal}
          >
            <Text
              style={styles.title}
            >
              Add Product
            </Text>

            <Input
              placeholder="Product Code"
              value={newProduct.id}
              onChangeText={(v) =>
                setNewProduct({
                  ...newProduct,
                  id: v,
                })
              }
            />

            <Input
              placeholder="Barcode"
              value={newProduct.barcode}
              onChangeText={(v) =>
                setNewProduct({
                  ...newProduct,
                  barcode: v,
                })
              }
            />

            <Input
              placeholder="Product Name"
              value={newProduct.name}
              onChangeText={(v) =>
                setNewProduct({
                  ...newProduct,
                  name: v,
                })
              }
            />

            <Input
              placeholder="Price"
              keyboardType="decimal-pad"
              value={newProduct.price}
              onChangeText={(v) =>
                setNewProduct({
                  ...newProduct,
                  price: v,
                })
              }
            />

            <Input
              placeholder="Stock"
              keyboardType="numeric"
              value={newProduct.stock}
              onChangeText={(v) =>
                setNewProduct({
                  ...newProduct,
                  stock: v,
                })
              }
            />

            <View
              style={styles.actionRow}
            >
              <TouchableOpacity
                style={styles.primary}
                onPress={addProduct}
              >
                <Text
                  style={styles.white}
                >
                  ADD
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clear}
                onPress={() =>
                  setShowAddProduct(
                    false
                  )
                }
              >
                <Text
                  style={styles.white}
                >
                  CANCEL
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Input({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
    />
  );
}

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
        active &&
          styles.navButtonActive,
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f2f3f5",
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
    padding: 12,
  },

  search: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  product: {
    width: "48%",
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
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 11,
    marginBottom: 9,
  },

  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 11,
    gap: 7,
  },

  qtyButton: {
    backgroundColor: "#eee",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  qty: {
    fontWeight: "800",
    minWidth: 20,
    textAlign: "center",
  },

  itemTotal: {
    fontWeight: "800",
  },

  delete: {
    color: "#c00",
    fontWeight: "900",
    fontSize: 13,
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
    gap: 7,
    marginBottom: 12,
  },

  payment: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },

  paymentActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
  },

  complete: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 9,
    padding: 14,
    alignItems: "center",
  },

  clear: {
    backgroundColor: "#777",
    borderRadius: 9,
    padding: 14,
    alignItems: "center",
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
    alignItems: "center",
    gap: 10,
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
  },

  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navButtonActive: {
    backgroundColor: "#eee",
  },

  navIcon: {
    fontSize: 20,
  },

  navText: {
    fontSize: 11,
    color: "#777",
  },

  navTextActive: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111",
  },

  modalHeader: {
    backgroundColor: "#fff",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  close: {
    color: "#c00",
    fontWeight: "900",
  },

  receipt: {
    backgroundColor: "#fff",
    width: "94%",
    alignSelf: "center",
    margin: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  receiptTitle: {
    textAlign: "center",
    fontSize: 19,
    fontWeight: "900",
  },

  center: {
    textAlign: "center",
  },

  receiptBold: {
    fontWeight: "900",
  },

  receiptTotal: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },

  dash: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#111",
    marginVertical: 10,
  },

  overlay: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "center",
    padding: 15,
  },

  addModal: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
  },

  loginScreen: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    padding: 25,
  },

  loginTitle: {
    color: "#fff",
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
  },

  loginSub: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 30,
  },

  loginHint: {
    color: "#888",
    textAlign: "center",
    marginTop: 15,
  },

  info: {
    color: "#555",
    marginBottom: 8,
  },
});
