"use client";

import { useState, useEffect } from "react";

import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Moon,
  Loader2,
  KeyRound,
} from "lucide-react";

import { useTheme } from "next-themes";

import { signOut } from "next-auth/react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [mounted, setMounted] = useState(false);

  const [notifications, setNotifications] = useState(true);

  const [emailAlerts, setEmailAlerts] = useState(true);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(false);

  const [loadingPassword, setLoadingPassword] = useState(false);

  const [loadingDelete, setLoadingDelete] = useState(false);

  const [loadingData, setLoadingData] = useState(true);

  const { resolvedTheme, setTheme } = useTheme();

  const [paymentPin, setPaymentPin] = useState("");

  const [forgotPinLoading, setForgotPinLoading] =
  useState(false);

const [confirmPaymentPin, setConfirmPaymentPin] =
  useState("");

const [showPaymentPin, setShowPaymentPin] =
  useState(false);

const [loadingPaymentPin, setLoadingPaymentPin] =
  useState(false);


  const [openVerifyPinModal, setOpenVerifyPinModal] =
  useState(false);

const [verificationToken, setVerificationToken] =
  useState("");

const [newResetPin, setNewResetPin] =
  useState("");

const [confirmResetPin, setConfirmResetPin] =
  useState("");

const [verifyLoading, setVerifyLoading] =
  useState(false);

  useEffect(() => {
    setMounted(true);

    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/settings");

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to load settings");

        return;
      }

      setName(data.user.name || "");

      setEmail(data.user.email || "");

      setNotifications(data.settings.notifications);

      setEmailAlerts(data.settings.emailAlerts);
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSaveProfile() {
    try {
      setLoadingProfile(true);

      const response = await fetch("/api/settings", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          notifications,
          emailAlerts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update profile");

        return;
      }

      toast.success("Profile updated successfully");

      window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handleUpdatePassword() {
    try {
      if (!currentPassword || !newPassword) {
        toast.error("Please fill all password fields");

        return;
      }

      setLoadingPassword(true);

      const response = await fetch("/api/settings", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update password");

        return;
      }

      toast.success("Password updated successfully");

      setCurrentPassword("");

      setNewPassword("");

      await signOut({
        callbackUrl: "/auth/login",
      });
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setLoadingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      setLoadingDelete(true);

      const response = await fetch("/api/settings", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to delete account");

        return;
      }

      toast.success("Account deleted successfully");

      await signOut({
        callbackUrl: "/",
      });
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setLoadingDelete(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  async function handleNotificationUpdate(
    type: "notifications" | "emailAlerts",
    value: boolean,
  ) {
    try {
      if (type === "notifications") {
        setNotifications(value);
      } else {
        setEmailAlerts(value);
      }

      const response = await fetch("/api/settings", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          notifications: type === "notifications" ? value : notifications,

          emailAlerts: type === "emailAlerts" ? value : emailAlerts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update notifications");

        return;
      }

      toast.success("Notification settings updated");
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    }
  }



  async function handleSetPaymentPin() {
  try {
    if (!paymentPin || !confirmPaymentPin) {
      toast.error("Fill all payment PIN fields");

      return;
    }

    if (paymentPin.length !== 4) {
      toast.error("Payment PIN must be 4 digits");

      return;
    }

    if (paymentPin !== confirmPaymentPin) {
      toast.error("PIN does not match");

      return;
    }

    setLoadingPaymentPin(true);

    const response = await fetch("/api/settings", {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        paymentPin,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(
        data.message ||
          "Failed to set payment PIN",
      );

      return;
    }

    toast.success(
      "Payment PIN updated successfully",
    );

    setPaymentPin("");

    setConfirmPaymentPin("");
  } catch (error) {
    console.error(error);

    toast.error("Something went wrong");
  } finally {
    setLoadingPaymentPin(false);
  }
}



async function handleResetPaymentPin() {
  try {
    setForgotPinLoading(true);

    const response = await fetch(
      "/api/settings/reset-pin",
      {
        method: "POST",
      },
    );

    const data =
      await response.json();

    if (!response.ok) {
      toast.error(
        data.message ||
          "Failed to send verification token",
      );

      return;
    }

    toast.success(
      "Verification token sent to your email",
    );

    // OPEN VERIFY MODAL
    setOpenVerifyPinModal(true);
  } catch (error) {
    console.error(error);

    toast.error(
      "Something went wrong",
    );
  } finally {
    setForgotPinLoading(false);
  }
}


async function handleVerifyResetPin() {
  try {
    if (
      !verificationToken ||
      !newResetPin ||
      !confirmResetPin
    ) {
      toast.error(
        "Fill all fields",
      );

      return;
    }

    if (
      newResetPin.length !== 4
    ) {
      toast.error(
        "PIN must be 4 digits",
      );

      return;
    }

    if (
      newResetPin !==
      confirmResetPin
    ) {
      toast.error(
        "PIN does not match",
      );

      return;
    }

    setVerifyLoading(true);

    const response =
      await fetch(
        "/api/settings/verify-reset-pin",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            token:
              verificationToken,
            newPin:
              newResetPin,
          }),
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      toast.error(
        data.message ||
          "Verification failed",
      );

      return;
    }

    toast.success(
      "Payment PIN reset successful",
    );

    setVerificationToken("");
    setNewResetPin("");
    setConfirmResetPin("");

    setOpenVerifyPinModal(false);
  } catch (error) {
    console.error(error);

    toast.error(
      "Something went wrong",
    );
  } finally {
    setVerifyLoading(false);
  }


  
}
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* PROFILE */}
      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <User className="h-5 w-5" />
            </div>

            <div>
              <CardTitle>Profile Information</CardTitle>

              <CardDescription>Update your personal details.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>

              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={loadingProfile}
            className="h-12 rounded-2xl"
          >
            {loadingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* PASSWORD */}
      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <Lock className="h-5 w-5" />
            </div>

            <div>
              <CardTitle>Security</CardTitle>

              <CardDescription>Update your password.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Current Password</Label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-12 rounded-2xl pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>

            <Input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 rounded-2xl"
            />
          </div>

          <Button
            onClick={handleUpdatePassword}
            disabled={loadingPassword}
            className="h-12 rounded-2xl"
          >
            {loadingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* APPEARANCE */}
      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <Moon className="h-5 w-5" />
            </div>

            <div>
              <CardTitle>Appearance</CardTitle>

              <CardDescription>Customize your theme.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {mounted && (
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-medium">Dark Mode</p>

                <p className="text-sm text-zinc-500">Switch dashboard theme.</p>
              </div>

              <Switch
                checked={resolvedTheme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* NOTIFICATIONS */}
      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <Bell className="h-5 w-5" />
            </div>

            <div>
              <CardTitle>Notifications</CardTitle>

              <CardDescription>Manage notification settings.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Push Notifications</p>

              <p className="text-sm text-zinc-500">
                Receive transaction alerts.
              </p>
            </div>

            <Switch
              checked={notifications}
              onCheckedChange={(checked) =>
                handleNotificationUpdate("notifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Email Alerts</p>

              <p className="text-sm text-zinc-500">
                Receive updates via email.
              </p>
            </div>

            <Switch
              checked={emailAlerts}
              onCheckedChange={(checked) =>
                handleNotificationUpdate("emailAlerts", checked)
              }
            />
          </div>
        </CardContent>
      </Card>


      {/* PAYMENT PIN */}
<Card className="rounded-3xl">
  <CardHeader>
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
        <KeyRound className="h-5 w-5" />
      </div>

      <div>
        <CardTitle>Payment PIN</CardTitle>

        <CardDescription>
          Set a secure 4-digit PIN for
          airtime, data, bills and
          transfers.
        </CardDescription>
      </div>
    </div>
  </CardHeader>

  <CardContent className="space-y-5">
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <Label>New Payment PIN</Label>

        <div className="relative">
          <Input
            type={
              showPaymentPin
                ? "text"
                : "password"
            }
            maxLength={4}
            placeholder="****"
            value={paymentPin}
            onChange={(e) =>
              setPaymentPin(
                e.target.value.replace(
                  /\D/g,
                  "",
                ),
              )
            }
            className="h-12 rounded-2xl pr-12 text-center text-lg tracking-[8px]"
          />

          <button
            type="button"
            onClick={() =>
              setShowPaymentPin(
                !showPaymentPin,
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {showPaymentPin ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Confirm PIN</Label>

        <Input
          type={
            showPaymentPin
              ? "text"
              : "password"
          }
          maxLength={4}
          placeholder="****"
          value={confirmPaymentPin}
          onChange={(e) =>
            setConfirmPaymentPin(
              e.target.value.replace(
                /\D/g,
                "",
              ),
            )
          }
          className="h-12 rounded-2xl text-center text-lg tracking-[8px]"
        />
      </div>
    </div>

    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Your payment PIN will be used
        for airtime, data purchase,
        utilities, cable TV and wallet
        transactions.
      </p>
    </div>

    <Button
      onClick={handleSetPaymentPin}
      disabled={loadingPaymentPin}
      className="h-12 rounded-2xl"
    >
      {loadingPaymentPin ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving PIN...
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          Save Payment PIN
        </>
      )}
    </Button>
  </CardContent>
</Card>



<Card className="rounded-3xl">
  <CardHeader>
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
        <Shield className="h-5 w-5" />
      </div>

      <div>
        <CardTitle>
          Payment PIN
        </CardTitle>

        <CardDescription>
          Reset your transaction PIN.
        </CardDescription>
      </div>
    </div>
  </CardHeader>

  <CardContent>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="h-12 rounded-2xl"
        >
          Forgot Payment PIN
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Reset Payment PIN?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Your current payment PIN
            will be removed. You
            will need to create a
            new one.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-2xl">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={
              handleResetPaymentPin
            }
            disabled={
              forgotPinLoading
            }
            className="rounded-2xl"
          >
            {forgotPinLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset PIN"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </CardContent>
</Card>

      {/* DELETE ACCOUNT */}
      <Card className="rounded-3xl border-red-200 dark:border-red-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40">
              <Shield className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>

              <CardDescription>
                Permanently delete your account.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-12 rounded-2xl">
                Delete Account
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>

                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-2xl">
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={loadingDelete}
                  className="rounded-2xl bg-red-600 hover:bg-red-700"
                >
                  {loadingDelete ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

{/* VERIFY RESET PIN MODAL */}
<Dialog
  open={openVerifyPinModal}
  onOpenChange={
    setOpenVerifyPinModal
  }
>
  <DialogContent className="rounded-3xl">
    <DialogHeader>
      <DialogTitle>
        Verify Reset Token
      </DialogTitle>

      <DialogDescription>
        Enter the verification token
        sent to your email and create
        a new payment PIN.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-5">
      <div className="space-y-2">
        <Label>
          Verification Token
        </Label>

        <Input
          placeholder="Enter token"
          value={verificationToken}
          onChange={(e) =>
            setVerificationToken(
              e.target.value,
            )
          }
          className="h-12 rounded-2xl"
        />
      </div>

      <div className="space-y-2">
        <Label>
          New Payment PIN
        </Label>

        <Input
          type="password"
          maxLength={4}
          placeholder="****"
          value={newResetPin}
          onChange={(e) =>
            setNewResetPin(
              e.target.value.replace(
                /\D/g,
                "",
              ),
            )
          }
          className="h-12 rounded-2xl text-center tracking-[8px]"
        />
      </div>

      <div className="space-y-2">
        <Label>
          Confirm Payment PIN
        </Label>

        <Input
          type="password"
          maxLength={4}
          placeholder="****"
          value={confirmResetPin}
          onChange={(e) =>
            setConfirmResetPin(
              e.target.value.replace(
                /\D/g,
                "",
              ),
            )
          }
          className="h-12 rounded-2xl text-center tracking-[8px]"
        />
      </div>

      <Button
        onClick={
          handleVerifyResetPin
        }
        disabled={verifyLoading}
        className="h-12 w-full rounded-2xl"
      >
        {verifyLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify & Reset PIN"
        )}
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}
