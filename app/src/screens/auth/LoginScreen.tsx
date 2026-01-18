"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { login } from "../../services/api/auth.api";
import { LoginRequestDto } from "../../types/auth.types";
import { DynamicApiResponse } from "../../types/api.types";
import { LoginResponseDto } from "../../types/auth.types";
import { saveToken } from "../../utils/auth.storage";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload: LoginRequestDto = {
      Username: email,
      Password: password,
    };

    try {
        const response: DynamicApiResponse<LoginResponseDto> = await login(payload);
        if ( response.StatusCode !== 0 || !response.Model || !response.Model.LoginStatus ) { return; }
        const token = response.Model.Token;
        console.log("JWT Token:", token);
        saveToken(token);      
        console.log("JWT Token saved");
        router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
        <div className="auth-card">
            <h1>Login</h1>
            <p className="subtitle">Welcome back. Please sign in.</p>

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
                Don’t have an account? <Link href="/signup">Sign up</Link>
            </p>
        </div>
    </div>
  );
}
