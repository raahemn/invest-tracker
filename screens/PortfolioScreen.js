import React from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Button,
    Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useContext } from "react";
import { PortfolioContext } from "../context/PortfolioContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PortfolioScreen() {
    const route = useRoute();
    const { portfolioId } = route.params;

    const { portfolios } = useContext(PortfolioContext);
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    const [buyModalVisible, setBuyModalVisible] = React.useState(false);

    if (!portfolio) {
        return (
            <View style={styles.center}>
                <Text>Portfolio not found.</Text>
            </View>
        );
    }

    const [stockName, setStockName] = React.useState("");
    const [date, setDate] = React.useState("");
    const [shares, setShares] = React.useState("");
    const [price, setPrice] = React.useState("");
    
    const handleBuy = () => {
        if (!stockName || !date || !shares || !price) {
            alert("Please fill in all fields.");
            return;
        }

        const newStock = {
            symbol: stockName.trim(),
            quantity: Number(shares),
            avgCost: Number(price),
            date: date,
        };
        
        // Add stock to portfolio
        portfolio.stocks.push(newStock);
        setBuyModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top card */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>Summary will go here</Text>
            </View>

            {/* Stock list */}
            <FlatList
                data={portfolio.stocks || []}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 20 }} // padding for scroll content so last item not hidden by bottom bar
                renderItem={({ item }) => (
                    <View style={styles.stockCard}>
                        <Text>{item.symbol}</Text>
                        <Text>Qty: {item.quantity}</Text>
                        <Text>Avg Cost: {item.avgCost}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={{ padding: 16 }}>No stocks yet.</Text>
                }
                style={{ flex: 1 }}
            />

            {/* Bottom bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.actionButton}
                    onPress={() => setBuyModalVisible(true)}
                >
                    <Text>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text>Sell</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text>Dividend</Text>
                </TouchableOpacity>
            </View>

            {/* Modal for Buy Form */}
            <Modal visible={buyModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Buy Stock</Text>

                        <TextInput
                            placeholder="Date (YYYY-MM-DD)"
                            value={date}
                            onChangeText={setDate}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Stock Name"
                            value={stockName}
                            onChangeText={setStockName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Number of Shares"
                            value={shares}
                            onChangeText={setShares}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Price per Share"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            style={styles.input}
                        />

                        <Button title="Buy" onPress={handleBuy} />
                        
                        {/* Space between these two buttons */}
                        <View style={{ height: 10 }} />
                        <Button
                            title="Cancel"
                            color="red"
                            onPress={() => setBuyModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
    },
    summaryCard: {
        padding: 16,
        backgroundColor: "#f0f0f0",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    summaryText: {
        fontSize: 18,
        fontWeight: "600",
    },
    stockCard: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    bottomBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#ccc",
    },
    actionButton: {
        padding: 10,
        backgroundColor: "#eee",
        borderRadius: 6,
    },
     modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
});
