import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

const SUPABASE_PROJECT_REF = Deno.env.get("SUPABASE_PROJECT_ID")!;
const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY")!;
const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get("PICA_SUPABASE_CONNECTION_KEY")!;
const ACTION_ID = "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg";

interface AuditLog {
  user_id: string;
  query: string;
  status: string;
  error?: string;
  executed_at: string;
}

async function isSuperAdmin(userId: string, supabase: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking super admin:", error);
      return false;
    }

    return data?.role === "super_admin";
  } catch (error) {
    console.error("Super admin check failed:", error);
    return false;
  }
}

async function logAudit(supabase: any, log: AuditLog) {
  try {
    await supabase.from("sql_audit_logs").insert([log]);
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}

function validateQuery(query: string): { valid: boolean; error?: string } {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { valid: false, error: "Query cannot be empty" };
  }

  // Warning patterns (allowed but logged)
  const warningPatterns = [
    { pattern: /DROP\s+TABLE/i, message: "DROP TABLE detected" },
    { pattern: /DROP\s+DATABASE/i, message: "DROP DATABASE detected" },
    { pattern: /TRUNCATE/i, message: "TRUNCATE detected" },
    { pattern: /DELETE\s+FROM/i, message: "DELETE FROM detected" }
  ];

  for (const { pattern, message } of warningPatterns) {
    if (pattern.test(trimmedQuery)) {
      console.warn(`⚠️ ${message} in query`);
    }
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const { query, userId } = await req.json();

    if (!query || !userId) {
      return new Response(JSON.stringify({
        error: "Missing required fields: query and userId"
      }), { status: 400, headers: CORS });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("=== ADMIN SQL EXECUTOR ===");
    console.log("User ID:", userId);
    console.log("Query:", query.substring(0, 100));

    // Check if user is super admin
    const isAdmin = await isSuperAdmin(userId, supabase);
    if (!isAdmin) {
      await logAudit(supabase, {
        user_id: userId,
        query,
        status: "forbidden",
        error: "Not a super admin",
        executed_at: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        error: "Forbidden: Only super admins can execute SQL queries"
      }), { status: 403, headers: CORS });
    }

    // Validate query
    const validation = validateQuery(query);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        error: validation.error
      }), { status: 400, headers: CORS });
    }

    // Execute query via Pica Passthrough
    console.log("Executing query via Pica...");
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY,
          "x-pica-action-id": ACTION_ID,
        },
        body: JSON.stringify({ query }),
      }
    );

    if (response.status === 201) {
      await logAudit(supabase, {
        user_id: userId,
        query,
        status: "success",
        executed_at: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Query executed successfully"
      }), { status: 200, headers: CORS });
    } else if (response.status === 403) {
      await logAudit(supabase, {
        user_id: userId,
        query,
        status: "forbidden",
        error: "Forbidden by Supabase API",
        executed_at: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        error: "Forbidden by Supabase API"
      }), { status: 403, headers: CORS });
    } else {
      const errorText = await response.text();
      console.error("SQL execution error:", errorText);

      await logAudit(supabase, {
        user_id: userId,
        query,
        status: "error",
        error: errorText,
        executed_at: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        error: "SQL execution error",
        details: errorText
      }), { status: 500, headers: CORS });
    }

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), { status: 500, headers: CORS });
  }
});
