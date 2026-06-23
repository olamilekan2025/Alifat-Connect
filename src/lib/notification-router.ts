type EventType = "deposit" | "withdrawal" | "login" | "system";

export function getNotificationTargets(event: EventType) {
  switch (event) {
    case "deposit":
      return ["user", "admin"];

    case "withdrawal":
      return ["user", "admin"];

    case "login":
      return ["user"];

    case "system":
      return ["all"];

    default:
      return ["user"];
  }
}