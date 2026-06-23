import User from "@/models/User";
import Notification from "@/models/Notification";
import { getNotificationTargets } from "./notification-router";

type EventType = "deposit" | "withdrawal" | "login" | "system";

export async function sendNotification({
  event,
  title,
  message,
  userId,
}: {
  event: EventType;
  title: string;
  message: string;
  userId?: string;
}) {
  const targets = getNotificationTargets(event);

  let users: any[] = [];

  // 🔥 USER TARGET
  if (targets.includes("user") && userId) {
    users.push({ _id: userId });
  }

  // 🔥 ADMIN TARGET
  if (targets.includes("admin")) {
    const admins = await User.find({ role: "admin" }, "_id");
    users.push(...admins);
  }

  // 🔥 ALL USERS
  if (targets.includes("all")) {
    users = await User.find({}, "_id");
  }

  const notifications = users.map((u) => ({
    userId: u._id,
    title,
    message,
    type: event,
  }));

  await Notification.insertMany(notifications);
}