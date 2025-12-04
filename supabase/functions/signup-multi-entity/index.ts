import { corsHeaders } from "@shared/cors.ts";
import { createSupabaseClient } from "@shared/supabase-client.ts";
import { validateEmail, validatePassword, validateRequiredFields } from "@shared/validation.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log("REQUEST BODY:", JSON.stringify(body, null, 2));
    console.log("DETAILS OBJECT:", JSON.stringify(body.details, null, 2));
    console.log("FILE_URLS OBJECT:", JSON.stringify(body.file_urls, null, 2));

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
      religion,
      ethnicity,
      license_number,
      license_expiry_date,
      education,
      upload_ijasah
    } = body;

    // ========================================
    // DEBUG: Log received details object
    // ========================================
    console.log("=== RECEIVED DETAILS FROM FRONTEND ===");
    console.log("Details keys:", Object.keys(details || {}));
    console.log("Details has anggota_keluarga:", details?.anggota_keluarga ? "YES" : "NO");
    console.log("Details has nik:", details?.nik ? "YES" : "NO");
    console.log("Details has nomor_kk:", details?.nomor_kk ? "YES" : "NO");
    console.log("Details has nama:", details?.nama ? "YES" : "NO");
    console.log("Full details:", JSON.stringify(details, null, 2).substring(0, 1000));
    console.log("=== END RECEIVED DETAILS ===");

    // Validate required fields - full_name is optional now (can be derived from OCR or email)
    const requiredFields = ["email", "password", "entity_type"];
    const validation = validateRequiredFields(body, requiredFields);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${validation.missing?.join(", ")}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Derive full_name if not provided - use email prefix as fallback
    let derivedFullName = full_name || "";
    
    // Try to get from details
    if (!derivedFullName && details) {
      derivedFullName = details.contact_person || details.entity_name || "";
    }
    
    // If still empty, derive from email
    if (!derivedFullName && email) {
      try {
        const emailPrefix = email.split("@")[0] || "User";
        // Replace dots, underscores, hyphens with spaces and capitalize each word
        const words = emailPrefix.replace(/[._-]/g, " ").split(" ");
        derivedFullName = words
          .map((word: string) => {
            if (!word) return "";
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .filter((w: string) => w.length > 0)
          .join(" ");
      } catch (e) {
        console.error("Error deriving name from email:", e);
        derivedFullName = "User";
      }
    }
    
    // Final fallback
    if (!derivedFullName) {
      derivedFullName = "User";
    }
    
    console.log("Derived full name:", derivedFullName);

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

    console.log("Normalized entity:", normalizedEntityType, "resolved role:", role, "role_id:", resolvedRoleId, "role_name:", resolvedRoleName, "derivedFullName:", derivedFullName);

    // Create auth user with email verification
    const redirectTo = "https://acc.skykargo.co.id/email-redirect/index.html";
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: derivedFullName,
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

    const userId = authUser.user.id;
    console.log("Auth user created with ID:", userId);

    // Wait for auth.users to be fully committed - increased delay to 3 seconds
    console.log("Waiting for auth.users to commit...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("Wait complete, proceeding with profile creation");

    // Prepare users table data
    // Use original entity from role selection (e.g., "Karyawan") not normalized
    const usersData: Record<string, any> = {
      id: userId,
      email,
      full_name: derivedFullName,
      role,
      role_id: resolvedRoleId,
      role_name: resolvedRoleName,
      entity_type: originalEntityType,  // Keep original value like "Karyawan"
      entity: originalEntityType,        // Keep original value like "Karyawan"
      phone,
      is_active: false,
      created_at: new Date().toISOString()
    };

    // ========================================
    // CRITICAL: ADD ALL OCR EXTRACTED FIELDS FROM DETAILS TO USERS TABLE
    // ========================================
    console.log("=== ADDING OCR FIELDS FROM DETAILS TO USERS TABLE ===");
    
    // Define allowed OCR fields that exist in users table
    const allowedOCRFields = [
      // KTP Fields
      "nik", "nama", "tempat_lahir", "tanggal_lahir", "jenis_kelamin",
      "agama", "status_perkawinan", "pekerjaan", "kewarganegaraan",
      "berlaku_hingga", "golongan_darah",
      // KK Fields
      "nomor_kk", "nama_kepala_keluarga", "rt_rw", "kelurahan_desa",
      "kecamatan", "kabupaten_kota", "provinsi", "kode_pos",
      "tanggal_dikeluarkan", "anggota_keluarga",
      // Debug notes
      "debug_notes",
      // Additional fields
      "ktp_number", "ktp_address", "religion", "ethnicity", "education",
      "license_number", "license_expiry_date",
      // Document URLs
      "upload_ijasah", "ktp_document_url", "selfie_url", "family_card_url",
      "sim_url", "skck_url",
      // Address fields
      "address", "city", "country"
    ];
    
    // Add allowed fields from details to usersData
    if (details && typeof details === "object") {
      Object.entries(details).forEach(([key, value]) => {
        // Only add if key is in allowedOCRFields and not already in usersData
        if (allowedOCRFields.includes(key) && usersData[key] === undefined && value !== undefined && value !== null) {
          // Handle date fields - convert to proper format
          if (["tanggal_lahir", "tanggal_dikeluarkan", "license_expiry_date"].includes(key)) {
            // If it's a valid date string, keep it; otherwise set to null
            if (value && typeof value === "string" && value.trim() !== "") {
              usersData[key] = value;
            }
          } else {
            usersData[key] = value;
          }
          console.log(`✔ Added OCR field to users: ${key} = ${typeof value === "object" ? JSON.stringify(value).substring(0, 50) : value}`);
        }
      });
    }
    
    console.log("=== END OCR FIELDS ADDITION ===");
    
    // Log final usersData before insert
    console.log("=== FINAL USERS DATA BEFORE INSERT ===");
    console.log("Total fields:", Object.keys(usersData).length);
    console.log("Fields:", Object.keys(usersData).join(", "));
    console.log("Sample data:", JSON.stringify(usersData, null, 2).substring(0, 500));
    console.log("=== END FINAL USERS DATA ===");

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
      
      console.log("=== DOCUMENT URLS DEBUG ===");
      console.log("upload_ijasah:", ijasahUrl);
      console.log("ktp_document_url:", ktpDocUrl);
      console.log("selfie_url:", selfieUrl);
      console.log("family_card_url:", familyCardUrl);
      console.log("sim_url:", simUrl);
      console.log("skck_url:", skckUrl);
      console.log("=== END DEBUG ===");
      
      usersData["upload_ijasah"] = ijasahUrl;
      usersData["ktp_document_url"] = ktpDocUrl;
      usersData["selfie_url"] = selfieUrl;
      usersData["family_card_url"] = familyCardUrl;
      usersData["sim_url"] = simUrl;
      usersData["skck_url"] = skckUrl;
      usersData.ktp_number = ktp_number || details.ktp_number || null;
      usersData.ktp_address = ktp_address || details.ktp_address || null;
      usersData.religion = religion || details.religion || null;
      usersData.ethnicity = ethnicity || details.ethnicity || null;
      usersData.education = education || details.education || null;
      usersData.license_number = license_number || details.license_number || null;
      usersData.license_expiry_date = license_expiry_date || details.license_expiry_date || null;
    }

    // For suppliers, add supplier-specific fields to users table
    if (normalizedEntityType === "supplier") {
      usersData.supplier_name = details.entity_name || derivedFullName;
      usersData.contact_person = details.contact_person || derivedFullName;
      usersData.city = details.city;
      usersData.country = details.country;
      usersData.address = details.address;
      usersData.pkp_status = details.is_pkp;
      usersData.bank_account_holder = details.bank_account_holder;
    }

    // Upsert into users table with retry mechanism for foreign key constraint
    console.log("=== USERS DATA TO UPSERT ===");
    console.log(JSON.stringify(usersData, null, 2));
    console.log("=== END USERS DATA ===");
    
    let userError = null;
    let retryCount = 0;
    const maxRetries = 5;
    
    while (retryCount < maxRetries) {
      const { error } = await supabase
        .from("users")
        .upsert(usersData, { onConflict: "id" });
      
      if (!error) {
        userError = null;
        console.log("User profile created successfully on attempt", retryCount + 1);
        break;
      }
      
      // Check if it's a foreign key constraint error
      if (error.code === "23503" && error.message?.includes("users_id_fkey")) {
        retryCount++;
        console.log(`Foreign key constraint error, retry ${retryCount}/${maxRetries}...`);
        // Wait longer between retries - exponential backoff
        const waitTime = 2000 * retryCount;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // Different error, don't retry
        userError = error;
        break;
      }
    }
    
    // If still failing after retries, set the error
    if (retryCount >= maxRetries) {
      userError = { code: "23503", message: "Foreign key constraint error after max retries" };
    }

    if (userError) {
      console.error("User upsert error after retries:", userError);
      console.error("Error code:", userError.code);
      console.error("Error message:", userError.message);
      console.error("Error details:", JSON.stringify(userError, null, 2));
      // Rollback: delete auth user
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (delErr) {
        console.error("Rollback delete user error:", delErr);
      }
      return new Response(
        JSON.stringify({ error: "Failed to create user profile", details: userError.message }),
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
          user_id: userId,
          supplier_name: details.entity_name || derivedFullName,
          contact_person: details.contact_person || derivedFullName,
          email,
          phone_number: phone || "",
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === "customer") {
        const { error } = await supabase.from("customers").insert({
          user_id: userId,
          customer_name: details.entity_name || derivedFullName,
          contact_person: details.contact_person || derivedFullName,
          email,
          phone_number: phone || "",
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === "consignee") {
        // Remove full_name from entityData if it exists
        const { full_name: _, ...cleanEntityData } = entityData as any;
        
        const { error } = await supabase.from("consignees").insert({
          user_id: userId,
          consignee_name: details.entity_name || derivedFullName,
          contact_person: details.contact_person || derivedFullName,
          email,
          phone_number: phone || "",
          ...cleanEntityData,
        });
        entityError = error;
      } else if (normalizedEntity === "shipper") {
        const { error } = await supabase.from("shippers").insert({
          user_id: userId,
          shipper_name: details.entity_name || derivedFullName,
          contact_person: details.contact_person || derivedFullName,
          email,
          phone_number: phone || "",
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === "employee") {
        // Get document URLs for employees table
        const empKtpDocUrl = details.ktp_document_url || file_urls.ktp_document_url || null;
        const empSelfieUrl = details.selfie_url || file_urls.selfie_url || null;
        const empIjasahUrl = upload_ijasah || details.upload_ijasah || file_urls.upload_ijasah_url || null;
        const empFamilyCardUrl = details.family_card_url || file_urls.family_card_url || null;
        const empSimUrl = details.sim_url || file_urls.sim_url || null;
        const empSkckUrl = details.skck_url || file_urls.skck_url || null;
        
        const { error } = await supabase.from("employees").insert({
          user_id: userId,
          full_name: derivedFullName,
          email,
          phone,
          ktp_document_url: empKtpDocUrl,
          selfie_url: empSelfieUrl,
          upload_ijasah: empIjasahUrl,
          family_card_url: empFamilyCardUrl,
          sim_url: empSimUrl,
          skck_url: empSkckUrl,
          ktp_number: ktp_number || details.ktp_number || null,
          ktp_address: ktp_address || details.ktp_address || null,
          religion: religion || details.religion || null,
          ethnicity: ethnicity || details.ethnicity || null,
          education: education || details.education || null,
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === "driver" || normalizedEntity === "driver_perusahaan" || normalizedEntity === "driver_mitra") {
        const driverType = normalizedEntity === "driver_perusahaan" ? "perusahaan" : 
                          normalizedEntity === "driver_mitra" ? "mitra" : "general";
        
        // Get all driver-specific fields from details and file_urls
        const drvKtpDocUrl = details.ktp_document_url || file_urls.ktp_document_url || null;
        const drvSelfieUrl = details.selfie_url || file_urls.selfie_url || null;
        const drvSimUrl = details.sim_url || file_urls.sim_url || null;
        const drvSkckUrl = details.skck_url || file_urls.skck_url || null;
        const drvFamilyCardUrl = details.family_card_url || file_urls.family_card_url || null;
        const drvStnkUrl = details.upload_stnk_url || file_urls.upload_stnk_url || null;
        const drvVehiclePhoto = details.vehicle_photo || file_urls.upload_vehicle_photo_url || null;
        
        const { error } = await supabase.from("drivers").insert({
          user_id: userId,
          full_name: derivedFullName,
          email,
          phone,
          driver_type: driverType,
          // KTP and personal info
          ktp_number: ktp_number || details.ktp_number || null,
          ktp_address: ktp_address || details.ktp_address || null,
          religion: religion || details.religion || null,
          ethnicity: ethnicity || details.ethnicity || null,
          // License info
          license_number: license_number || details.license_number || null,
          license_expiry: license_expiry_date || details.license_expiry || details.license_expiry_date || null,
          // Vehicle info (for driver_mitra)
          vehicle_brand: details.vehicle_brand || null,
          vehicle_model: details.vehicle_model || null,
          plate_number: details.plate_number || null,
          vehicle_year: details.vehicle_year || null,
          vehicle_color: details.vehicle_color || null,
          // Document URLs
          ktp_document_url: drvKtpDocUrl,
          selfie_url: drvSelfieUrl,
          sim_url: drvSimUrl,
          skck_url: drvSkckUrl,
          family_card_url: drvFamilyCardUrl,
          upload_stnk_url: drvStnkUrl,
          vehicle_photo: drvVehiclePhoto,
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
        user_id: userId,
        message: "User created successfully. Please check your email for verification.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
