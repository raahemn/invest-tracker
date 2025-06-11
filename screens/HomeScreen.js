import React, { useState, useLayoutEffect, useContext } from "react";
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
import { Ionicons } from "@expo/vector-icons"; // for the plus icon
import { useNavigation } from "@react-navigation/native";
import { PortfolioContext } from "../context/PortfolioContext";
import { SafeAreaView } from "react-native-safe-area-context";


export default function HomeScreen() {
    const { portfolios, addPortfolio, deletePortfolio } = useContext(PortfolioContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState("");

    const navigation = useNavigation();

    const handleAddPortfolio = () => {
        if (!newPortfolioName.trim()) {
            Alert.alert("Please enter a portfolio name");
            return;
        }

        addPortfolio(newPortfolioName.trim());

        setNewPortfolioName("");
        setModalVisible(false);
    };

    const handleDeletePortfolio = (portfolioId) => {
        deletePortfolio(portfolioId);
    }

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
                                    {
                                        text: "Cancel",
                                        style: "cancel",
                                    },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: () => handleDeletePortfolio(item.id),
                                    },
                                ]
                            );
                        }
                        }
                    >
                        <Text style={styles.cardText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text>No portfolios yet. Tap + to add one.</Text>
                }
            />

            {/* Modal to input new portfolio */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <TouchableWithoutFeedback
                    onPress={() => {
                        setModalVisible(false); // close modal when background pressed
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
