"use client";

import { useEffect, useState } from "react";

import NotificationForm from "../../../components/admin/notification-form";
import { Button } from "@/components/ui/button";

type Notification = {
  _id: string;
  title: string;
  message: string;
  audience: string;
  priority: string;
  status: string;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/notifications");
      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications ?? []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Notifications
          </h1>

          <Button onClick={() => setShowCreateModal(true)}>
            New Notification
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4">Title</th>
                <th className="p-4">Audience</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    No notifications found.
                  </td>
                </tr>
              ) : (
                notifications.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-4">{item.title}</td>
                    <td className="p-4">{item.audience}</td>
                    <td className="p-4">{item.priority}</td>
                    <td className="p-4">{item.status}</td>
                    <td className="p-4">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-background border shadow-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Create Notification
              </h2>

              <Button
                variant="ghost"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </Button>
            </div>

            <NotificationForm
              onCancel={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false);
                loadNotifications();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}