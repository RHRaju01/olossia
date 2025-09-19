import { User } from "../../server/models/User.js";
import RefreshToken from "../../server/models/RefreshToken.js";
import { hashPassword, verifyPassword } from "../utils/encryption.js";
import { signAccessToken } from "../utils/jwt.js";
import { signEmailToken, verifyEmailToken } from "../utils/verifyEmail.js";
import { sendMail } from "../utils/mailer.js";

export const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Create access token
      const token = signAccessToken({
        id: user.id,
        role: user.role || "customer",
      });

      // Create opaque refresh token (stored hashed in DB)
      const { token: refreshTokenPlain } = await RefreshToken.create({
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent") || null,
      });

      // Optionally auto-verify new users (development convenience)
      if (process.env.AUTO_VERIFY_NEW_USERS === "true") {
        await User.setEmailVerified(user.id, true);
      } else {
        // Send verification email
        try {
          const token = signEmailToken({ sub: user.id });
          const url = `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/verify-email?token=${token}`;
          const { previewUrl } = await sendMail({
            to: user.email,
            subject: "Verify your email",
            html: `<p>Please verify your email by clicking <a href="${url}">here</a></p>`,
            text: `Verify: ${url}`,
          });
          if (previewUrl) console.log("Email preview URL:", previewUrl);
        } catch (e) {
          console.warn("Failed to send verification email:", e.message || e);
        }
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          },
          token,
          refreshToken: refreshTokenPlain,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during registration",
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if user is active
      if (user.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "Account is not active",
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate access token
      const token = signAccessToken({
        id: user.id,
        role: user.role || "customer",
      });

      // Create and store opaque refresh token
      const { token: refreshTokenPlain } = await RefreshToken.create({
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent") || null,
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
          },
          token,
          refreshToken: refreshTokenPlain,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during login",
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            status: user.status,
            createdAt: user.created_at,
          },
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // Logout (client-side token removal)
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        const row = await RefreshToken.findByToken(refreshToken);
        if (row) await RefreshToken.revokeById(row.id);
      }
      return res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
  },

  // Trigger sending a verification email for the logged-in user (or by email)
  sendVerificationEmail: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email)
        return res
          .status(400)
          .json({ success: false, message: "Email required" });
      const user = await User.findByEmail(email);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      const token = signEmailToken({ sub: user.id });
      const url = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/verify-email?token=${token}`;
      const { previewUrl } = await sendMail({
        to: user.email,
        subject: "Verify email",
        html: `<p>Click <a href="${url}">here</a></p>`,
        text: url,
      });
      return res.json({
        success: true,
        message: "Verification email sent",
        previewUrl,
      });
    } catch (err) {
      console.error("sendVerificationEmail error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send verification email" });
    }
  },

  // Verify email via token
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.query;
      if (!token)
        return res
          .status(400)
          .json({ success: false, message: "Token required" });
      const payload = verifyEmailToken(token);
      if (!payload)
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      const userId = payload.sub;
      const updated = await User.setEmailVerified(userId, true);
      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      return res.json({ success: true, message: "Email verified" });
    } catch (err) {
      console.error("verifyEmail error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to verify email" });
    }
  },

  // Refresh token
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res
          .status(400)
          .json({ success: false, message: "Refresh token is required" });
      }

      // Find stored token by comparing hashes
      const row = await RefreshToken.findByToken(refreshToken);
      if (!row)
        return res
          .status(401)
          .json({ success: false, message: "Invalid refresh token" });

      // Check revoked or expired
      if (row.is_revoked || new Date(row.expires_at) < new Date()) {
        return res.status(401).json({
          success: false,
          message: "Refresh token revoked or expired",
        });
      }

      // Load user
      const user = await User.findById(row.user_id);
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Invalid refresh token" });

      // Revoke the used refresh token (rotation)
      await RefreshToken.revokeById(row.id);

      // Create a new refresh token
      const { token: newRefreshPlain } = await RefreshToken.create({
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent") || null,
      });

      // Issue new access token
      const token = signAccessToken({
        id: user.id,
        role: user.role || "customer",
      });

      res.json({
        success: true,
        data: { token, refreshToken: newRefreshPlain },
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }
  },
};
