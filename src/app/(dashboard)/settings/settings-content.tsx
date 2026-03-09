// src/app/(dashboard)/settings/settings-content.tsx
"use client";

import { Lock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { api } from "@/lib/api-client";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
}

export function SettingsContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: Profile }>("/auth/profile")
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account settings</p>
      </div>

      {profile && <ProfileSection profile={profile} onUpdate={setProfile} />}
      <ChangePasswordSection />
    </div>
  );
}

function ProfileSection({
  profile,
  onUpdate,
}: {
  profile: Profile;
  onUpdate: (p: Profile) => void;
}) {
  const [name, setName] = useState(profile.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put<{ data: Profile }>("/auth/profile", { name });
      onUpdate(res.data);
      toast.success("Profile updated");
    } catch {
      // handled by api client
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={profile.role} disabled />
          </div>
          <div>
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              Save Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // handled by api client
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="h-4 w-4" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <Label htmlFor="currentPassword" required>Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="newPassword" required>New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" required>Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={saving}>
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
