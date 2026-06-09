"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Users, Gift, Trophy, Star } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type LeaderboardUser = {
  name: string;
  referrals: number;
  earnings: number;
};

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [userId, setUserId] = useState(""); // MUST be set from auth/session

  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [referrals, setReferrals] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

 const { data: session } = useSession();

useEffect(() => {
  if (!session?.user?.id) return;

  const userId = session.user.id;

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/referral/stats?userId=${userId}`);
      const data = await res.json();

      if (data.success) {
        setReferralCode(data.data.referralCode);
        setReferrals(data.data.referrals);
        setEarnings(data.data.earnings);

        setReferralLink(
          `${window.location.origin}/register?ref=${data.data.referralCode}`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // ✅ ALWAYS STOP LOADING
    }
  };

  fetchStats();
}, [session]);

  // FETCH LEADERBOARD
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await fetch("/api/referral/leaderboard");
      const data = await res.json();

      if (data.success) {
        setLeaderboard(data.data);
      }
    };

    fetchLeaderboard();
  }, []);

  // SIMULATED LIVE EARNINGS (optional UI effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setEarnings((prev) => prev + Math.floor(Math.random() * 10));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied");
  };

  return (
    <main className="min-h-screen bg-background p-6 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black">Referral Engine</h1>
          <p className="text-muted-foreground text-sm">
            Earn real rewards by inviting users
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <Card>
            <CardContent className="p-5">
              <Users className="mb-2 text-blue-500" />
              <p className="text-xs text-muted-foreground">Total Referrals</p>
              {loading ? <Skeleton className="h-6 w-16 mt-2" /> :
                <p className="text-2xl font-black">{referrals}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <Gift className="mb-2 text-green-500" />
              <p className="text-xs text-muted-foreground">Earnings</p>
              {loading ? <Skeleton className="h-6 w-24 mt-2" /> :
                <p className="text-2xl font-black">₦{earnings}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <Trophy className="mb-2 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Rank</p>
              <p className="text-2xl font-black">#1,245</p>
            </CardContent>
          </Card>
        </div>

        {/* REFERRAL LINK */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="font-semibold text-sm">Your Referral Link</p>

            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-muted"
                />
                <Button onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LEADERBOARD */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" />
              <h2 className="font-bold">Leaderboard</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border rounded-xl p-3"
                  >
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.referrals} referrals
                      </p>
                    </div>
                    <p className="font-bold text-green-500">
                      ₦{user.earnings}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}