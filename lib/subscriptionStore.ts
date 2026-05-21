import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { create } from "zustand";

interface SubscriptionStore {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  addSubscription: (subscription: Subscription) => Promise<void>;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  updateSubscription: (
    docId: string,
    updates: Partial<Subscription>,
  ) => Promise<void>;
  deleteSubscription: (docId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const generateId = () =>
  `${Math.random().toString(36).substring(2, 11)}-${Date.now().toString(36)}`;

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addSubscription: async (subscription) => {
    try {
      set({ loading: true, error: null });
      const newSubscription = { ...subscription, id: generateId() };
      set((state) => ({
        subscriptions: [newSubscription, ...state.subscriptions],
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to add subscription", loading: false });
      throw error;
    }
  },

  setSubscriptions: (subscriptions) => set({ subscriptions }),

  updateSubscription: async (docId, updates) => {
    try {
      set({ loading: true, error: null });
      set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === docId ? { ...sub, ...updates } : sub,
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update subscription", loading: false });
      throw error;
    }
  },

  deleteSubscription: async (docId) => {
    try {
      set({ loading: true, error: null });
      set((state) => ({
        subscriptions: state.subscriptions.filter((sub) => sub.id !== docId),
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete subscription", loading: false });
      throw error;
    }
  },
}));
