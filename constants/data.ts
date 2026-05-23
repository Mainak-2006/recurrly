import dayjs from "dayjs";
import { icons } from "./icons";

export const tabs: AppTab[] = [
  { name: "index", title: "Home", icon: icons.home },
  { name: "subscriptions", title: "Subscriptions", icon: icons.wallet },
  { name: "insights", title: "Insights", icon: icons.activity },
  { name: "settings", title: "Settings", icon: icons.setting },
];

export const HOME_USER = {
  name: "Adrian | JS Mastery",
};

export const HOME_BALANCE = {
  amount: 2489.48,
  nextRenewalDate: dayjs().add(3, "day").format("YYYY-MM-DD"),
};
