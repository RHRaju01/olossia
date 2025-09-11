import { supabase } from "../config/supabase.js";
import fs from "fs";
import path from "path";

async function setupCartWishlist() {
  try {
    // Read the SQL file
    const sqlPath = path.join(
      process.cwd(),
      "database",
      "setup_cart_wishlist.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split SQL into individual statements
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}:`);
      console.log(statement.substring(0, 100) + "...");

      // Use the service role client for admin operations
      const { data, error } = await supabase.rpc("exec_sql", {
        sql_statement: statement,
      });

      if (error) {
        console.error(`Error in statement ${i + 1}:`, error);
        // Don't stop for certain expected errors
        if (
          !error.message.includes("already exists") &&
          !error.message.includes("duplicate key") &&
          !error.message.includes("does not exist")
        ) {
          throw error;
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log("\n🎉 Cart and wishlist setup completed!");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}

setupCartWishlist();
