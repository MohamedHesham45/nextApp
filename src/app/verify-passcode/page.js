"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function VerifyPasscodePage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    } else if (
      isLoaded &&
      user &&
      !isAuthorized(user)
    ) {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  const isAuthorized = (user) => {
    const authorizedEmails = [
      "aliellool202020@gmail.com",
      "sitaramall97@gmail.com",
      "mohmedadm733@gmail.com",
    ];
    return authorizedEmails.includes(
      user?.primaryEmailAddress?.emailAddress
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode === "972024") {
      localStorage.setItem(
        "adminPasscodeVerified",
        "true"
      );
      router.push("/admin");
    } else {
      setError(
        "Incorrect passcode. Please try again."
      );
    }
  };

  if (!isLoaded || !user || !isAuthorized(user)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">
          Enter Admin Passcode
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={passcode}
            onChange={(e) =>
              setPasscode(e.target.value)
            }
            className="w-full p-2 mb-4 border rounded"
            placeholder="Enter passcode"
            required
          />
          {error && (
            <p className="text-red-500 mb-4">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
