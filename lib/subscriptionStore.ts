import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { create } from "zustand";
import { subscriptionService } from "./appwriteService";

interface SubscriptionStore {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  addSubscription: (
    subscription: Subscription,
    userId?: string,
  ) => Promise<void>;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  fetchSubscriptions: (userId: string) => Promise<void>;
  updateSubscription: (
    docId: string,
    updates: Partial<Subscription>,
  ) => Promise<void>;
  deleteSubscription: (docId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addSubscription: async (subscription, userId) => {
    try {
      set({ loading: true, error: null });
      if (userId) {
        const response = await subscriptionService.createSubscription(
          subscription,
          userId,
        );
        set((state) => ({
          subscriptions: [
            { ...subscription, $id: response.$id } as Subscription,
            ...state.subscriptions,
          ],
          loading: false,
        }));
      } else {
        set((state) => ({
          subscriptions: [subscription, ...state.subscriptions],
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: "Failed to add subscription", loading: false });
      throw error;
    }
  },

  setSubscriptions: (subscriptions) => set({ subscriptions }),

  fetchSubscriptions: async (userId) => {
    try {
      set({ loading: true, error: null });
      const docs = await subscriptionService.getSubscriptions(userId);
      set({ subscriptions: docs as unknown as Subscription[], loading: false });
    } catch (error) {
      set({ error: "Failed to fetch subscriptions", loading: false });
      throw error;
    }
  },

  updateSubscription: async (docId, updates) => {
    try {
      set({ loading: true, error: null });
      await subscriptionService.updateSubscription(docId, updates);
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
      await subscriptionService.deleteSubscription(docId);
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
