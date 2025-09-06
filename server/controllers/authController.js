import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, role_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, first_name, last_name, created_at;
        `;

    const values = [email, hashedPassword, firstName, lastName, 2];
    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      throw new Error("User creation failed");
    }

    const dbUser = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: dbUser.id },
      process.env.JWT_SECRET || "your-secret-key",
      {
        expiresIn: "24h",
      }
    );

    return res.status(201).json({
      success: true,
      data: {
        token: token,
        refreshToken: token, // Using same token as refresh token for now
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.first_name,
          lastName: dbUser.last_name,
          createdAt: dbUser.created_at,
        },
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      {
        expiresIn: "24h",
      }
    );

    return res.json({
      success: true,
      data: {
        token: token,
        refreshToken: token, // Using same token as refresh token for now
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      success: false,
      message: "Error signing in",
      error: error.message,
    });
  }
};

// Export both functions at once
export { signup, signin };
