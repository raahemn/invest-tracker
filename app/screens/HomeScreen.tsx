import React, { useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Modal,
    TextInput,
    Button,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePortfolioStore, Portfolio } from "../stores/portfolioStore";
import { v4 as uuidv4 } from "uuid";

// Optional: Type for your navigation (if using type-safe routes)
type RootStackParamList = {
    Portfolio: { portfolioId: string };
};

export default function HomeScreen() {
    const portfolios = usePortfolioStore((state) => state.portfolios);
    const addPortfolio = usePortfolioStore((state) => state.addPortfolio);
    const deletePortfolio = usePortfolioStore((state) => state.deletePortfolio);

    const [modalVisible, setModalVisible] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState("");

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleAddPortfolio = () => {
        if (!newPortfolioName.trim()) {
            Alert.alert("Please enter a portfolio name");
            return;
        }

        const newPortfolio: Portfolio = {
            id: uuidv4(),
            name: newPortfolioName.trim(),
            stocks: [],
        };

        addPortfolio(newPortfolio);
        setNewPortfolioName("");
        setModalVisible(false);
    };

    const handleDeletePortfolio = (portfolioId: string) => {
        deletePortfolio(portfolioId);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Your Portfolios</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={portfolios}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate("Portfolio", {
                                portfolioId: item.id,
                            })
                        }
                        onLongPress={() => {
                            Alert.alert(
                                "Delete Portfolio",
                                `Are you sure you want to delete "${item.name}"?`,
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: () =>
                                            handleDeletePortfolio(item.id),
                                    },
                                ]
                            );
                        }}
                    >
                        <Text style={styles.cardText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text>No portfolios yet. Tap + to add one.</Text>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <TouchableWithoutFeedback
                    onPress={() => {
                        setModalVisible(false);
                        Keyboard.dismiss();
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>
                                    New Portfolio
                                </Text>
                                <TextInput
                                    placeholder="Enter portfolio name"
                                    value={newPortfolioName}
                                    onChangeText={setNewPortfolioName}
                                    style={styles.input}
                                />
                                <Button
                                    title="Done"
                                    onPress={handleAddPortfolio}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: "#fff",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    title: {
        fontSize: 24,
        marginBottom: 12,
    },
    card: {
        padding: 16,
        marginVertical: 8,
        backgroundColor: "#eee",
        borderRadius: 8,
    },
    cardText: {
        fontSize: 18,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
        margin: 20,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#fff",
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 10,
    },
    input: {
        borderColor: "#ccc",
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        borderRadius: 6,
    },
});
