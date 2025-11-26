import { corsHeaders } from "@shared/cors.ts";
import { createSupabaseClient } from "@shared/supabase-client.ts";
import { validateEmail, validatePassword, validateRequiredFields } from "@shared/validation.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    const { email, password, full_name, entity_type, phone, details = {}, file_urls = {} } = body;

    // Validate required fields
    const requiredFields = ['email', 'password', 'full_name', 'entity_type'];
    const validation = validateRequiredFields(body, requiredFields);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${validation.missing?.join(', ')}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ error: passwordValidation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Normalize entity type to lowercase with underscores
    const normalizedEntityType = (entity_type || 'customer').toLowerCase().trim().replace(/\s+/g, '_');
    
    // Determine role based on entity type
    let role = 'viewer'; // default
    if (normalizedEntityType === 'karyawan') {
      role = 'admin'; // or based on details
    } else if (['supplier', 'customer', 'consignee', 'shipper'].includes(normalizedEntityType)) {
      role = 'viewer';
    }

    console.log('Creating user with:', { email, full_name, role, entity_type: normalizedEntityType });

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name,
        entity_type: normalizedEntityType,
        role,
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      
      // If user already exists, return a specific error
      if (authError.message.includes('already been registered') || authError.code === 'email_exists') {
        return new Response(
          JSON.stringify({ 
            error: 'An account with this email already exists. Please login instead or use a different email.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
        );
      }
      
      return new Response(
        JSON.stringify({ error: authError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Upsert into users table (handles duplicate key errors)
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUser.user.id,
        email,
        full_name,
        role,
        phone,
        is_active: false, // Inactive until verified
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('User upsert error:', userError);
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Insert into entity-specific table based on entity_type
    let entityError = null;
    const normalizedEntity = normalizedEntityType.toLowerCase();
    
    // Define allowed columns for each entity type
    const allowedColumns: Record<string, string[]> = {
      supplier: ['address', 'city', 'country', 'is_pkp', 'tax_id', 'bank_name', 'bank_account_holder', 'payment_terms', 'category', 'currency', 'status'],
      customer: ['address', 'city', 'country', 'is_pkp', 'tax_id', 'bank_name', 'bank_account_holder', 'payment_terms', 'category', 'currency', 'status', 'birth_date'],
      consignee: ['address', 'city', 'country', 'is_pkp', 'tax_id', 'bank_name', 'bank_account_holder', 'payment_terms', 'category', 'currency', 'status'],
      shipper: ['address', 'city', 'country', 'is_pkp', 'tax_id', 'bank_name', 'bank_account_holder', 'payment_terms', 'category', 'currency', 'status'],
      employee: ['position', 'department', 'hire_date', 'address', 'city', 'country', 'status'],
      driver: ['license_number', 'license_type', 'license_expiry', 'address', 'city', 'country', 'status'],
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
      if (normalizedEntity === 'supplier') {
        const { error } = await supabase.from('suppliers').insert({
          user_id: authUser.user.id,
          supplier_name: full_name,
          contact_person: full_name,
          email,
          phone_number: phone || '',
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === 'customer') {
        const { error } = await supabase.from('customers').insert({
          user_id: authUser.user.id,
          customer_name: full_name,
          contact_person: full_name,
          email,
          phone_number: phone || '',
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === 'consignee') {
        const { error } = await supabase.from('consignees').insert({
          user_id: authUser.user.id,
          consignee_name: full_name,
          contact_person: full_name,
          email,
          phone_number: phone || '',
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === 'shipper') {
        const { error } = await supabase.from('shippers').insert({
          user_id: authUser.user.id,
          shipper_name: full_name,
          contact_person: full_name,
          email,
          phone_number: phone || '',
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === 'employee' || normalizedEntity === 'karyawan') {
        const { error } = await supabase.from('employees').insert({
          user_id: authUser.user.id,
          full_name,
          email,
          phone,
          ...entityData,
        });
        entityError = error;
      } else if (normalizedEntity === 'driver') {
        const { error } = await supabase.from('drivers').insert({
          user_id: authUser.user.id,
          full_name,
          email,
          phone,
          ...entityData,
        });
        entityError = error;
      }
      
      if (entityError) {
        console.error('Entity insert error:', entityError);
        // Don't rollback - entity table is optional
      }
    } catch (err) {
      console.error('Entity creation error:', err);
      // Continue without entity record
    }

    // Send verification email
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
    });

    if (emailError) {
      console.error('Email verification error:', emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUser.user.id,
        message: 'User created successfully. Please check your email for verification.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
