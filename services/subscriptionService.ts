const subscriptionDatabase = new Map<string, Subscription[]>();

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const requireUserId = (userId?: string) => {
  if (!userId) {
    throw new Error(
      "User ID is missing. Make sure Clerk user is loaded first.",
    );
  }

  return userId;
};

const getUserSubscriptions = (userId: string): Subscription[] =>
  subscriptionDatabase.get(userId) ?? [];

const setUserSubscriptions = (userId: string, subscriptions: Subscription[]) => {
  subscriptionDatabase.set(userId, subscriptions);
};

export const fetchSubscriptions = async (
  userId?: string,
): Promise<Subscription[]> => {
  const resolvedUserId = requireUserId(userId);
  const subscriptions = getUserSubscriptions(resolvedUserId);

  return [...subscriptions].sort((a, b) => {
    const aTime = new Date(a.createdAt ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? 0).getTime();
    return bTime - aTime;
  });
};

export const addSubscription = async (
  data: CreateSubscriptionInput,
  userId?: string,
): Promise<Subscription> => {
  const resolvedUserId = requireUserId(userId);
  const now = new Date().toISOString();
  const newSubscription: Subscription = {
    id: data.id ?? generateId(),
    userId: resolvedUserId,
    status: data.status ?? "active",
    currency: data.currency ?? "INR",
    createdAt: now,
    ...data,
  };

  const subscriptions = getUserSubscriptions(resolvedUserId);
  setUserSubscriptions(resolvedUserId, [newSubscription, ...subscriptions]);

  return newSubscription;
};

export const updateSubscription = async (
  subscriptionId: string,
  updates: Partial<Subscription>,
  userId?: string,
): Promise<Subscription> => {
  const resolvedUserId = requireUserId(userId);
  const subscriptions = getUserSubscriptions(resolvedUserId);
  let updatedSubscription: Subscription | null = null;

  const newSubscriptions = subscriptions.map((subscription) => {
    if (subscription.id !== subscriptionId) return subscription;

    updatedSubscription = {
      ...subscription,
      ...updates,
      id: subscription.id,
      userId: resolvedUserId,
    };

    return updatedSubscription;
  });

  if (!updatedSubscription) {
    throw new Error("Subscription not found.");
  }

  setUserSubscriptions(resolvedUserId, newSubscriptions);
  return updatedSubscription;
};

export const deleteSubscription = async (
  subscriptionId: string,
  userId?: string,
): Promise<string> => {
  const resolvedUserId = requireUserId(userId);
  const subscriptions = getUserSubscriptions(resolvedUserId);
  const newSubscriptions = subscriptions.filter(
    (subscription) => subscription.id !== subscriptionId,
  );

  if (newSubscriptions.length === subscriptions.length) {
    throw new Error("Subscription not found.");
  }

  setUserSubscriptions(resolvedUserId, newSubscriptions);
  return subscriptionId;
};
