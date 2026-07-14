import { AdminChatDashboard } from "../../../components/admin/chat/AdminChatDashboard";
import { ChatProvider } from "../../../context/ChatContext";

export default function AdminChatPage() {
  return (
    <ChatProvider>
      <AdminChatDashboard />
    </ChatProvider>
  );
}