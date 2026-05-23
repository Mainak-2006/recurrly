import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const clerkUserId = user?.id;
  const currentUserId = clerkUserId ? clerkUserId : undefined;
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    initialize,
  } = useSubscriptionStore();

  useEffect(() => {
    if (currentUserId) {
      initialize(currentUserId).catch((error) => {
        console.error("Failed to initialize subscriptions:", error);
      });
    }
  }, [currentUserId, initialize]);

  // Get upcoming subscriptions (active subscriptions with renewal date within next 7 days)

  const upcomingSubscriptions = useMemo(() => {
    const now = dayjs().startOf("day");
    return subscriptions
      .filter((sub) => {
        if (sub.status !== "active") return false;
        const daysLeft = dayjs(sub.renewalDate).startOf("day").diff(now, "day");
        return daysLeft >= 0 && daysLeft <= 7;
      })
      .map((sub) => ({
        id: sub.id,
        icon:
          typeof sub.icon === "string" || sub.icon === undefined
            ? icons.plus
            : sub.icon,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: dayjs(sub.renewalDate).startOf("day").diff(now, "day"),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  const handleSubscriptionPress = (item: Subscription) => {
    setExpandedSubscriptionId((currentId) =>
      currentId === item.id ? null : item.id,
    );
  };

  const handleCreateSubscription = (newSubscription: Subscription) => {
    addSubscription(newSubscription, currentUserId).catch((error) => {
      console.error("Failed to create subscription:", error);
    });
  };

  const handleToggleSubscriptionStatus = (subscription: Subscription) => {
    const nextStatus = subscription.status === "active" ? "paused" : "active";
    updateSubscription(
      subscription.id,
      { status: nextStatus },
      currentUserId,
    ).catch((error) => {
      console.error("Failed to update subscription:", error);
    });
  };

  const handleDeleteSubscription = (subscriptionId: string) => {
    deleteSubscription(subscriptionId, currentUserId).catch((error) => {
      console.error("Failed to delete subscription:", error);
    });
  };

  // Get user display name: firstName, fullName, or email
  const displayName =
    user?.username ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard
                    {...item}
                    daysLeft={item.daysLeft}
                  />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item)}
            onUpdatePress={() => handleToggleSubscriptionStatus(item)}
            onDeletePress={() => handleDeleteSubscription(item.id)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
