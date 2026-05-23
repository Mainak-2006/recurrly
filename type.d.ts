import type { ImageSourcePropType } from "react-native";

declare global {
  export interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  export interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }
 export interface Subscription {
  id: string;
  userId?: string;
  icon?: ImageSourcePropType | string;
  name: string;
  plan?: string;
  category?: string;
  paymentMethod?: string;
  status?: "active" | "paused" | "cancelled" | string;
  startDate?: string;
  price: number;
  currency?: string;
  billing: string;
  frequency?: string;
  renewalDate?: string;
  color?: string;
  createdAt?: string;
}

 export type CreateSubscriptionInput = Omit<
  Subscription,
  "id" | "createdAt" | "userId"
> & {
  id?: string;
};

  export interface SubscriptionCardProps extends Omit<Subscription, "id"> {
    expanded: boolean;
    onPress: () => void;
    onUpdatePress?: () => void;
    onDeletePress?: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  export interface UpcomingSubscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    price: number;
    currency?: string;
    daysLeft: number;
  }

  export interface UpcomingSubscriptionCardProps extends Omit<
    UpcomingSubscription,
    "id"
  > {}

  export  interface ListHeadingProps {
    title: string;
  }
}

export { };

