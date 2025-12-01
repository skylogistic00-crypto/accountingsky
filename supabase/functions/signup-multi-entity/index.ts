import { corsHeaders } from "@shared/cors.ts";
import { createSupabaseClient } from "@shared/supabase-client.ts";
import { validateEmail, validatePassword, validateRequiredFields } from "@shared/validation.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    console.log("REQUEST BODY:", body);

    // destructure and accept role fields coming from UI
    const { 
      email, 
      password, 
      full_name, 
      entity_type, 
      phone, 
      details = {}, 
      file_urls = {}, 
      role_name, 
      role_id,
      ktp_number,
      ktp_address,
      first_name,
      last_name,
      religion,
      ethnicity,
      license_number,
      license_expiry_date,
      education,
      upload_ijasah
    } = body;

    // Validate required fields
    const requiredFields = ["email", "password", "full_name", "entity_type"];
    const validation = validateRequiredFields(body, requiredFields);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${validation.missing?.join(", ")}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ error: passwordValidation.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Keep original entity_type for display (e.g., "Karyawan")
    const originalEntityType = entity_type || "customer";
    
    // Normalize entity type for table mapping only
    let normalizedEntityType = originalEntityType
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");

    // Map synonyms for table insertion only
    if (normalizedEntityType === "karyawan") normalizedEntityType = "employee";

    // Determine role: prefer explicit role_name from UI, fallback by entity default
    const normalizedRoleFromUI = role_name && typeof role_name === "string"
      ? role_name.trim().toLowerCase().replace(/\s+/g, "_")
      : null;

    // fallback rules (only used if UI didn't send a role)
    const fallbackRoleForEntity = (() => {
      if (normalizedEntityType === "employee") return "admin";
      if (["supplier", "customer", "consignee", "shipper", "driver"].includes(normalizedEntityType)) {
        return "viewer";
      }
      return "viewer";
    })();

    const role = normalizedRoleFromUI || fallbackRoleForEntity;
    const resolvedRoleId = role_id || null;
    const resolvedRoleName = role_name || role;

    console.log("Normalized entity:", normalizedEntityType, "resolved role:", role, "role_id:", resolvedRoleId, "role_name:", resolvedRoleName);

    // Create auth user with email verification
    const redirectTo = "https://acc.skykargo.co.id/email-redirect/index.html";
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name,
          entity_type: normalizedEntityType,
          role,
          role_id: resolvedRoleId
        }
      }
    });

    if (authError) {
      console.error("Auth error:", authError);
      if (authError.message?.includes("already been registered") || authError.code === "email_exists") {
        return new Response(
          JSON.stringify({ 
            error: "An account with this email already exists. Please login instead or use a different email." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
        );
      }
      return new Response(
        JSON.stringify({ error: authError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!authUser || !authUser.user || !authUser.user.id) {
      console.error("Auth returned no user:", authUser);
      return new Response(
        JSON.stringify({ error: "Failed to create auth user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Prepare users table data
    // Use original entity from role selection (e.g., "Karyawan") not normalized
    const usersData: Record<string, any> = {
      id: authUser.user.id,
      email,
      full_name,
      role,
      role_id: resolvedRoleId,
      role_name: resolvedRoleName,
      entity_type: originalEntityType,  // Keep original value like "Karyawan"
      entity: originalEntityType,        // Keep original value like "Karyawan"
      phone,
      is_active: false,
      created_at: new Date().toISOString()
    };

    // Add employee/karyawan specific fields to users table
    // Check for karyawan, driver_perusahaan, driver_mitra, employee, or driver
    const isEmployeeType = ["employee", "driver", "karyawan", "driver_perusahaan", "driver_mitra"].includes(normalizedEntityType);
    
    if (isEmployeeType) {
      // Get upload_ijasah URL - file already uploaded from frontend
      const ijasahUrl = upload_ijasah || details.upload_ijasah || file_urls.upload_ijasah_url || null;
      
      // Get ktp_document_url - file already uploaded from frontend
      const ktpDocUrl = details.ktp_document_url || file_urls.ktp_document_url || null;
      
      // Get selfie_url - file already uploaded from frontend
      const selfieUrl = details.selfie_url || file_urls.selfie_url || null;
      
      // Get family_card_url - file already uploaded from frontend
      const familyCardUrl = details.family_card_url || file_urls.family_card_url || null;
      
      // Get sim_url - file already uploaded from frontend
      const simUrl = details.sim_url || file_urls.sim_url || null;
      
      // Get skck_url - file already uploaded from frontend
      const skckUrl = details.skck_url || file_urls.skck_url || null;
      
      console.log("Setting upload_ijasah:", ijasahUrl);
      console.log("Setting ktp_document_url:", ktpDocUrl);
      console.log("Setting selfie_url:", selfieUrl);
      console.log("Setting family_card_url:", familyCardUrl);
      console.log("Setting sim_url:", simUrl);
      console.log("Setting skck_url:", skckUrl);
      
      usersData["upload_ijasah"] = ijasahUrl;
      usersData["ktp_document_url"] = ktpDocUrl;
      usersData["selfie_url"] = selfieUrl;
      usersData["family_card_url"] = familyCardUrl;
      usersData["sim_url"] = simUrl;
      usersData["skck_url"] = skckUrl;
      usersData.ktp_number = ktp_number || details.ktp_number || null;
      usersData.ktp_address = ktp_address || details.ktp_address || null;
      usersData.first_name = first_name || details.first_name || null;
      usersData.last_name = last_name || details.last_name || null;
      usersData.religion = religion || details.religion || null;
      usersData.ethnicity = ethnicity || details.ethnicity || null;
      usersData.education = education || details.education || null;
      usersData.license_number = license_number || details.license_number || null;
      usersData.license_expiry_date = license_expiry_date || details.license_expiry_date || null;
    }

    // For suppliers, add supplier-specific fields to users table
    if (normalizedEntityType === "supplier") {
      usersData.supplier_name = details.entity_name || full_name;
      usersData.contact_person = details.contact_person || full_name;
      usersData.city = details.city;
      usersData.country = details.country;
      usersData.address = details.address;
      usersData.pkp_status = details.is_pkp;
      usersData.bank_account_holder = details.bank_account_holder;
    }

    // Upsert into users table (handles duplicate key errors)
    const { error: userError } = await supabase
      .from("users")
      .upsert(usersData, { onConflict: "id" });

    if (userError) {
      console.error("User upsert error:", userError);
      // Rollback: delete auth user
      try {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      } catch (delErr) {
        console.error("Rollback delete user error:", delErr);
      }
      return new Response(
        JSON.stringify({ error: "Failed to create user profile" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Insert into entity-specific table based on entity_type
    let entityError = null;
    const normalizedEntity = normalizedEntityType.toLowerCase();
    
    // Define allowed columns for each entity type
    const allowedColumns: Record<string, string[]> = {
      supplier: ["address", "city", "country", "is_pkp", "tax_id", "bank_name", "bank_account_holder", "payment_terms", "category", "currency", "status"],
      customer: ["address", "city", "country", "is_pkp", "tax_id", "bank_name", "bank_account_holder", "payment_terms", "category", "currency", "status", "birth_date"],
      consignee: ["address", "city", "country", "is_pkp", "tax_id", "bank_name", "bank_account_holder", "payment_terms", "category", "currency", "status"],
      shipper: ["address", "city", "country", "is_pkp", "tax_id", "bank_name", "bank_account_holder", "payment_terms", "category", "currency", "status"],
      employee: ["position", "department", "hire_date", "address", "city", "country", "status"],
      driver: ["license_number", "license_type", "license_expiry", "address", "city", "country", "status"],
    };
    
    // Filter entity data to only include allowed columns
    const filterEntityData = (data: Record<string, any>, entityType: string): Record<string, any> => {
      const allowed = allowedColumns[entityType] || [];
      const filtered: Record<string, any> = {};
      for (const key of allowed) {
        if (data[key] !== undefined) {
          filtered[key] = data[key];
        }
      }
      return filtered;
    };
    
    // Merge details and file_urls into entity data
    const entityData = filterEntityData({ ...details, ...file_urls }, normalizedEntity);
    
    try {
      if (normalizedEntity === "supplier") {
        const { error } = await supabase.from("suppliers").insert({
          user_id: authUser.user.id,
          supplier_name: details.entity_name || full_name,
          contact_person: details.contact_person || full_name,
          email,
          phone_number: phone || "",
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === "customer") {
        const { error } = await supabase.from("customers").insert({
          user_id: authUser.user.id,
          customer_name: details.entity_name || full_name,
          contact_person: details.contact_person || full_name,
          email,
          phone_number: phone || "",
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === "consignee") {
        const { error } = await supabase.from("consignees").insert({
          user_id: authUser.user.id,
          consignee_name: details.entity_name || full_name,
          contact_person: details.contact_person || full_name,
          email,
          phone_number: phone || "",
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === "shipper") {
        const { error } = await supabase.from("shippers").insert({
          user_id: authUser.user.id,
          shipper_name: details.entity_name || full_name,
          contact_person: details.contact_person || full_name,
          email,
          phone_number: phone || "",
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === "employee") {
        const { error } = await supabase.from("employees").insert({
          user_id: authUser.user.id,
          full_name,
          email,
          phone,
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === "driver" || normalizedEntity === "driver_perusahaan" || normalizedEntity === "driver_mitra") {
        const driverType = normalizedEntity === "driver_perusahaan" ? "perusahaan" : 
                          normalizedEntity === "driver_mitra" ? "mitra" : "general";
        const { error } = await supabase.from("drivers").insert({
          user_id: authUser.user.id,
          full_name,
          email,
          phone,
          driver_type: driverType,
          ...entityData,
        });
        entityError = error;
      }
      
      if (entityError) {
        console.error("Entity insert error:", entityError);
        // Don't rollback - entity table is optional
      }
    } catch (err) {
      console.error("Entity creation error:", err);
      // Continue without entity record
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUser.user.id,
        message: "User created successfully. Please check your email for verification.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
