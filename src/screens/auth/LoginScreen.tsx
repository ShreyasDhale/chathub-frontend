"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { login } from "@/services/api/auth.api";
import { LoginRequestDto, LoginResponseDto } from "@/types/auth.types";
import { DynamicApiResponse } from "@/types/api.types";
import { saveToken } from "@/utils/auth.storage";
import { getApiErrorMessage, getRequestErrorMessage } from "@/utils/api.utils";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: LoginRequestDto = {
      Username: email,
      Password: password,
    };

    try {
      const response: DynamicApiResponse<LoginResponseDto> =
        await login(payload);
      if (
        response.StatusCode !== 0 ||
        !response.Model ||
        !response.Model.LoginStatus
      ) {
        setError(getApiErrorMessage(response, "Invalid email or password."));
        return;
      }
      saveToken(response.Model.Token);
      router.push("/dashboard");
    } catch (err) {
      setError(getRequestErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">C</div>
        <h1>Login</h1>
        <p className="subtitle">Welcome back. Please sign in to ChatHub.</p>

        {error && <div className="auth-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email / Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="footer">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
