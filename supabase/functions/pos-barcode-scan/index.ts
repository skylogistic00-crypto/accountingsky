import { corsHeaders } from "@shared/cors.ts";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get("PICA_SUPABASE_CONNECTION_KEY");
const SUPABASE_PROJECT_REF = Deno.env.get("SUPABASE_PROJECT_ID");
const ACTION_ID = "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg";

interface ProductResult {
  id: string;
  barcode: string;
  sku: string;
  item_name: string;
  base_price: number;
  selling_price: number;
  item_quantity: number;
  unit: string;
}

async function runSQLQuery(query: string): Promise<any> {
  const url = `https://api.picaos.com/v1/passthrough/v1/projects/${SUPABASE_PROJECT_REF}/database/query`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-pica-secret": PICA_SECRET_KEY!,
      "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY!,
      "x-pica-action-id": ACTION_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SQL query failed: ${errorText}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PICA_SECRET_KEY || !PICA_SUPABASE_CONNECTION_KEY || !SUPABASE_PROJECT_REF) {
      throw new Error("Missing required environment variables");
    }

    const { barcode } = await req.json();

    if (!barcode) {
      throw new Error("Barcode is required");
    }

    // Check if product exists by barcode or SKU
    const checkQuery = `SELECT id, barcode, sku, item_name, base_price, selling_price, item_quantity, unit FROM stock WHERE barcode = '${barcode.replace(/'/g, "''")}' OR sku = '${barcode.replace(/'/g, "''")}' LIMIT 1;`;
    
    let product: ProductResult | null = null;
    let isNewProduct = false;

    try {
      const result = await runSQLQuery(checkQuery);
      if (result && Array.isArray(result) && result.length > 0) {
        product = result[0];
      }
    } catch (err) {
      console.error("Error checking product:", err);
    }

    if (!product) {
      // Product not found - create new product with price 0
      const newSku = `POS-${Date.now()}`;
      const insertQuery = `INSERT INTO stock (barcode, sku, item_name, base_price, selling_price, item_quantity, unit, status) VALUES ('${barcode.replace(/'/g, "''")}', '${newSku}', 'Produk Baru', 0, 0, 0, 'pcs', 'draft') RETURNING id, barcode, sku, item_name, base_price, selling_price, item_quantity, unit;`;
      
      try {
        const insertResult = await runSQLQuery(insertQuery);
        if (insertResult && Array.isArray(insertResult) && insertResult.length > 0) {
          product = insertResult[0];
          isNewProduct = true;
        }
      } catch (err) {
        console.error("Error creating product:", err);
        throw new Error("Failed to create new product");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        product: {
          id: product?.id,
          barcode: product?.barcode || barcode,
          sku: product?.sku,
          name: product?.item_name,
          price: product?.selling_price || product?.base_price || 0,
          base_price: product?.base_price || 0,
          stock: product?.item_quantity || 0,
          unit: product?.unit || "pcs",
        },
        is_new_product: isNewProduct,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("POS Barcode Scan Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
