"use client";

import { useCallback, useEffect, useState } from "react";

export interface LoginHistory {
  _id: string;
  adminId: string;
  ip: string;
  device: string;
  userAgent: string;
  success: boolean;
  createdAt: string;
}

export interface AuthenticationSettings {
  twoFA: boolean;
  email: boolean;
  sms: boolean;
  biometric: boolean;
  adminPin: boolean;
  sessionTimeout: number;

  emailVerified: boolean;
  adminOtp: boolean;

  sessionCreatedAt: string | null;
  lastPasswordChange: string | null;
}

export interface SecurityOverview {
  securityScore: number;
  authentication: string;
  activeDevices: number;
  alerts: number;
  totalAdmins: number;

  lastLogin: string | null;
  lastIp: string | null;
  lastDevice: string | null;
}

export interface SecurityResponse {
  overview: SecurityOverview;
  authentication: AuthenticationSettings;
  loginHistory: LoginHistory[];
}

export function useSecurity() {
  const [data, setData] =
    useState<SecurityResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchSecurity = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/admin/security/overview",
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load security information."
        );
      }

      const json =
        (await res.json()) as SecurityResponse;

      setData(json);
      setError(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurity();

    const interval = setInterval(() => {
      fetchSecurity();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSecurity]);

  return {
    data,
    loading,
    error,
    refresh: fetchSecurity,
  };
}