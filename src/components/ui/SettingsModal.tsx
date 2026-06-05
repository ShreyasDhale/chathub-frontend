"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getProfile, updateProfile, changePassword } from "@/services/api/user.api";
import { UserProfile } from "@/types/chat.types";
import { getApiErrorMessage, getRequestErrorMessage } from "@/utils/api.utils";
import ChatIcon from "@/components/ui/ChatIcon";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Tab = "profile" | "password";

export default function SettingsModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTab("profile");
    setError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        if (cancelled) return;
        const p = res.Model as UserProfile | null;
        setProfile(p);
        setDisplayName(p?.displayname ?? p?.username ?? "");
        setBio(p?.bio ?? "");
        setAvatarUrl(p?.avatarurl ?? "");
      } catch (err) {
        if (!cancelled) setError(getRequestErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open || !mounted) return null;

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setError("");
      const res = await updateProfile({
        DisplayName: displayName || undefined,
        AvatarUrl: avatarUrl || undefined,
        Bio: bio || undefined,
      });
      if (res.StatusCode !== 0) {
        setError(getApiErrorMessage(res, "Could not update profile."));
        return;
      }
      toast.success("Profile updated");
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      setError("Please fill in both current and new passwords.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const res = await changePassword({
        CurrentPassword: currentPassword,
        NewPassword: newPassword,
      });
      if (res.StatusCode !== 0) {
        setError(getApiErrorMessage(res, "Could not change password."));
        return;
      }
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const initials = (profile?.displayname ?? profile?.username ?? "?")
    .charAt(0)
    .toUpperCase();

  const modal = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="settings-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="settings-title">Settings</h2>
            <p className="modal-subtitle">Manage your profile and account</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <ChatIcon name="close" size={18} />
          </button>
        </div>

        <div className="settings-tabs">
          <button
            type="button"
            className={`settings-tab ${tab === "profile" ? "is-active" : ""}`}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            type="button"
            className={`settings-tab ${tab === "password" ? "is-active" : ""}`}
            onClick={() => setTab("password")}
          >
            Password
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">!</span>
            <span className="alert-message">{error}</span>
            <button
              type="button"
              className="alert-dismiss"
              onClick={() => setError("")}
              aria-label="Dismiss"
            >
              <ChatIcon name="close" size={14} />
            </button>
          </div>
        )}

        {tab === "profile" ? (
          <div className="settings-body">
            {loading ? (
              <div className="search-loading">
                <div className="shimmer-line" style={{ width: "60%" }} />
                <div className="shimmer-line" style={{ width: "80%" }} />
              </div>
            ) : (
              <>
                <div className="settings-hero">
                  <div className="settings-avatar">{initials}</div>
                  <div className="settings-hero-info">
                    <span className="settings-hero-name">
                      {profile?.username ?? "—"}
                    </span>
                    <span className="settings-hero-email">
                      {profile?.email ?? ""}
                    </span>
                  </div>
                </div>

                <div className="settings-form">
                  <label className="settings-label" htmlFor="display-name">
                    Display name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    className="settings-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How others see your name"
                  />

                  <label className="settings-label" htmlFor="avatar-url">
                    Avatar URL
                  </label>
                  <input
                    id="avatar-url"
                    type="url"
                    className="settings-input"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                  />

                  <label className="settings-label" htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    className="settings-input settings-textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people a bit about yourself"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="settings-body">
            <div className="settings-form">
              <label className="settings-label" htmlFor="current-password">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                className="settings-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />

              <label className="settings-label" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                className="settings-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />

              <label className="settings-label" htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="settings-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        <div className="modal-footer">
          <span />
          <div className="modal-footer-actions">
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Close
            </button>
            <button
              className="btn-primary"
              onClick={tab === "profile" ? handleSaveProfile : handleChangePassword}
              disabled={saving || loading}
            >
              {saving
                ? "Saving..."
                : tab === "profile"
                  ? "Save profile"
                  : "Update password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
