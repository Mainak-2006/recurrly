// lib/subscriptionStore.ts

import {
  addSubscription as addSubscriptionService,
  deleteSubscription as deleteSubscriptionService,
  fetchSubscriptions,
  updateSubscription as updateSubscriptionService,
} from "@/services/subscriptionService";
import { create } from "zustand";

export interface SubscriptionStore {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  currentUserId: string | null;

  initialize: (userId?: string) => Promise<void>;

  addSubscription: (
    subscription: CreateSubscriptionInput,
    userId?: string,
  ) => Promise<Subscription>;

  setSubscriptions: (subscriptions: Subscription[]) => void;

  updateSubscription: (
    docId: string,
    updates: Partial<Subscription>,
    userId?: string,
  ) => Promise<Subscription>;

  deleteSubscription: (docId: string, userId?: string) => Promise<void>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  loading: false,
  error: null,
  initialized: false,
  currentUserId: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  initialize: async (userId?: string) => {
    if (!userId) return;

    const state = get();

    if (state.initialized && state.currentUserId === userId) {
      return;
    }

    set({
      loading: true,
      error: null,
      subscriptions: [],
      initialized: false,
      currentUserId: userId,
    });

    try {
      const subscriptions = await fetchSubscriptions(userId);

      set({
        subscriptions,
        initialized: true,
        loading: false,
        currentUserId: userId,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load subscriptions",
        loading: false,
        initialized: false,
      });

      throw error;
    }
  },

  addSubscription: async (subscription, userId) => {
    try {
      set({ loading: true, error: null });

      const newSubscription = await addSubscriptionService(
        subscription,
        userId,
      );

      set((state) => ({
        subscriptions: state.subscriptions.some(
          (sub) => sub.id === newSubscription.id,
        )
          ? state.subscriptions
          : [newSubscription, ...state.subscriptions],
        loading: false,
      }));

      return newSubscription;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add subscription",
        loading: false,
      });

      throw error;
    }
  },

  setSubscriptions: (subscriptions) => set({ subscriptions }),

  updateSubscription: async (docId, updates, userId) => {
    try {
      set({ loading: true, error: null });

      const updatedSubscription = await updateSubscriptionService(
        docId,
        updates,
        userId,
      );

      set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === docId ? updatedSubscription : sub,
        ),
        loading: false,
      }));

      return updatedSubscription;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update subscription",
        loading: false,
      });

      throw error;
    }
  },

  deleteSubscription: async (docId, userId) => {
    try {
      set({ loading: true, error: null });

      await deleteSubscriptionService(docId, userId);

      set((state) => ({
        subscriptions: state.subscriptions.filter((sub) => sub.id !== docId),
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete subscription",
        loading: false,
      });

      throw error;
    }
  },
}));
