import React, { useState } from "react";
import { useUser } from "../hooks/use-user"; // Standard hook in this engine

export default function SubscribePage() {
  const { user } = useUser(); 
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return alert("Please sign in to start your ad engine.");
    
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "Price_1Snlm2H806RJX0HiUqiGEsB1", // Your Price ID
          userId: user.id, 
          userEmail: user.email,
        }),
      });

      const { url } = await response.json();
      if (url) window.location.href = url; // Sends user to Stripe
    } catch (error) {
      console.error("Payment Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="border border-blue-500 p-8 rounded-lg shadow-lg bg-gray-900 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2 text-blue-400">Ad Automation</h1>
        <p className="text-gray-400 mb-8">Powered by Gemini 1.5 Flash</p>
        
        <ul className="mb-8 space-y-2 text-sm">
          <li>✓ Autonomous Ad Generation</li>
          <li>✓ 24/7 Engine Monitoring</li>
          <li>✓ Direct Stripe Billing</li>
        </ul>

        <button 
          onClick={handleSubscribe} 
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {loading ? "Initializing..." : "Activate Engine - $99/mo"}
        </button>
      </div>
    </div>
  );
}
