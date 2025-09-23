import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export default function AccessDenied({
  title = "Access denied",
  message = "You don't have permission to access this area.",
  showLogin = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate("/")} className="rounded-xl">
            Go to Home
          </Button>
          {showLogin ? (
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="rounded-xl"
            >
              Login
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate("/support")}
              className="rounded-xl"
            >
              Contact Support
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
