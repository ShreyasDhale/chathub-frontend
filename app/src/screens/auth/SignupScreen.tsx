"use client";

import { useState } from "react";
import Link from "next/link";
import { SignupRequestDto } from "../../types/auth.types";
import { DynamicApiResponse } from "../../types/api.types";
import { signup } from "../../services/api/auth.api";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setLoading(true);
  
      const payload: SignupRequestDto = {
        Username: userName,
        Email: email,
        Password: password,
      };
  
      try {
        const response: DynamicApiResponse =
          await signup(payload);
        if ( response.StatusCode !== 0 ) {
          return;
        }
        console.log("Message:", response.Message);
      } finally {
        setLoading(false);
      }
    }
  

  return (
    <div className="auth-container">
  <div className="auth-card">
    <h1>Sign Up</h1>
    <p className="subtitle">Create your account to get started.</p>

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
            type= "password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="password-field">
        <input
            type= "password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button type="submit">
        {loading ? "Signingup in..." : "Signup"}
      </button>
    </form>

    <p className="footer">
      Already have an account? <Link href="/login">Login</Link>
    </p>
  </div>
</div>

  );
}
