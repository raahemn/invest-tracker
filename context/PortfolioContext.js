import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
    const [portfolios, setPortfolios] = useState([]);

    useEffect(() => {
        loadPortfolios();
    }, []);

    useEffect(() => {
        savePortfolios();
    }, [portfolios]);

    const loadPortfolios = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("portfolios");
            if (jsonValue != null) {
                setPortfolios(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.error("Failed to load portfolios", e);
        }
    };

    const savePortfolios = async () => {
        try {
            await AsyncStorage.setItem(
                "portfolios",
                JSON.stringify(portfolios)
            );
        } catch (e) {
            console.error("Failed to save portfolios", e);
        }
    };

    const addPortfolio = (name) => {
        const newPortfolio = {
            id: uuidv4(),
            name,
            stocks: [],
        };
        setPortfolios([...portfolios, newPortfolio]);
    };

    const deletePortfolio = (portfolioId) => {
        const updated = portfolios.filter((p) => p.id !== portfolioId);
        setPortfolios(updated);
    };

    const addStockToPortfolio = (portfolioId, stock) => {
        const updated = portfolios.map((p) => {
            if (p.id === portfolioId) {
                return { ...p, stocks: [...p.stocks, stock] };
            }
            return p;
        });
        setPortfolios(updated);
    };

    return (
        <PortfolioContext.Provider
            value={{
                portfolios,
                addPortfolio,
                addStockToPortfolio,
                deletePortfolio,
            }}
        >
            {children}
        </PortfolioContext.Provider>
    );
};
