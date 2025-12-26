"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, KeyRound, AlertCircle } from "lucide-react";
import AdminControls from "@/components/admin/AdminControls";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");

  // Check if already authenticated via localStorage or URL param
  useEffect(() => {
    const checkAuth = async () => {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const urlKey = urlParams.get("key");
      
      // Check localStorage
      const storedKey = localStorage.getItem("bashaway_admin_key");
      
      const keyToCheck = urlKey || storedKey;
      
      if (keyToCheck) {
        try {
          const response = await fetch("/api/admin/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: keyToCheck }),
          });
          
          if (response.ok) {
            localStorage.setItem("bashaway_admin_key", keyToCheck);
            setIsAuthenticated(true);
            
            // Clean up URL if key was in params
            if (urlKey) {
              window.history.replaceState({}, "", "/admin");
            }
          } else {
            localStorage.removeItem("bashaway_admin_key");
          }
        } catch {
          console.error("Auth check failed");
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: secretKey }),
      });
      
      if (response.ok) {
        localStorage.setItem("bashaway_admin_key", secretKey);
        setIsAuthenticated(true);
      } else {
        setError("Invalid secret key. Please try again.");
      }
    } catch {
      setError("Authentication failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bashaway_admin_key");
    setIsAuthenticated(false);
    setSecretKey("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="p-4 bg-red-500/10 rounded-full mb-4">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Access</h1>
              <p className="text-gray-400 text-sm mt-2 text-center">
                Enter the secret key to access the admin panel
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secret Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter admin secret key"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
              >
                Access Admin Panel
              </button>
            </form>

            <p className="text-gray-500 text-xs text-center mt-6">
              You can also access via URL: /admin?key=YOUR_SECRET_KEY
            </p>
          </div>

          <p className="text-gray-600 text-xs text-center mt-4">
            SLIIT FOSS • Bashaway
          </p>
        </motion.div>
      </div>
    );
  }

  return <AdminControls onLogout={handleLogout} />;
}
