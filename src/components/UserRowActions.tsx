"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserRowActions({ user }: { user: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit form states
  const [role, setRole] = useState(user.role || "user");
  const [accountType, setAccountType] = useState(user.accountType || "user");
  const [walletBalance, setWalletBalance] = useState(user.walletBalance || 0);

  async function handleToggleSuspend() {
    if (!confirm(`Are you sure you want to ${user.isSuspended ? "Unsuspend" : "Suspend"} this user?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !user.isSuspended }),
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("CRITICAL WARNING: Are you entirely sure you want to delete this user profile? This action is permanent.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveChanges() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, accountType, walletBalance: Number(walletBalance) }),
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const fullName = user.name || `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || "-";

  return (
    <>
      <tr className={`border-b transition-colors ${user.isSuspended ? "bg-red-500/10 dark:bg-red-950/20" : ""}`}>
        <td className="p-3 font-medium">
          {fullName} {user.isSuspended && <span className="ml-1 rounded bg-red-500 px-1.5 py-0.5 text-[10px] text-white">SUSPENDED</span>}
        </td>
        <td className="p-3">{user.email}</td>
        <td className="p-3">{user.phone || "-"}</td>
        <td className="p-3">
          {isEditing ? (
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded border p-1 text-xs dark:bg-zinc-800">
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          ) : (
            <span className="capitalize">{user.role}</span>
          )}
        </td>
        <td className="p-3">
          {isEditing ? (
            <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="rounded border p-1 text-xs dark:bg-zinc-800">
              <option value="user">User</option>
              <option value="seller">Seller</option>
            </select>
          ) : (
            <span className="capitalize">{user.accountType}</span>
          )}
        </td>
        <td className="p-3">
          {isEditing ? (
            <input
              type="number"
              value={walletBalance}
              onChange={(e) => setWalletBalance(e.target.value)}
              className="w-24 rounded border p-1 text-xs dark:bg-zinc-800"
            />
          ) : (
            `₦${Number(user.walletBalance ?? 0).toLocaleString()}`
          )}
        </td>
        <td className="p-3">{user.emailVerified ? "✅" : "❌"}</td>
        <td className="p-3">{user.referralsCount ?? 0}</td>
        <td className="p-3">{user.subscriptionActive ? user.subscriptionType : "-"}</td>
        <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
        
        {/* Dynamic Interactive Panel Actions */}
        <td className="p-3 flex items-center gap-2">
          {isEditing ? (
            <>
              <button disabled={loading} onClick={handleSaveChanges} className="rounded bg-green-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-green-500">
                Save
              </button>
              <button disabled={loading} onClick={() => setIsEditing(false)} className="rounded bg-zinc-400 px-2.5 py-1 text-xs font-bold text-white hover:bg-zinc-300">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button disabled={loading} onClick={() => setIsEditing(true)} className="rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500">
                Edit
              </button>
              <button disabled={loading} onClick={handleToggleSuspend} className={`rounded px-2.5 py-1 text-xs font-semibold text-white ${user.isSuspended ? "bg-amber-600 hover:bg-amber-500" : "bg-orange-600 hover:bg-orange-500"}`}>
                {user.isSuspended ? "Unsuspend" : "Suspend"}
              </button>
              <button disabled={loading} onClick={handleDelete} className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500">
                Delete
              </button>
            </>
          )}
        </td>
      </tr>
    </>
  );
}