import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { user } = useUser();
  const clerkUserId = user?.id;
  const currentUserId = clerkUserId ? clerkUserId : undefined;
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { subscriptions, loading, error, initialize } = useSubscriptionStore();

  useEffect(() => {
    initialize(currentUserId).catch((error) => {
      console.error("Failed to initialize subscriptions:", error);
    });
  }, [currentUserId, initialize]);

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.category
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      subscription.plan?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5">
        <Text className="text-3xl font-bold text-dark mb-5">Subscriptions</Text>
        <TextInput
          className="bg-card rounded-xl px-4 py-3 text-dark mb-4"
          placeholder="Search subscriptions..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error ? (
        <View className="px-5 pt-2">
          <Text className="text-danger text-base">{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-base text-dark">Loading subscriptions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
            />
          )}
          ListEmptyComponent={
            <View className="px-5 pt-5">
              <Text className="text-base text-dark">
                No subscriptions found.
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </SafeAreaView>
  );
};
export default Subscriptions;
