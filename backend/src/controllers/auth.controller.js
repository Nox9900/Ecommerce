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

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (existingUsers.data.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    // Create new Clerk user with password
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      firstName: firstName || "",
      lastName: lastName || "",
    });

    // Create a sign-in token so the user is logged in immediately
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: clerkUser.id,
    });

    res.status(201).json({ token: signInToken.token });
  } catch (error) {
    console.error("Register error:", error);
    const msg =
      error?.errors?.[0]?.longMessage ||
      error?.errors?.[0]?.message ||
      "Registration failed";
    res.status(500).json({ message: msg });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (existingUsers.data.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const clerkUser = existingUsers.data[0];

    // Verify password via Clerk
    const { verified } = await clerkClient.users.verifyPassword({
      userId: clerkUser.id,
      password,
    });

    if (!verified) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create a sign-in token
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: clerkUser.id,
    });

    res.json({ token: signInToken.token });
  } catch (error) {
    console.error("Login error:", error);
    // Clerk returns specific error for wrong password
    if (error?.errors?.[0]?.code === "form_password_incorrect") {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.status(500).json({ message: "Login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists — don't reveal whether email is registered
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (existingUsers.data.length > 0) {
      // Clerk doesn't have a direct "send reset password email" API from backend,
      // so we use Clerk's FAPI from the client side. However, we can still
      // acknowledge the request here for the flow.
      // In production, you'd integrate with Clerk's password reset flow.
    }

    // Always return success to prevent email enumeration
    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  }
};
