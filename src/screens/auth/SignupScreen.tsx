"use client";

import { useState } from "react";
import Link from "next/link";
import { SignupRequestDto } from "@/types/auth.types";
import { DynamicApiResponse } from "@/types/api.types";
import { signup } from "@/services/api/auth.api";
import { getApiErrorMessage, getRequestErrorMessage } from "@/utils/api.utils";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: SignupRequestDto = {
      Username: userName,
      Email: email,
      Password: password,
    };

    try {
      const response: DynamicApiResponse = await signup(payload);
      if (response.StatusCode !== 0) {
        setError(getApiErrorMessage(response, "Signup failed. Please try again."));
        return;
      }
    } catch (err) {
      setError(getRequestErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">C</div>
        <h1>Sign Up</h1>
        <p className="subtitle">Create your account to get started with ChatHub.</p>

        {error && <div className="auth-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="password-field">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit">
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        <p className="footer">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
