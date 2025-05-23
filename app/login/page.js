"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      alert("Google login error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1e2746] to-[#111b32] text-[#F7F7FF] flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 max-w-sm w-full"
      >
        <h1 className="text-3xl font-bold text-center mb-4 font-poppins">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-white/10 text-white mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-white/10 text-white mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white">
          Log In
        </button>

        <div className="text-center text-sm mt-4">
          <p>
            Don&apos;t have an account?{' '}
            <a href="/signup" className="underline text-teal-400">
              Sign up here
            </a>
          </p>
        </div>

        <div className="mt-4 text-center">
  <button
    type="button"
    onClick={handleGoogleLogin}
    className="w-full bg-white text-[#0D1B2A] py-2 rounded hover:bg-gray-100 flex items-center justify-center gap-2"
  >
    <img
      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
      alt="Google logo"
      className="w-5 h-5"
    />
    Sign in with Google
  </button>
</div>

      </form>
    </div>
  );
}
