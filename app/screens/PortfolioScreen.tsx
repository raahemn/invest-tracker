import React, { useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Button,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    usePortfolioStore,
    Transaction,
    Portfolio,
} from "../stores/portfolioStore";

type RootStackParamList = {
    Portfolio: { portfolioId: string };
};

export default function PortfolioScreen() {
    const route = useRoute<RouteProp<RootStackParamList, "Portfolio">>();
    const { portfolioId } = route.params;

    const portfolios = usePortfolioStore((state) => state.portfolios);
    const updatePortfolio = usePortfolioStore((state) => state.updatePortfolio);
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    const [buyModalVisible, setBuyModalVisible] = useState(false);
    const [sellModalVisible, setSellModalVisible] = useState(false);
    const [dividendModalVisible, setDividendModalVisible] = useState(false);

    const [stockName, setStockName] = useState("");
    const [date, setDate] = useState(new Date());
    const [shares, setShares] = useState("");
    const [price, setPrice] = useState("");
    const [dividendAmount, setDividendAmount] = useState("");

    if (!portfolio) {
        return (
            <View style={styles.center}>
                <Text>Portfolio not found.</Text>
            </View>
        );
    }

    const handleTransaction = (type: Transaction["type"]) => {
        if (!stockName || !date) {
            alert("Please fill in stock name and date.");
            return;
        }

        let newTransaction: Transaction;

        if (type === "dividend") {
            if (!dividendAmount) {
                alert("Please enter dividend amount.");
                return;
            }

            newTransaction = {
                type,
                symbol: stockName.trim(),
                amount: Number(dividendAmount),
                date,
            };
        } else {
            if (!shares || !price) {
                alert("Please fill in quantity and price.");
                return;
            }

            const quantity = Number(shares);
            const priceNum = Number(price);

            newTransaction = {
                type,
                symbol: stockName.trim(),
                quantity,
                price: priceNum,
                date,
            };

            if (type === "sell") {
                const totalBought =
                    portfolio.transactions
                        ?.filter(
                            (tx: Transaction) =>
                                tx.symbol === stockName && tx.type === "buy"
                        )
                        .reduce(
                            (sum: number, tx: Transaction) =>
                                sum + (tx.quantity || 0),
                            0
                        ) || 0;

                const totalSold =
                    portfolio.transactions
                        ?.filter(
                            (tx: Transaction) =>
                                tx.symbol === stockName && tx.type === "sell"
                        )
                        .reduce(
                            (sum: number, tx: Transaction) =>
                                sum + (tx.quantity || 0),
                            0
                        ) || 0;

                const currentOwned = totalBought - totalSold;

                if (quantity > currentOwned) {
                    alert("Not enough shares to sell!");
                    return;
                }
            }
        }

        const updatedPortfolio = {
            ...portfolio,
            transactions: [...(portfolio.transactions || []), newTransaction],
        };

        updatePortfolio(portfolio.id, updatedPortfolio);

        setBuyModalVisible(false);
        setSellModalVisible(false);
        setDividendModalVisible(false);
        setStockName("");
        setShares("");
        setPrice("");
        setDividendAmount("");
    };

    type StockAggregation = {
        symbol: string;
        netQuantity: number;
        totalCost: number;
    };

    const aggregatedStocks = Object.values(
        (portfolio.transactions || []).reduce(
            (acc: Record<string, StockAggregation>, tx: Transaction) => {
                const { symbol, quantity = 0, price = 0, type } = tx;

                if (!acc[symbol]) {
                    acc[symbol] = {
                        symbol,
                        netQuantity: 0,
                        totalCost: 0,
                    };
                }

                const stock = acc[symbol];

                if (type === "buy") {
                    stock.netQuantity += quantity;
                    stock.totalCost += quantity * price;
                } else if (type === "sell") {
                    const avgCostPerShare =
                        stock.netQuantity > 0
                            ? stock.totalCost / stock.netQuantity
                            : 0;

                    stock.netQuantity -= quantity;
                    stock.totalCost -= quantity * avgCostPerShare;

                    if (stock.netQuantity < 0) stock.netQuantity = 0;
                    if (stock.totalCost < 0) stock.totalCost = 0;
                }

                return acc;
            },
            {} as Record<string, StockAggregation>
        )
    )
        .filter((stock: StockAggregation) => stock.netQuantity > 0)
        .map((stock: StockAggregation) => ({
            symbol: stock.symbol,
            quantity: stock.netQuantity,
            avgCost: (stock.totalCost / stock.netQuantity).toFixed(2),
        }));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>Summary will go here</Text>
            </View>

            <FlatList
                data={aggregatedStocks}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
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

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setBuyModalVisible(true)}
                >
                    <Text>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setSellModalVisible(true)}
                >
                    <Text>Sell</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setDividendModalVisible(true)}
                >
                    <Text>Dividend</Text>
                </TouchableOpacity>
            </View>

            {/* Buy Modal */}
            <Modal visible={buyModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TextInput
                            placeholder="Stock Name"
                            value={stockName}
                            onChangeText={setStockName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Shares"
                            value={shares}
                            onChangeText={setShares}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Price"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <Button
                            title="Buy"
                            onPress={() => handleTransaction("buy")}
                        />
                        <View style={{ height: 10 }} />
                        <Button
                            title="Cancel"
                            color="red"
                            onPress={() => setBuyModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>

            {/* Sell Modal */}
            <Modal visible={sellModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TextInput
                            placeholder="Stock Name"
                            value={stockName}
                            onChangeText={setStockName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Shares"
                            value={shares}
                            onChangeText={setShares}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Price"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <Button
                            title="Sell"
                            onPress={() => handleTransaction("sell")}
                        />
                        <View style={{ height: 10 }} />
                        <Button
                            title="Cancel"
                            color="red"
                            onPress={() => setSellModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>

            {/* Dividend Modal */}
            <Modal
                visible={dividendModalVisible}
                animationType="slide"
                transparent
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TextInput
                            placeholder="Stock Symbol"
                            value={stockName}
                            onChangeText={setStockName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Dividend Amount"
                            value={dividendAmount}
                            onChangeText={setDividendAmount}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <Button
                            title="Add Dividend"
                            onPress={() => handleTransaction("dividend")}
                        />
                        <View style={{ height: 10 }} />
                        <Button
                            title="Cancel"
                            color="red"
                            onPress={() => setDividendModalVisible(false)}
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
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
