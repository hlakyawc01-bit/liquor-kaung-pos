import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";

const STORE_NAME = "AUNG";

const INITIAL_PRODUCTS = [
  { id: "1", name: "Whisky", price: 45.0 },
  { id: "2", name: "Beer", price: 8.5 },
  { id: "3", name: "Wine", price: 35.0 },
  { id: "4", name: "Vodka", price: 40.0 },
];

const money = (amount) => `S$ ${Number(amount).toFixed(2)}`;

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const addToCart = (product) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);

      if (found) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...current, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, qty: item.qty + amount }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const addProduct = () => {
    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert("Error", "Product Name and Price ထည့်ပါ");
      return;
    }

    const price = Number(newPrice.replace(/[^0-9.]/g, ""));

    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Price မှန်ကန်စွာထည့်ပါ");
      return;
    }

    setProducts((current) => [
      ...current,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        price,
      },
    ]);

    setNewName("");
    setNewPrice("");
    setModalVisible(false);
  };

  const checkout = () => {
    if (cart.length === 0) {
      Alert.alert("Cart Empty", "ပစ္စည်းတစ်ခုခု ရွေးပါ");
      return;
    }

    Alert.alert(
      "SALE COMPLETE",
      `Total: ${money(total)}\nThank you!`
    );

    setCart([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.storeName}>AUNG</Text>
        <Text style={styles.subtitle}>POS SYSTEM • SINGAPORE</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search product..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.productSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRODUCTS</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ ADD</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.productName}>{item.name}</Text>

              <Text style={styles.productPrice}>
                {money(item.price)}
              </Text>

              <Text style={styles.tapText}>Tap to Add</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.cartSection}>
        <Text style={styles.cartTitle}>CART</Text>

        <ScrollView style={styles.cartList}>
          {cart.length === 0 ? (
            <Text style={styles.emptyText}>
              No products in cart
            </Text>
          ) : (
            cart.map((item) => (
              <View style={styles.cartItem} key={item.id}>
                <View style={styles.cartInfo}>
                  <Text style={styles.cartName}>{item.name}</Text>

                  <Text style={styles.cartPrice}>
                    {money(item.price)}
                  </Text>
                </View>

                <View style={styles.qtyBox}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => changeQty(item.id, -1)}
                  >
                    <Text style={styles.qtyText}>−</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyNumber}>{item.qty}</Text>

                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => changeQty(item.id, 1)}
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>TOTAL</Text>

          <Text style={styles.totalPrice}>
            {money(total)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={checkout}
        >
          <Text style={styles.checkoutText}>
            ✓ CHECKOUT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setCart([])}
        >
          <Text style={styles.clearText}>
            CLEAR CART
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              ADD PRODUCT
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={styles.input}
              placeholder="Price (S$)"
              keyboardType="decimal-pad"
              value={newPrice}
              onChangeText={setNewPrice}
            />

            <TouchableOpacity
              style={styles.saveProductButton}
              onPress={addProduct}
            >
              <Text style={styles.saveProductText}>
                SAVE PRODUCT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },

  header: {
    backgroundColor: "#243861",
    paddingVertical: 16,
    alignItems: "center",
  },

  storeName: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 1.5,
  },

  search: {
    backgroundColor: "#ffffff",
    margin: 12,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d9dee7",
  },

  productSection: {
    flex: 1,
    paddingHorizontal: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#243861",
  },

  addButton: {
    backgroundColor: "#243861",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  addButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  productList: {
    paddingBottom: 8,
  },

  productCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    margin: 5,
    minHeight: 100,
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
    elevation: 2,
  },

  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1c2638",
  },

  productPrice: {
    color: "#16a34a",
    fontSize: 16,
    fontWeight: "bold",
  },

  tapText: {
    color: "#94a3b8",
    fontSize: 11,
  },

  cartSection: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#d9dee7",
    padding: 12,
    maxHeight: 300,
  },

  cartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#243861",
    marginBottom: 5,
  },

  cartList: {
    maxHeight: 110,
  },

  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    paddingVertical: 15,
  },

  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderColor: "#eef1f6",
  },

  cartInfo: {
    flex: 1,
  },

  cartName: {
    fontWeight: "bold",
    color: "#1c2638",
  },

  cartPrice: {
    color: "#64748b",
    fontSize: 13,
  },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e8edf5",
    alignItems: "center",
    justifyContent: "center",
  },

  qtyText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#243861",
  },

  qtyNumber: {
    width: 32,
    textAlign: "center",
    fontWeight: "bold",
  },

  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#243861",
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#16a34a",
  },

  checkoutButton: {
    backgroundColor: "#16a34a",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  checkoutText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },

  clearButton: {
    padding: 9,
    alignItems: "center",
  },

  clearText: {
    color: "#dc2626",
    fontWeight: "bold",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 25,
  },

  modalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#243861",
    marginBottom: 18,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d9dee7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },

  saveProductButton: {
    backgroundColor: "#243861",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveProductText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  cancelButton: {
    padding: 13,
    alignItems: "center",
  },

  cancelText: {
    color: "#dc2626",
    fontWeight: "bold",
  },
});
