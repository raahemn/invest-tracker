import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import { PortfolioProvider } from "./context/PortfolioContext";
import PortfolioScreen from './screens/PortfolioScreen';


const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <PortfolioProvider>
                <Stack.Navigator>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Portfolio" component={PortfolioScreen} />
                </Stack.Navigator>
            </PortfolioProvider>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
