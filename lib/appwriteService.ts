import { databases, appwriteConfig, Query } from './appwrite';
import { ID } from 'appwrite';

const validateConfig = () => {
  if (!appwriteConfig.databaseId || !appwriteConfig.subscriptionsCollectionId) {
    throw new Error('Appwrite configuration is missing. Please set environment variables.');
  }
};

export const subscriptionService = {
  async createSubscription(subscription: Subscription, userId: string) {
    try {
      validateConfig();
      const response = await databases.createDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.subscriptionsCollectionId!,
        ID.unique(),
        {
          ...subscription,
          userId,
          createdAt: new Date().toISOString(),
        }
      );
      return response;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  async getSubscriptions(userId: string) {
    try {
      validateConfig();
      const response = await databases.listDocuments(
        appwriteConfig.databaseId!,
        appwriteConfig.subscriptionsCollectionId!,
        [Query.equal('userId', userId)]
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  async updateSubscription(docId: string, updates: Partial<Subscription>) {
    try {
      validateConfig();
      const response = await databases.updateDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.subscriptionsCollectionId!,
        docId,
        updates
      );
      return response;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  async deleteSubscription(docId: string) {
    try {
      validateConfig();
      await databases.deleteDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.subscriptionsCollectionId!,
        docId
      );
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  },

  async getSubscriptionById(docId: string) {
    try {
      validateConfig();
      const response = await databases.getDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.subscriptionsCollectionId!,
        docId
      );
      return response;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  },
};
