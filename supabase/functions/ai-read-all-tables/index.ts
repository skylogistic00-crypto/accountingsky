import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json"
};

const PICA_SECRET = Deno.env.get("PICA_SECRET_KEY")!;
const PICA_CONNECTION_KEY = Deno.env.get("PICA_SUPABASE_CONNECTION_KEY")!;
const PROJECT_REF = Deno.env.get("SUPABASE_PROJECT_ID")!;

async function runSqlQuery(sqlQuery: string) {
  const endpoint = `https://api.picaos.com/v1/passthrough/v1/projects/${PROJECT_REF}/database/query`;
  
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pica-secret": PICA_SECRET,
      "x-pica-connection-key": PICA_CONNECTION_KEY,
      "x-pica-action-id": "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg",
    },
    body: JSON.stringify({ query: sqlQuery }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SQL query failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const { action, query } = await req.json();

    if (action === "get_schema") {
      const sql = `
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `;
      
      const result = await runSqlQuery(sql);
      
      const tables: Record<string, { columns: { name: string; type: string }[] }> = {};
      
      if (Array.isArray(result)) {
        for (const row of result) {
          const tableName = row.table_name;
          if (!tables[tableName]) {
            tables[tableName] = { columns: [] };
          }
          tables[tableName].columns.push({
            name: row.column_name,
            type: row.data_type
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        tables,
        tableCount: Object.keys(tables).length
      }), { headers: CORS });
    }

    if (action === "run_query") {
      if (!query) {
        return new Response(JSON.stringify({
          error: "Query is required"
        }), { status: 400, headers: CORS });
      }

      const upperQuery = query.trim().toUpperCase();
      if (!upperQuery.startsWith("SELECT")) {
        return new Response(JSON.stringify({
          error: "Only SELECT queries are allowed"
        }), { status: 400, headers: CORS });
      }

      const result = await runSqlQuery(query);
      
      return new Response(JSON.stringify({
        success: true,
        result,
        rowCount: Array.isArray(result) ? result.length : 0
      }), { headers: CORS });
    }

    if (action === "get_table_data") {
      const { tableName, limit = 100 } = await req.json().catch(() => ({}));
      
      if (!tableName) {
        return new Response(JSON.stringify({
          error: "tableName is required"
        }), { status: 400, headers: CORS });
      }

      const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, "");
      const sql = `SELECT * FROM ${safeTableName} LIMIT ${Math.min(limit, 1000)}`;
      
      const result = await runSqlQuery(sql);
      
      return new Response(JSON.stringify({
        success: true,
        table: safeTableName,
        result,
        rowCount: Array.isArray(result) ? result.length : 0
      }), { headers: CORS });
    }

    return new Response(JSON.stringify({
      error: "Invalid action. Use: get_schema, run_query, or get_table_data"
    }), { status: 400, headers: CORS });

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), { status: 500, headers: CORS });
  }
});
