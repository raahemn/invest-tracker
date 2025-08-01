import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Transaction = {
    type: "buy" | "sell" | "dividend";
    symbol: string;
    quantity?: number;
    price?: number;
    amount?: number;
    date: Date;
};

export type Portfolio = {
    id: string;
    name: string;
    stocks: { symbol: string; quantity: number; avgCost: number }[];
    transactions?: Transaction[];
};

type PortfolioState = {
    portfolios: Portfolio[];
    addPortfolio: (portfolio: Portfolio) => void;
    deletePortfolio: (id: string) => void;
    updatePortfolio: (id: string, updated: Portfolio) => void;
    setPortfolios: (portfolios: Portfolio[]) => void;
};

export const usePortfolioStore = create<PortfolioState>()(
    persist(
        (set, get) => ({
            portfolios: [],

            addPortfolio: (portfolio) =>
                set((state) => ({
                    portfolios: [...state.portfolios, portfolio],
                })),

            deletePortfolio: (id) =>
                set((state) => ({
                    portfolios: state.portfolios.filter((p) => p.id !== id),
                })),

            updatePortfolio: (id, updated) =>
                set((state) => ({
                    portfolios: state.portfolios.map((p) =>
                        p.id === id ? updated : p
                    ),
                })),

            setPortfolios: (portfolios) => set({ portfolios }),
        }),
        {
            name: "portfolio-storage", // Key in AsyncStorage
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
