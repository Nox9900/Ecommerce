import { createClerkClient } from "@clerk/express";
import { ENV } from "../config/env.js";

const clerkClient = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY });

export const googleSignIn = async (req, res) => {
  try {
    const { idToken, email, firstName, lastName } = req.body;

    if (!idToken || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify the Google ID token with Google's tokeninfo endpoint
    const verifyResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!verifyResponse.ok) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const googlePayload = await verifyResponse.json();

    // Verify email matches the token
    if (googlePayload.email !== email) {
      return res.status(401).json({ message: "Email mismatch" });
    }

    // Verify token audience matches our Google Client ID
    if (ENV.GOOGLE_CLIENT_ID && googlePayload.aud !== ENV.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: "Invalid token audience" });
    }

    // Find existing Clerk user by email
    let clerkUser;
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (existingUsers.data.length > 0) {
      clerkUser = existingUsers.data[0];
    } else {
      // Create new Clerk user — this triggers Inngest webhook for MongoDB user creation
      clerkUser = await clerkClient.users.createUser({
        emailAddress: [email],
        firstName: firstName || googlePayload.given_name || "",
        lastName: lastName || googlePayload.family_name || "",
        skipPasswordRequirement: true,
      });
    }

    // Create a sign-in token for this user
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: clerkUser.id,
    });

    res.json({ token: signInToken.token });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({ message: "Google sign-in failed" });
  }
};
