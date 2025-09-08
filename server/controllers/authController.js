import bcrypt from "bcryptjs";
import { pool } from "../config/database.js";
import { JWT_CONFIG, generateToken, generateRefreshToken, verifyRefreshToken } from "../config/auth.js";

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

    // Get customer role ID
    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE name = 'customer'"
    );
    
    if (roleResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Customer role not found",
      });
    }

    const customerRoleId = roleResult.rows[0].id;

    // Create user
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, created_at;
    `;

    const values = [email, hashedPassword, firstName, lastName, customerRoleId];
    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      throw new Error("User creation failed");
    }

    const dbUser = result.rows[0];

    // Generate token
    const token = generateToken({ id: dbUser.id });
    const refreshToken = generateRefreshToken({ id: dbUser.id });

    return res.status(201).json({
      success: true,
      data: {
        token: token,
        refreshToken: refreshToken,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.first_name,
          lastName: dbUser.last_name,
          createdAt: dbUser.created_at,
          role: 'customer',
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

    const result = await pool.query(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.email = $1
    `, [email]);

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

    const token = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    return res.json({
      success: true,
      data: {
        token: token,
        refreshToken: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role_name,
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

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user from database
    const result = await pool.query(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = $1
    `, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const user = result.rows[0];

    // Generate new tokens
    const newToken = generateToken({ id: user.id });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    return res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role_name,
        },
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    // Get user with role from database
    const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.created_at, r.name as role_name
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at,
          role: user.role_name,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

// Export both functions at once
export { signup, signin, refreshToken, getProfile };