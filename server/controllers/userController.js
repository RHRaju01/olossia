import { pool } from "../config/database.js";

export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = result.rows[0];

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};
