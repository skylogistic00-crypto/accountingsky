export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_mappings: {
        Row: {
          category: string
          created_at: string | null
          credit_account: string | null
          debit_account: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          credit_account?: string | null
          debit_account?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          credit_account?: string | null
          debit_account?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_allowed_tables: {
        Row: {
          allowed_columns: string[] | null
          id: number
          schema_name: string | null
          table_name: string | null
        }
        Insert: {
          allowed_columns?: string[] | null
          id?: number
          schema_name?: string | null
          table_name?: string | null
        }
        Update: {
          allowed_columns?: string[] | null
          id?: number
          schema_name?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      ai_chat_logs: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          message: string | null
          meta: Json | null
          model: string | null
          role: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          meta?: Json | null
          model?: string | null
          role?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          meta?: Json | null
          model?: string | null
          role?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_query_logs: {
        Row: {
          allowed: boolean | null
          created_at: string | null
          error_text: string | null
          generated_sql: string | null
          id: string
          prompt: string | null
          rows_returned: number | null
          sanitized_sql: string | null
          user_id: string | null
        }
        Insert: {
          allowed?: boolean | null
          created_at?: string | null
          error_text?: string | null
          generated_sql?: string | null
          id?: string
          prompt?: string | null
          rows_returned?: number | null
          sanitized_sql?: string | null
          user_id?: string | null
        }
        Update: {
          allowed?: boolean | null
          created_at?: string | null
          error_text?: string | null
          generated_sql?: string | null
          id?: string
          prompt?: string | null
          rows_returned?: number | null
          sanitized_sql?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_role_whitelist: {
        Row: {
          allow_delete: boolean | null
          allow_insert: boolean | null
          allow_update: boolean | null
          allowed_columns: string[]
          id: number
          role: string
          table_name: string
        }
        Insert: {
          allow_delete?: boolean | null
          allow_insert?: boolean | null
          allow_update?: boolean | null
          allowed_columns: string[]
          id?: number
          role: string
          table_name: string
        }
        Update: {
          allow_delete?: boolean | null
          allow_insert?: boolean | null
          allow_update?: boolean | null
          allowed_columns?: string[]
          id?: number
          role?: string
          table_name?: string
        }
        Relationships: []
      }
      airwaybills: {
        Row: {
          arrival_airport_code: string
          arrival_date: string | null
          awb_number: string
          chargeable_weight_kg: number | null
          commodity_description: string | null
          consignee_address: string | null
          consignee_contact: string | null
          consignee_name: string | null
          consignee_npwp: string | null
          created_at: string
          created_by: string | null
          currency: string
          customs_clearance_date: string | null
          customs_declaration_number: string | null
          customs_status: Database["public"]["Enums"]["customs_status"] | null
          delivery_date: string | null
          delivery_order_number: string | null
          excise_duty: number
          flight_date: string | null
          flight_number: string | null
          freight_charge: number
          gross_weight_kg: number
          handling_fee: number
          hawb_number: string | null
          height_cm: number | null
          hs_code: string | null
          id: string
          import_duty: number
          import_type: Database["public"]["Enums"]["import_type"]
          incoterm: Database["public"]["Enums"]["incoterm_type"]
          insurance_fee: number
          invoice_number: string | null
          length_cm: number | null
          notify_party: string | null
          number_of_packages: number
          origin_airport_code: string
          other_charge: number
          other_taxes: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          pph_import: number
          ppn_import: number
          shipper_address: string | null
          shipper_name: string | null
          status: Database["public"]["Enums"]["airwaybill_status"]
          storage_fee: number
          storage_location: string | null
          total_charge: number | null
          total_taxes: number | null
          unloading_date: string | null
          updated_at: string
          updated_by: string | null
          value_of_goods: number | null
          volume_weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          arrival_airport_code: string
          arrival_date?: string | null
          awb_number: string
          chargeable_weight_kg?: number | null
          commodity_description?: string | null
          consignee_address?: string | null
          consignee_contact?: string | null
          consignee_name?: string | null
          consignee_npwp?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customs_clearance_date?: string | null
          customs_declaration_number?: string | null
          customs_status?: Database["public"]["Enums"]["customs_status"] | null
          delivery_date?: string | null
          delivery_order_number?: string | null
          excise_duty?: number
          flight_date?: string | null
          flight_number?: string | null
          freight_charge?: number
          gross_weight_kg: number
          handling_fee?: number
          hawb_number?: string | null
          height_cm?: number | null
          hs_code?: string | null
          id?: string
          import_duty?: number
          import_type?: Database["public"]["Enums"]["import_type"]
          incoterm?: Database["public"]["Enums"]["incoterm_type"]
          insurance_fee?: number
          invoice_number?: string | null
          length_cm?: number | null
          notify_party?: string | null
          number_of_packages: number
          origin_airport_code: string
          other_charge?: number
          other_taxes?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pph_import?: number
          ppn_import?: number
          shipper_address?: string | null
          shipper_name?: string | null
          status?: Database["public"]["Enums"]["airwaybill_status"]
          storage_fee?: number
          storage_location?: string | null
          total_charge?: number | null
          total_taxes?: number | null
          unloading_date?: string | null
          updated_at?: string
          updated_by?: string | null
          value_of_goods?: number | null
          volume_weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          arrival_airport_code?: string
          arrival_date?: string | null
          awb_number?: string
          chargeable_weight_kg?: number | null
          commodity_description?: string | null
          consignee_address?: string | null
          consignee_contact?: string | null
          consignee_name?: string | null
          consignee_npwp?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customs_clearance_date?: string | null
          customs_declaration_number?: string | null
          customs_status?: Database["public"]["Enums"]["customs_status"] | null
          delivery_date?: string | null
          delivery_order_number?: string | null
          excise_duty?: number
          flight_date?: string | null
          flight_number?: string | null
          freight_charge?: number
          gross_weight_kg?: number
          handling_fee?: number
          hawb_number?: string | null
          height_cm?: number | null
          hs_code?: string | null
          id?: string
          import_duty?: number
          import_type?: Database["public"]["Enums"]["import_type"]
          incoterm?: Database["public"]["Enums"]["incoterm_type"]
          insurance_fee?: number
          invoice_number?: string | null
          length_cm?: number | null
          notify_party?: string | null
          number_of_packages?: number
          origin_airport_code?: string
          other_charge?: number
          other_taxes?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pph_import?: number
          ppn_import?: number
          shipper_address?: string | null
          shipper_name?: string | null
          status?: Database["public"]["Enums"]["airwaybill_status"]
          storage_fee?: number
          storage_location?: string | null
          total_charge?: number | null
          total_taxes?: number | null
          unloading_date?: string | null
          updated_at?: string
          updated_by?: string | null
          value_of_goods?: number | null
          volume_weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: []
      }
      approval_transaksi: {
        Row: {
          account_number: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bank_name: string | null
          coa_cash_code: string | null
          coa_expense_code: string | null
          coa_payable_code: string | null
          created_at: string | null
          customer_name: string | null
          description: string | null
          id: string
          item_name: string
          journal_ref: string | null
          notes: string | null
          payment_method: string | null
          payment_type: string | null
          ppn_amount: number | null
          ppn_percentage: number | null
          quantity: number | null
          rejection_reason: string | null
          service_category: string | null
          service_type: string | null
          source: string | null
          subtotal: number | null
          supplier_name: string | null
          target_table: string | null
          total_amount: number
          transaction_date: string
          type: string
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_name?: string | null
          coa_cash_code?: string | null
          coa_expense_code?: string | null
          coa_payable_code?: string | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          item_name: string
          journal_ref?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_type?: string | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number | null
          rejection_reason?: string | null
          service_category?: string | null
          service_type?: string | null
          source?: string | null
          subtotal?: number | null
          supplier_name?: string | null
          target_table?: string | null
          total_amount: number
          transaction_date: string
          type: string
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_name?: string | null
          coa_cash_code?: string | null
          coa_expense_code?: string | null
          coa_payable_code?: string | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          item_name?: string
          journal_ref?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_type?: string | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number | null
          rejection_reason?: string | null
          service_category?: string | null
          service_type?: string | null
          source?: string | null
          subtotal?: number | null
          supplier_name?: string | null
          target_table?: string | null
          total_amount?: number
          transaction_date?: string
          type?: string
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          attendance_date: string
          clock_in: string | null
          clock_in_location: string | null
          clock_in_photo_url: string | null
          clock_out: string | null
          clock_out_location: string | null
          clock_out_photo_url: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          notes: string | null
          overtime_hours: number | null
          status: string | null
          updated_at: string | null
          work_hours: number | null
        }
        Insert: {
          attendance_date: string
          clock_in?: string | null
          clock_in_location?: string | null
          clock_in_photo_url?: string | null
          clock_out?: string | null
          clock_out_location?: string | null
          clock_out_photo_url?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          updated_at?: string | null
          work_hours?: number | null
        }
        Update: {
          attendance_date?: string
          clock_in?: string | null
          clock_in_location?: string | null
          clock_in_photo_url?: string | null
          clock_out?: string | null
          clock_out_location?: string | null
          clock_out_photo_url?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          updated_at?: string | null
          work_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          payload: Json | null
          resource: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json | null
          resource?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json | null
          resource?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      barang_keluar: {
        Row: {
          awb: string | null
          created_at: string | null
          final_price: number | null
          id: string
          item_arrival_date: string | null
          item_arrival_date_lini_2: string | null
          item_name: string | null
          item_quantity: number | null
          lots: string | null
          notes: string | null
          payment: string | null
          payment_status: string | null
          pick_up_date: string | null
          picked_up_by: string | null
          racks: string | null
          sku: string | null
          status: string | null
          storage_duration: number | null
          storage_duration_lini_2: number | null
          total_price: number | null
          total_price_lini_2: number | null
          unit: string | null
          updated_at: string | null
          warehouses: string | null
          zones: string | null
        }
        Insert: {
          awb?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          item_arrival_date?: string | null
          item_arrival_date_lini_2?: string | null
          item_name?: string | null
          item_quantity?: number | null
          lots?: string | null
          notes?: string | null
          payment?: string | null
          payment_status?: string | null
          pick_up_date?: string | null
          picked_up_by?: string | null
          racks?: string | null
          sku?: string | null
          status?: string | null
          storage_duration?: number | null
          storage_duration_lini_2?: number | null
          total_price?: number | null
          total_price_lini_2?: number | null
          unit?: string | null
          updated_at?: string | null
          warehouses?: string | null
          zones?: string | null
        }
        Update: {
          awb?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          item_arrival_date?: string | null
          item_arrival_date_lini_2?: string | null
          item_name?: string | null
          item_quantity?: number | null
          lots?: string | null
          notes?: string | null
          payment?: string | null
          payment_status?: string | null
          pick_up_date?: string | null
          picked_up_by?: string | null
          racks?: string | null
          sku?: string | null
          status?: string | null
          storage_duration?: number | null
          storage_duration_lini_2?: number | null
          total_price?: number | null
          total_price_lini_2?: number | null
          unit?: string | null
          updated_at?: string | null
          warehouses?: string | null
          zones?: string | null
        }
        Relationships: []
      }
      barang_lini_1: {
        Row: {
          awb: string | null
          created_at: string | null
          id: string
          item_arrival_date: string | null
          item_name: string
          item_quantity: number | null
          lots: string | null
          racks: string | null
          sku: string | null
          status: string | null
          stock_id: string | null
          storage_duration: number | null
          total_price: number
          unit: string | null
          updated_at: string | null
          warehouses: string | null
          zones: string | null
        }
        Insert: {
          awb?: string | null
          created_at?: string | null
          id?: string
          item_arrival_date?: string | null
          item_name: string
          item_quantity?: number | null
          lots?: string | null
          racks?: string | null
          sku?: string | null
          status?: string | null
          stock_id?: string | null
          storage_duration?: number | null
          total_price: number
          unit?: string | null
          updated_at?: string | null
          warehouses?: string | null
          zones?: string | null
        }
        Update: {
          awb?: string | null
          created_at?: string | null
          id?: string
          item_arrival_date?: string | null
          item_name?: string
          item_quantity?: number | null
          lots?: string | null
          racks?: string | null
          sku?: string | null
          status?: string | null
          stock_id?: string | null
          storage_duration?: number | null
          total_price?: number
          unit?: string | null
          updated_at?: string | null
          warehouses?: string | null
          zones?: string | null
        }
        Relationships: []
      }
      barang_lini_2: {
        Row: {
          awb: string | null
          created_at: string | null
          final_price: number | null
          id: string
          item_arrival_date: string | null
          item_arrival_date_lini_2: string | null
          item_name: string
          item_quantity: number | null
          lots: string | null
          racks: string | null
          sku: string
          status: string | null
          storage_duration: number | null
          storage_duration_lini_2: number | null
          total_price: number | null
          total_price_lini_2: number
          unit: string | null
          updated_at: string | null
          warehouses: string | null
          zones: string | null
        }
        Insert: {
          awb?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          item_arrival_date?: string | null
          item_arrival_date_lini_2?: string | null
          item_name: string
          item_quantity?: number | null
          lots?: string | null
          racks?: string | null
          sku: string
          status?: string | null
          storage_duration?: number | null
          storage_duration_lini_2?: number | null
          total_price?: number | null
          total_price_lini_2: number
          unit?: string | null
          updated_at?: string | null
          warehouses?: string | null
          zones?: string | null
        }
        Update: {
          awb?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          item_arrival_date?: string | null
          item_arrival_date_lini_2?: string | null
          item_name?: string
          item_quantity?: number | null
          lots?: string | null
          racks?: string | null
          sku?: string
          status?: string | null
          storage_duration?: number | null
          storage_duration_lini_2?: number | null
          total_price?: number | null
          total_price_lini_2?: number
          unit?: string | null
          updated_at?: string | null
          warehouses?: string | null
          zones?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          facility_id: string | null
          id: string
          metadata: Json | null
          price: number | null
          start_time: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          facility_id?: string | null
          id?: string
          metadata?: Json | null
          price?: number | null
          start_time: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          facility_id?: string | null
          id?: string
          metadata?: Json | null
          price?: number | null
          start_time?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      borrowers: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          borrower_code: string | null
          borrower_name: string
          borrower_type: string | null
          created_at: string | null
          credit_limit: number | null
          default_late_fee_percentage: number | null
          default_tax_percentage: number | null
          default_tax_type: string | null
          email: string | null
          id: string
          identity_number: string | null
          identity_type: string | null
          loan_calculation_method: string | null
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          borrower_code?: string | null
          borrower_name: string
          borrower_type?: string | null
          created_at?: string | null
          credit_limit?: number | null
          default_late_fee_percentage?: number | null
          default_tax_percentage?: number | null
          default_tax_type?: string | null
          email?: string | null
          id?: string
          identity_number?: string | null
          identity_type?: string | null
          loan_calculation_method?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          borrower_code?: string | null
          borrower_name?: string
          borrower_type?: string | null
          created_at?: string | null
          credit_limit?: number | null
          default_late_fee_percentage?: number | null
          default_tax_percentage?: number | null
          default_tax_type?: string | null
          email?: string | null
          id?: string
          identity_number?: string | null
          identity_type?: string | null
          loan_calculation_method?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          berat: number | null
          brand_name: string
          category: string
          coa_account_code: string | null
          coa_account_name: string | null
          created_at: string | null
          description: string | null
          id: string
          jenis_layanan: string | null
          kategori_layanan: string | null
          satuan: string | null
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          berat?: number | null
          brand_name: string
          category: string
          coa_account_code?: string | null
          coa_account_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          jenis_layanan?: string | null
          kategori_layanan?: string | null
          satuan?: string | null
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          berat?: number | null
          brand_name?: string
          category?: string
          coa_account_code?: string | null
          coa_account_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          jenis_layanan?: string | null
          kategori_layanan?: string | null
          satuan?: string | null
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      cash_and_bank_receipts: {
        Row: {
          amount: number
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bukti: string | null
          category: string | null
          coa_cash_code: string | null
          coa_contra_code: string | null
          created_at: string | null
          description: string | null
          id: string
          journal_ref: string | null
          ocr_data: Json | null
          payment_method: string | null
          reference_number: string | null
          source_destination: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bukti?: string | null
          category?: string | null
          coa_cash_code?: string | null
          coa_contra_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          journal_ref?: string | null
          ocr_data?: Json | null
          payment_method?: string | null
          reference_number?: string | null
          source_destination?: string | null
          transaction_date: string
          transaction_type?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bukti?: string | null
          category?: string | null
          coa_cash_code?: string | null
          coa_contra_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          journal_ref?: string | null
          ocr_data?: Json | null
          payment_method?: string | null
          reference_number?: string | null
          source_destination?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_disbursement: {
        Row: {
          account_code: string | null
          amount: number
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          attachment_url: string | null
          bank_account: string | null
          bank_account_id: string | null
          bukti: string | null
          cash_account_id: string | null
          category: string | null
          coa_cash_code: string | null
          coa_expense_code: string | null
          cost_center_id: string | null
          created_at: string | null
          created_by: string | null
          currency_code: string | null
          description: string
          document_number: string | null
          evidence_url: string | null
          exchange_rate: number | null
          external_reference: string | null
          id: string
          journal_id: string | null
          journal_ref: string | null
          normalized_amount: number | null
          notes: string | null
          ocr_data: Json | null
          payee_name: string
          payment_method: string
          rejection_reason: string | null
          status: string | null
          tax_amount: number | null
          tax_code: string | null
          tax_type: string | null
          transaction_date: string
          updated_at: string | null
        }
        Insert: {
          account_code?: string | null
          amount: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          bank_account?: string | null
          bank_account_id?: string | null
          bukti?: string | null
          cash_account_id?: string | null
          category?: string | null
          coa_cash_code?: string | null
          coa_expense_code?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          description: string
          document_number?: string | null
          evidence_url?: string | null
          exchange_rate?: number | null
          external_reference?: string | null
          id?: string
          journal_id?: string | null
          journal_ref?: string | null
          normalized_amount?: number | null
          notes?: string | null
          ocr_data?: Json | null
          payee_name: string
          payment_method: string
          rejection_reason?: string | null
          status?: string | null
          tax_amount?: number | null
          tax_code?: string | null
          tax_type?: string | null
          transaction_date: string
          updated_at?: string | null
        }
        Update: {
          account_code?: string | null
          amount?: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          bank_account?: string | null
          bank_account_id?: string | null
          bukti?: string | null
          cash_account_id?: string | null
          category?: string | null
          coa_cash_code?: string | null
          coa_expense_code?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          description?: string
          document_number?: string | null
          evidence_url?: string | null
          exchange_rate?: number | null
          external_reference?: string | null
          id?: string
          journal_id?: string | null
          journal_ref?: string | null
          normalized_amount?: number | null
          notes?: string | null
          ocr_data?: Json | null
          payee_name?: string
          payment_method?: string
          rejection_reason?: string | null
          status?: string | null
          tax_amount?: number | null
          tax_code?: string | null
          tax_type?: string | null
          transaction_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_receipts_payments: {
        Row: {
          account_number: string | null
          amount: number
          bank_name: string | null
          category: string | null
          coa_cash_code: string
          coa_contra_code: string
          created_at: string | null
          description: string | null
          id: string
          journal_ref: string | null
          payment_method: string | null
          reference_number: string | null
          source_destination: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          amount: number
          bank_name?: string | null
          category?: string | null
          coa_cash_code: string
          coa_contra_code: string
          created_at?: string | null
          description?: string | null
          id?: string
          journal_ref?: string | null
          payment_method?: string | null
          reference_number?: string | null
          source_destination?: string | null
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          category?: string | null
          coa_cash_code?: string
          coa_contra_code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          journal_ref?: string | null
          payment_method?: string | null
          reference_number?: string | null
          source_destination?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_contra"
            columns: ["coa_contra_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_contra"
            columns: ["coa_contra_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_contra"
            columns: ["coa_contra_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_contra"
            columns: ["coa_contra_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_contra"
            columns: ["coa_contra_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_contra"
            columns: ["coa_contra_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          balance: number | null
          created_at: string | null
          created_by: string | null
          current_balance: number | null
          description: string | null
          flow_type: string | null
          id: string
          is_active: boolean | null
          is_header: boolean | null
          jenis_layanan: string | null
          kategori_layanan: string | null
          level: number
          normal_balance: string | null
          parent_code: string | null
          trans_type: string | null
          updated_at: string | null
          usage_role: string | null
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          balance?: number | null
          created_at?: string | null
          created_by?: string | null
          current_balance?: number | null
          description?: string | null
          flow_type?: string | null
          id?: string
          is_active?: boolean | null
          is_header?: boolean | null
          jenis_layanan?: string | null
          kategori_layanan?: string | null
          level?: number
          normal_balance?: string | null
          parent_code?: string | null
          trans_type?: string | null
          updated_at?: string | null
          usage_role?: string | null
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          balance?: number | null
          created_at?: string | null
          created_by?: string | null
          current_balance?: number | null
          description?: string | null
          flow_type?: string | null
          id?: string
          is_active?: boolean | null
          is_header?: boolean | null
          jenis_layanan?: string | null
          kategori_layanan?: string | null
          level?: number
          normal_balance?: string | null
          parent_code?: string | null
          trans_type?: string | null
          updated_at?: string | null
          usage_role?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          content: string
          created_at: string | null
          hs_code_suggestions: Json | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          hs_code_suggestions?: Json | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          hs_code_suggestions?: Json | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      coa_category_mapping: {
        Row: {
          asset_account_code: string | null
          cogs_account_code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          revenue_account_code: string | null
          service_category: string
          service_type: string
          updated_at: string | null
        }
        Insert: {
          asset_account_code?: string | null
          cogs_account_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          revenue_account_code?: string | null
          service_category: string
          service_type: string
          updated_at?: string | null
        }
        Update: {
          asset_account_code?: string | null
          cogs_account_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          revenue_account_code?: string | null
          service_category?: string
          service_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coa_mapping: {
        Row: {
          account_code: string
          account_name: string
          category: string
          created_at: string | null
          id: string
        }
        Insert: {
          account_code: string
          account_name: string
          category: string
          created_at?: string | null
          id?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          category?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      consignees: {
        Row: {
          address: string | null
          bank_account_holder: string | null
          bank_name: string | null
          category: string | null
          city: string | null
          consignee_code: string
          consignee_name: string
          contact_person: string
          country: string | null
          created_at: string | null
          currency: string
          email: string
          id: string
          is_pkp: string | null
          npwp: number | null
          payment_terms: string | null
          phone_number: string
          status: string
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          bank_account_holder?: string | null
          bank_name?: string | null
          category?: string | null
          city?: string | null
          consignee_code: string
          consignee_name: string
          contact_person: string
          country?: string | null
          created_at?: string | null
          currency?: string
          email: string
          id?: string
          is_pkp?: string | null
          npwp?: number | null
          payment_terms?: string | null
          phone_number: string
          status?: string
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          bank_account_holder?: string | null
          bank_name?: string | null
          category?: string | null
          city?: string | null
          consignee_code?: string
          consignee_name?: string
          contact_person?: string
          country?: string | null
          created_at?: string | null
          currency?: string
          email?: string
          id?: string
          is_pkp?: string | null
          npwp?: number | null
          payment_terms?: string | null
          phone_number?: string
          status?: string
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consignees_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coretax_uploads: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string
          id: string
          notes: string | null
          period_month: number
          period_year: number
          status: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_type: string
          id?: string
          notes?: string | null
          period_month: number
          period_year: number
          status?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          notes?: string | null
          period_month?: number
          period_year?: number
          status?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_name: string | null
          birth_date: string | null
          birth_place: string | null
          category: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          customer_code: string | null
          customer_name: string | null
          email: string | null
          gender: string | null
          id: string
          is_pkp: string | null
          ktp_address: string | null
          ktp_number: number | null
          name: string
          payment_term_id: string | null
          phone: string | null
          phone_number: number | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          birth_date?: string | null
          birth_place?: string | null
          category?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          customer_code?: string | null
          customer_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          is_pkp?: string | null
          ktp_address?: string | null
          ktp_number?: number | null
          name?: string
          payment_term_id?: string | null
          phone?: string | null
          phone_number?: number | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          birth_date?: string | null
          birth_place?: string | null
          category?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          customer_code?: string | null
          customer_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          is_pkp?: string | null
          ktp_address?: string | null
          ktp_number?: number | null
          name?: string
          payment_term_id?: string | null
          phone?: string | null
          phone_number?: number | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_payment_term_id_fkey"
            columns: ["payment_term_id"]
            isOneToOne: false
            referencedRelation: "payment_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      data_karyawan: {
        Row: {
          agama: string | null
          alamat: string | null
          alasan_bergabung: string | null
          alasan_tidak_medical: string | null
          anak1_nama: string | null
          anak1_pendidikan_pekerjaan: string | null
          anak1_tanggal_lahir: string | null
          anak1_tempat_lahir: string | null
          anak2_nama: string | null
          anak2_pendidikan_pekerjaan: string | null
          anak2_tanggal_lahir: string | null
          anak2_tempat_lahir: string | null
          anak3_nama: string | null
          anak3_pendidikan_pekerjaan: string | null
          anak3_tanggal_lahir: string | null
          anak3_tempat_lahir: string | null
          ayah_nama: string | null
          ayah_pekerjaan: string | null
          ayah_pendidikan: string | null
          ayah_tanggal_lahir: string | null
          bahasa1_lisan: string | null
          bahasa1_nama: string | null
          bahasa1_tulisan: string | null
          bahasa2_lisan: string | null
          bahasa2_nama: string | null
          bahasa2_tulisan: string | null
          bahasa3_lisan: string | null
          bahasa3_nama: string | null
          bahasa3_tulisan: string | null
          bersedia_medical_checkup: boolean | null
          buku: string | null
          cara_mengisi_waktu: string | null
          created_at: string
          gaji_all_in_terakhir: number | null
          gaji_diharapkan: number | null
          golongan_darah: string | null
          hobi: string | null
          hukum_kapan_dimana: string | null
          hukum_perkara: string | null
          ibu_nama: string | null
          ibu_pekerjaan: string | null
          ibu_pendidikan: string | null
          ibu_tanggal_lahir: string | null
          id: string
          jenis_tempat_tinggal: string | null
          jenis_transportasi: string | null
          kebangsaan: string | null
          kenalan1_jabatan: string | null
          kenalan1_nama: string | null
          kenalan2_jabatan: string | null
          kenalan2_nama: string | null
          kerja1_alamat_perusahaan: string | null
          kerja1_alasan_pindah: string | null
          kerja1_jabatan: string | null
          kerja1_nama_perusahaan: string | null
          kerja1_periode_mulai: string | null
          kerja1_periode_selesai: string | null
          kerja2_alamat_perusahaan: string | null
          kerja2_alasan_pindah: string | null
          kerja2_jabatan: string | null
          kerja2_nama_perusahaan: string | null
          kerja2_periode_mulai: string | null
          kerja2_periode_selesai: string | null
          kerja3_alamat_perusahaan: string | null
          kerja3_alasan_pindah: string | null
          kerja3_jabatan: string | null
          kerja3_nama_perusahaan: string | null
          kerja3_periode_mulai: string | null
          kerja3_periode_selesai: string | null
          majalah: string | null
          masih_bekerja: boolean | null
          memakai_kacamata: boolean | null
          minus_kanan: string | null
          minus_kiri: string | null
          nama_lengkap: string
          nama_pasangan: string | null
          nama_tanda_tangan: string | null
          no_ktp_paspor: string | null
          no_telepon: string | null
          nonformal1_jenis: string | null
          nonformal1_penyelenggara: string | null
          nonformal1_sertifikat: boolean | null
          nonformal1_tahun: number | null
          nonformal1_tempat: string | null
          nonformal2_jenis: string | null
          nonformal2_penyelenggara: string | null
          nonformal2_sertifikat: boolean | null
          nonformal2_tahun: number | null
          nonformal2_tempat: string | null
          nonformal3_jenis: string | null
          nonformal3_penyelenggara: string | null
          nonformal3_sertifikat: boolean | null
          nonformal3_tahun: number | null
          nonformal3_tempat: string | null
          organisasi1_jabatan: string | null
          organisasi1_nama: string | null
          organisasi2_jabatan: string | null
          organisasi2_nama: string | null
          pekerjaan_membantu: string | null
          pekerjaan_mirip: string | null
          pekerjaan_pasangan: string | null
          pelajaran_favorit_sma: string | null
          pelajaran_favorit_smp: string | null
          pelajaran_favorit_univ: string | null
          pend1_lulus: boolean | null
          pend1_nama_sekolah: string | null
          pend1_periode_mulai: string | null
          pend1_periode_selesai: string | null
          pend1_tempat: string | null
          pend2_lulus: boolean | null
          pend2_nama_sekolah: string | null
          pend2_periode_mulai: string | null
          pend2_periode_selesai: string | null
          pend2_tempat: string | null
          pend3_lulus: boolean | null
          pend3_nama_sekolah: string | null
          pend3_periode_mulai: string | null
          pend3_periode_selesai: string | null
          pend3_tempat: string | null
          penjelasan_struktur_org: string | null
          pernah_berurusan_hukum: boolean | null
          pernah_organisasi: boolean | null
          pernah_sakit_keras: boolean | null
          posisi_dilamar: string
          sakit_keras_jenis_waktu: string | null
          sakit_keras_lama_rawat: string | null
          saudara1_jk: string | null
          saudara1_nama: string | null
          saudara1_pekerjaan: string | null
          saudara1_pendidikan: string | null
          saudara1_tanggal_lahir: string | null
          saudara2_jk: string | null
          saudara2_nama: string | null
          saudara2_pekerjaan: string | null
          saudara2_pendidikan: string | null
          saudara2_tanggal_lahir: string | null
          sim_a_berlaku_sampai: string | null
          sim_a_dikeluarkan_oleh: string | null
          sim_b1_berlaku_sampai: string | null
          sim_b1_dikeluarkan_oleh: string | null
          sim_b2_berlaku_sampai: string | null
          sim_b2_dikeluarkan_oleh: string | null
          sim_c_berlaku_sampai: string | null
          sim_c_dikeluarkan_oleh: string | null
          status_pernikahan: string | null
          struktur_gaji_terakhir: string | null
          surat_kabar: string | null
          tanggal_form: string | null
          tanggal_lahir: string | null
          tanggal_lahir_pasangan: string | null
          tanggal_mulai_bersedia: string | null
          tempat_lahir: string | null
          tempat_lahir_pasangan: string | null
          tunjangan_diharapkan: string | null
          updated_at: string
        }
        Insert: {
          agama?: string | null
          alamat?: string | null
          alasan_bergabung?: string | null
          alasan_tidak_medical?: string | null
          anak1_nama?: string | null
          anak1_pendidikan_pekerjaan?: string | null
          anak1_tanggal_lahir?: string | null
          anak1_tempat_lahir?: string | null
          anak2_nama?: string | null
          anak2_pendidikan_pekerjaan?: string | null
          anak2_tanggal_lahir?: string | null
          anak2_tempat_lahir?: string | null
          anak3_nama?: string | null
          anak3_pendidikan_pekerjaan?: string | null
          anak3_tanggal_lahir?: string | null
          anak3_tempat_lahir?: string | null
          ayah_nama?: string | null
          ayah_pekerjaan?: string | null
          ayah_pendidikan?: string | null
          ayah_tanggal_lahir?: string | null
          bahasa1_lisan?: string | null
          bahasa1_nama?: string | null
          bahasa1_tulisan?: string | null
          bahasa2_lisan?: string | null
          bahasa2_nama?: string | null
          bahasa2_tulisan?: string | null
          bahasa3_lisan?: string | null
          bahasa3_nama?: string | null
          bahasa3_tulisan?: string | null
          bersedia_medical_checkup?: boolean | null
          buku?: string | null
          cara_mengisi_waktu?: string | null
          created_at?: string
          gaji_all_in_terakhir?: number | null
          gaji_diharapkan?: number | null
          golongan_darah?: string | null
          hobi?: string | null
          hukum_kapan_dimana?: string | null
          hukum_perkara?: string | null
          ibu_nama?: string | null
          ibu_pekerjaan?: string | null
          ibu_pendidikan?: string | null
          ibu_tanggal_lahir?: string | null
          id?: string
          jenis_tempat_tinggal?: string | null
          jenis_transportasi?: string | null
          kebangsaan?: string | null
          kenalan1_jabatan?: string | null
          kenalan1_nama?: string | null
          kenalan2_jabatan?: string | null
          kenalan2_nama?: string | null
          kerja1_alamat_perusahaan?: string | null
          kerja1_alasan_pindah?: string | null
          kerja1_jabatan?: string | null
          kerja1_nama_perusahaan?: string | null
          kerja1_periode_mulai?: string | null
          kerja1_periode_selesai?: string | null
          kerja2_alamat_perusahaan?: string | null
          kerja2_alasan_pindah?: string | null
          kerja2_jabatan?: string | null
          kerja2_nama_perusahaan?: string | null
          kerja2_periode_mulai?: string | null
          kerja2_periode_selesai?: string | null
          kerja3_alamat_perusahaan?: string | null
          kerja3_alasan_pindah?: string | null
          kerja3_jabatan?: string | null
          kerja3_nama_perusahaan?: string | null
          kerja3_periode_mulai?: string | null
          kerja3_periode_selesai?: string | null
          majalah?: string | null
          masih_bekerja?: boolean | null
          memakai_kacamata?: boolean | null
          minus_kanan?: string | null
          minus_kiri?: string | null
          nama_lengkap: string
          nama_pasangan?: string | null
          nama_tanda_tangan?: string | null
          no_ktp_paspor?: string | null
          no_telepon?: string | null
          nonformal1_jenis?: string | null
          nonformal1_penyelenggara?: string | null
          nonformal1_sertifikat?: boolean | null
          nonformal1_tahun?: number | null
          nonformal1_tempat?: string | null
          nonformal2_jenis?: string | null
          nonformal2_penyelenggara?: string | null
          nonformal2_sertifikat?: boolean | null
          nonformal2_tahun?: number | null
          nonformal2_tempat?: string | null
          nonformal3_jenis?: string | null
          nonformal3_penyelenggara?: string | null
          nonformal3_sertifikat?: boolean | null
          nonformal3_tahun?: number | null
          nonformal3_tempat?: string | null
          organisasi1_jabatan?: string | null
          organisasi1_nama?: string | null
          organisasi2_jabatan?: string | null
          organisasi2_nama?: string | null
          pekerjaan_membantu?: string | null
          pekerjaan_mirip?: string | null
          pekerjaan_pasangan?: string | null
          pelajaran_favorit_sma?: string | null
          pelajaran_favorit_smp?: string | null
          pelajaran_favorit_univ?: string | null
          pend1_lulus?: boolean | null
          pend1_nama_sekolah?: string | null
          pend1_periode_mulai?: string | null
          pend1_periode_selesai?: string | null
          pend1_tempat?: string | null
          pend2_lulus?: boolean | null
          pend2_nama_sekolah?: string | null
          pend2_periode_mulai?: string | null
          pend2_periode_selesai?: string | null
          pend2_tempat?: string | null
          pend3_lulus?: boolean | null
          pend3_nama_sekolah?: string | null
          pend3_periode_mulai?: string | null
          pend3_periode_selesai?: string | null
          pend3_tempat?: string | null
          penjelasan_struktur_org?: string | null
          pernah_berurusan_hukum?: boolean | null
          pernah_organisasi?: boolean | null
          pernah_sakit_keras?: boolean | null
          posisi_dilamar: string
          sakit_keras_jenis_waktu?: string | null
          sakit_keras_lama_rawat?: string | null
          saudara1_jk?: string | null
          saudara1_nama?: string | null
          saudara1_pekerjaan?: string | null
          saudara1_pendidikan?: string | null
          saudara1_tanggal_lahir?: string | null
          saudara2_jk?: string | null
          saudara2_nama?: string | null
          saudara2_pekerjaan?: string | null
          saudara2_pendidikan?: string | null
          saudara2_tanggal_lahir?: string | null
          sim_a_berlaku_sampai?: string | null
          sim_a_dikeluarkan_oleh?: string | null
          sim_b1_berlaku_sampai?: string | null
          sim_b1_dikeluarkan_oleh?: string | null
          sim_b2_berlaku_sampai?: string | null
          sim_b2_dikeluarkan_oleh?: string | null
          sim_c_berlaku_sampai?: string | null
          sim_c_dikeluarkan_oleh?: string | null
          status_pernikahan?: string | null
          struktur_gaji_terakhir?: string | null
          surat_kabar?: string | null
          tanggal_form?: string | null
          tanggal_lahir?: string | null
          tanggal_lahir_pasangan?: string | null
          tanggal_mulai_bersedia?: string | null
          tempat_lahir?: string | null
          tempat_lahir_pasangan?: string | null
          tunjangan_diharapkan?: string | null
          updated_at?: string
        }
        Update: {
          agama?: string | null
          alamat?: string | null
          alasan_bergabung?: string | null
          alasan_tidak_medical?: string | null
          anak1_nama?: string | null
          anak1_pendidikan_pekerjaan?: string | null
          anak1_tanggal_lahir?: string | null
          anak1_tempat_lahir?: string | null
          anak2_nama?: string | null
          anak2_pendidikan_pekerjaan?: string | null
          anak2_tanggal_lahir?: string | null
          anak2_tempat_lahir?: string | null
          anak3_nama?: string | null
          anak3_pendidikan_pekerjaan?: string | null
          anak3_tanggal_lahir?: string | null
          anak3_tempat_lahir?: string | null
          ayah_nama?: string | null
          ayah_pekerjaan?: string | null
          ayah_pendidikan?: string | null
          ayah_tanggal_lahir?: string | null
          bahasa1_lisan?: string | null
          bahasa1_nama?: string | null
          bahasa1_tulisan?: string | null
          bahasa2_lisan?: string | null
          bahasa2_nama?: string | null
          bahasa2_tulisan?: string | null
          bahasa3_lisan?: string | null
          bahasa3_nama?: string | null
          bahasa3_tulisan?: string | null
          bersedia_medical_checkup?: boolean | null
          buku?: string | null
          cara_mengisi_waktu?: string | null
          created_at?: string
          gaji_all_in_terakhir?: number | null
          gaji_diharapkan?: number | null
          golongan_darah?: string | null
          hobi?: string | null
          hukum_kapan_dimana?: string | null
          hukum_perkara?: string | null
          ibu_nama?: string | null
          ibu_pekerjaan?: string | null
          ibu_pendidikan?: string | null
          ibu_tanggal_lahir?: string | null
          id?: string
          jenis_tempat_tinggal?: string | null
          jenis_transportasi?: string | null
          kebangsaan?: string | null
          kenalan1_jabatan?: string | null
          kenalan1_nama?: string | null
          kenalan2_jabatan?: string | null
          kenalan2_nama?: string | null
          kerja1_alamat_perusahaan?: string | null
          kerja1_alasan_pindah?: string | null
          kerja1_jabatan?: string | null
          kerja1_nama_perusahaan?: string | null
          kerja1_periode_mulai?: string | null
          kerja1_periode_selesai?: string | null
          kerja2_alamat_perusahaan?: string | null
          kerja2_alasan_pindah?: string | null
          kerja2_jabatan?: string | null
          kerja2_nama_perusahaan?: string | null
          kerja2_periode_mulai?: string | null
          kerja2_periode_selesai?: string | null
          kerja3_alamat_perusahaan?: string | null
          kerja3_alasan_pindah?: string | null
          kerja3_jabatan?: string | null
          kerja3_nama_perusahaan?: string | null
          kerja3_periode_mulai?: string | null
          kerja3_periode_selesai?: string | null
          majalah?: string | null
          masih_bekerja?: boolean | null
          memakai_kacamata?: boolean | null
          minus_kanan?: string | null
          minus_kiri?: string | null
          nama_lengkap?: string
          nama_pasangan?: string | null
          nama_tanda_tangan?: string | null
          no_ktp_paspor?: string | null
          no_telepon?: string | null
          nonformal1_jenis?: string | null
          nonformal1_penyelenggara?: string | null
          nonformal1_sertifikat?: boolean | null
          nonformal1_tahun?: number | null
          nonformal1_tempat?: string | null
          nonformal2_jenis?: string | null
          nonformal2_penyelenggara?: string | null
          nonformal2_sertifikat?: boolean | null
          nonformal2_tahun?: number | null
          nonformal2_tempat?: string | null
          nonformal3_jenis?: string | null
          nonformal3_penyelenggara?: string | null
          nonformal3_sertifikat?: boolean | null
          nonformal3_tahun?: number | null
          nonformal3_tempat?: string | null
          organisasi1_jabatan?: string | null
          organisasi1_nama?: string | null
          organisasi2_jabatan?: string | null
          organisasi2_nama?: string | null
          pekerjaan_membantu?: string | null
          pekerjaan_mirip?: string | null
          pekerjaan_pasangan?: string | null
          pelajaran_favorit_sma?: string | null
          pelajaran_favorit_smp?: string | null
          pelajaran_favorit_univ?: string | null
          pend1_lulus?: boolean | null
          pend1_nama_sekolah?: string | null
          pend1_periode_mulai?: string | null
          pend1_periode_selesai?: string | null
          pend1_tempat?: string | null
          pend2_lulus?: boolean | null
          pend2_nama_sekolah?: string | null
          pend2_periode_mulai?: string | null
          pend2_periode_selesai?: string | null
          pend2_tempat?: string | null
          pend3_lulus?: boolean | null
          pend3_nama_sekolah?: string | null
          pend3_periode_mulai?: string | null
          pend3_periode_selesai?: string | null
          pend3_tempat?: string | null
          penjelasan_struktur_org?: string | null
          pernah_berurusan_hukum?: boolean | null
          pernah_organisasi?: boolean | null
          pernah_sakit_keras?: boolean | null
          posisi_dilamar?: string
          sakit_keras_jenis_waktu?: string | null
          sakit_keras_lama_rawat?: string | null
          saudara1_jk?: string | null
          saudara1_nama?: string | null
          saudara1_pekerjaan?: string | null
          saudara1_pendidikan?: string | null
          saudara1_tanggal_lahir?: string | null
          saudara2_jk?: string | null
          saudara2_nama?: string | null
          saudara2_pekerjaan?: string | null
          saudara2_pendidikan?: string | null
          saudara2_tanggal_lahir?: string | null
          sim_a_berlaku_sampai?: string | null
          sim_a_dikeluarkan_oleh?: string | null
          sim_b1_berlaku_sampai?: string | null
          sim_b1_dikeluarkan_oleh?: string | null
          sim_b2_berlaku_sampai?: string | null
          sim_b2_dikeluarkan_oleh?: string | null
          sim_c_berlaku_sampai?: string | null
          sim_c_dikeluarkan_oleh?: string | null
          status_pernikahan?: string | null
          struktur_gaji_terakhir?: string | null
          surat_kabar?: string | null
          tanggal_form?: string | null
          tanggal_lahir?: string | null
          tanggal_lahir_pasangan?: string | null
          tanggal_mulai_bersedia?: string | null
          tempat_lahir?: string | null
          tempat_lahir_pasangan?: string | null
          tunjangan_diharapkan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          city: string | null
          created_at: string | null
          customer_name: string
          customer_phone: string | null
          delivery_address: string
          delivery_date: string | null
          delivery_number: string
          id: string
          notes: string | null
          postal_code: string | null
          province: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_address: string
          delivery_date?: string | null
          delivery_number: string
          id?: string
          notes?: string | null
          postal_code?: string | null
          province?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string
          delivery_date?: string | null
          delivery_number?: string
          id?: string
          notes?: string | null
          postal_code?: string | null
          province?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string | null
          created_at: string | null
          department_name: string
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          department_name: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          department_name?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          address: string | null
          agama: string | null
          birth_place: string | null
          city: string | null
          country: string | null
          created_at: string | null
          etnis: string | null
          foto_selfie_url: string | null
          full_name: string | null
          gender: string | null
          id: string
          kontak_referensi_nama: string | null
          kontak_referensi_nomor: string | null
          ktp_address: string | null
          ktp_number: number | null
          license_expiry: string | null
          license_number: string | null
          license_type: string | null
          nama_perusahaan_mitra: string | null
          nib: string | null
          nomor_kendaraan: string | null
          nomor_kk: string | null
          nomor_sim: string | null
          nomor_telepon: string | null
          npwp: string | null
          pic_name: string | null
          pic_phone: string | null
          plate_number: string | null
          sensitive_encrypted: boolean | null
          status: string | null
          tipe_driver: string | null
          updated_at: string | null
          upload_kk_url: string | null
          upload_ktp_url: string | null
          upload_sim_url: string | null
          upload_skck_url: string | null
          upload_stnk_url: string | null
          upload_vehicle_photo_url: string | null
          user_id: string | null
          vehicle_brand: string | null
          vehicle_color: string | null
          vehicle_model: string | null
          vehicle_year: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          agama?: string | null
          birth_place?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          etnis?: string | null
          foto_selfie_url?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          kontak_referensi_nama?: string | null
          kontak_referensi_nomor?: string | null
          ktp_address?: string | null
          ktp_number?: number | null
          license_expiry?: string | null
          license_number?: string | null
          license_type?: string | null
          nama_perusahaan_mitra?: string | null
          nib?: string | null
          nomor_kendaraan?: string | null
          nomor_kk?: string | null
          nomor_sim?: string | null
          nomor_telepon?: string | null
          npwp?: string | null
          pic_name?: string | null
          pic_phone?: string | null
          plate_number?: string | null
          sensitive_encrypted?: boolean | null
          status?: string | null
          tipe_driver?: string | null
          updated_at?: string | null
          upload_kk_url?: string | null
          upload_ktp_url?: string | null
          upload_sim_url?: string | null
          upload_skck_url?: string | null
          upload_stnk_url?: string | null
          upload_vehicle_photo_url?: string | null
          user_id?: string | null
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          agama?: string | null
          birth_place?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          etnis?: string | null
          foto_selfie_url?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          kontak_referensi_nama?: string | null
          kontak_referensi_nomor?: string | null
          ktp_address?: string | null
          ktp_number?: number | null
          license_expiry?: string | null
          license_number?: string | null
          license_type?: string | null
          nama_perusahaan_mitra?: string | null
          nib?: string | null
          nomor_kendaraan?: string | null
          nomor_kk?: string | null
          nomor_sim?: string | null
          nomor_telepon?: string | null
          npwp?: string | null
          pic_name?: string | null
          pic_phone?: string | null
          plate_number?: string | null
          sensitive_encrypted?: boolean | null
          status?: string | null
          tipe_driver?: string | null
          updated_at?: string | null
          upload_kk_url?: string | null
          upload_ktp_url?: string | null
          upload_sim_url?: string | null
          upload_skck_url?: string | null
          upload_stnk_url?: string | null
          upload_vehicle_photo_url?: string | null
          user_id?: string | null
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      employee_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          employee_id: string | null
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          notes: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          employee_id?: string | null
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          employee_id?: string | null
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_training: {
        Row: {
          certificate_url: string | null
          cost: number | null
          created_at: string | null
          duration_hours: number | null
          employee_id: string | null
          end_date: string | null
          id: string
          notes: string | null
          provider: string | null
          start_date: string
          status: string | null
          training_name: string
          training_type: string | null
          updated_at: string | null
        }
        Insert: {
          certificate_url?: string | null
          cost?: number | null
          created_at?: string | null
          duration_hours?: number | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          provider?: string | null
          start_date: string
          status?: string | null
          training_name: string
          training_type?: string | null
          updated_at?: string | null
        }
        Update: {
          certificate_url?: string | null
          cost?: number | null
          created_at?: string | null
          duration_hours?: number | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          provider?: string | null
          start_date?: string
          status?: string | null
          training_name?: string
          training_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          agama: string | null
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_name: string | null
          basic_salary: number | null
          birth_date: string | null
          birth_place: string | null
          bpjs_kesehatan: string | null
          bpjs_ketenagakerjaan: string | null
          city: string | null
          contract_file_url: string | null
          country: string | null
          created_at: string | null
          cv_file_url: string | null
          departemen: string | null
          department: string | null
          department_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          employee_code: string | null
          employee_number: string | null
          employment_status: string | null
          etnis: string | null
          foto_selfie_url: string | null
          full_name: string | null
          gender: string | null
          graduation_year: string | null
          id: string
          institution_name: string | null
          jabatan: string | null
          join_date: string | null
          kontak_referensi_nama: string | null
          kontak_referensi_nomor: string | null
          ktp_address: string | null
          ktp_file_url: string | null
          ktp_number: number | null
          last_education: string | null
          major: string | null
          marital_status: string | null
          nik: string | null
          nomor_kk: string | null
          nomor_telepon: string | null
          notes: string | null
          npwp_file_url: string | null
          npwp_number: string | null
          phone: string | null
          photo_url: string | null
          position: string | null
          position_id: string | null
          postal_code: string | null
          province: string | null
          religion: string | null
          sensitive_encrypted: boolean | null
          status: string | null
          updated_at: string | null
          upload_kk_url: string | null
          upload_ktp_url: string | null
          upload_skck_url: string | null
          user_id: string | null
          "users.entity": string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          agama?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          birth_date?: string | null
          birth_place?: string | null
          bpjs_kesehatan?: string | null
          bpjs_ketenagakerjaan?: string | null
          city?: string | null
          contract_file_url?: string | null
          country?: string | null
          created_at?: string | null
          cv_file_url?: string | null
          departemen?: string | null
          department?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_code?: string | null
          employee_number?: string | null
          employment_status?: string | null
          etnis?: string | null
          foto_selfie_url?: string | null
          full_name?: string | null
          gender?: string | null
          graduation_year?: string | null
          id?: string
          institution_name?: string | null
          jabatan?: string | null
          join_date?: string | null
          kontak_referensi_nama?: string | null
          kontak_referensi_nomor?: string | null
          ktp_address?: string | null
          ktp_file_url?: string | null
          ktp_number?: number | null
          last_education?: string | null
          major?: string | null
          marital_status?: string | null
          nik?: string | null
          nomor_kk?: string | null
          nomor_telepon?: string | null
          notes?: string | null
          npwp_file_url?: string | null
          npwp_number?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          position_id?: string | null
          postal_code?: string | null
          province?: string | null
          religion?: string | null
          sensitive_encrypted?: boolean | null
          status?: string | null
          updated_at?: string | null
          upload_kk_url?: string | null
          upload_ktp_url?: string | null
          upload_skck_url?: string | null
          user_id?: string | null
          "users.entity"?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          agama?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          birth_date?: string | null
          birth_place?: string | null
          bpjs_kesehatan?: string | null
          bpjs_ketenagakerjaan?: string | null
          city?: string | null
          contract_file_url?: string | null
          country?: string | null
          created_at?: string | null
          cv_file_url?: string | null
          departemen?: string | null
          department?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_code?: string | null
          employee_number?: string | null
          employment_status?: string | null
          etnis?: string | null
          foto_selfie_url?: string | null
          full_name?: string | null
          gender?: string | null
          graduation_year?: string | null
          id?: string
          institution_name?: string | null
          jabatan?: string | null
          join_date?: string | null
          kontak_referensi_nama?: string | null
          kontak_referensi_nomor?: string | null
          ktp_address?: string | null
          ktp_file_url?: string | null
          ktp_number?: number | null
          last_education?: string | null
          major?: string | null
          marital_status?: string | null
          nik?: string | null
          nomor_kk?: string | null
          nomor_telepon?: string | null
          notes?: string | null
          npwp_file_url?: string | null
          npwp_number?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          position_id?: string | null
          postal_code?: string | null
          province?: string | null
          religion?: string | null
          sensitive_encrypted?: boolean | null
          status?: string | null
          updated_at?: string | null
          upload_kk_url?: string | null
          upload_ktp_url?: string | null
          upload_skck_url?: string | null
          user_id?: string | null
          "users.entity"?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_contracts: {
        Row: {
          allowances: Json | null
          basic_salary: number | null
          benefits: string | null
          contract_file_url: string | null
          contract_number: string | null
          contract_type: string | null
          created_at: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          salary: number | null
          start_date: string
          status: string | null
          terms: string | null
          updated_at: string | null
        }
        Insert: {
          allowances?: Json | null
          basic_salary?: number | null
          benefits?: string | null
          contract_file_url?: string | null
          contract_number?: string | null
          contract_type?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          salary?: number | null
          start_date: string
          status?: string | null
          terms?: string | null
          updated_at?: string | null
        }
        Update: {
          allowances?: Json | null
          basic_salary?: number | null
          benefits?: string | null
          contract_file_url?: string | null
          contract_number?: string | null
          contract_type?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          salary?: number | null
          start_date?: string
          status?: string | null
          terms?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employment_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          capacity: number | null
          created_at: string | null
          description: string | null
          entity_id: string | null
          id: string
          is_active: boolean | null
          name: string
          operating_hours: Json | null
          price_per_hour: number | null
          price_per_visit: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          operating_hours?: Json | null
          price_per_hour?: number | null
          price_per_visit?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          operating_hours?: Json | null
          price_per_hour?: number | null
          price_per_visit?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      facility_slots: {
        Row: {
          booked_count: number | null
          created_at: string | null
          end_time: string
          facility_id: string | null
          id: string
          is_available: boolean | null
          max_capacity: number | null
          slot_date: string
          start_time: string
        }
        Insert: {
          booked_count?: number | null
          created_at?: string | null
          end_time: string
          facility_id?: string | null
          id?: string
          is_available?: boolean | null
          max_capacity?: number | null
          slot_date: string
          start_time: string
        }
        Update: {
          booked_count?: number | null
          created_at?: string | null
          end_time?: string
          facility_id?: string | null
          id?: string
          is_available?: boolean | null
          max_capacity?: number | null
          slot_date?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_slots_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_approvals: {
        Row: {
          approved_by: string | null
          approved_by_name: string | null
          approved_name: string | null
          created_at: string | null
          id: string
          level: string | null
          notes: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_by_name?: string | null
          approved_name?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          notes?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_by_name?: string | null
          approved_name?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          notes?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_approvals_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transaction_breakdown: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          item_name: string | null
          price: number | null
          qty: number | null
          raw_text: string | null
          subtotal: number | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          item_name?: string | null
          price?: number | null
          qty?: number | null
          raw_text?: string | null
          subtotal?: number | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          item_name?: string | null
          price?: number | null
          qty?: number | null
          raw_text?: string | null
          subtotal?: number | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_transaction_breakdown_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transaction_items: {
        Row: {
          created_at: string | null
          description: string | null
          finance_transaction_id: string | null
          id: string
          line_total: number | null
          qty: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          finance_transaction_id?: string | null
          id?: string
          line_total?: number | null
          qty?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          finance_transaction_id?: string | null
          id?: string
          line_total?: number | null
          qty?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_transaction_items_finance_transaction_id_fkey"
            columns: ["finance_transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transactions: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string | null
          created_by: string | null
          date_trans: string | null
          description: string | null
          employee_id: string | null
          employee_name: string | null
          file_url: string | null
          id: string
          merchant: string | null
          ocr_data: Json | null
          ocr_date: string | null
          ocr_merchant: string | null
          ocr_raw: Json | null
          ocr_raw_json: Json | null
          ocr_total: number | null
          ppn: number | null
          status: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date_trans?: string | null
          description?: string | null
          employee_id?: string | null
          employee_name?: string | null
          file_url?: string | null
          id?: string
          merchant?: string | null
          ocr_data?: Json | null
          ocr_date?: string | null
          ocr_merchant?: string | null
          ocr_raw?: Json | null
          ocr_raw_json?: Json | null
          ocr_total?: number | null
          ppn?: number | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date_trans?: string | null
          description?: string | null
          employee_id?: string | null
          employee_name?: string | null
          file_url?: string | null
          id?: string
          merchant?: string | null
          ocr_data?: Json | null
          ocr_date?: string | null
          ocr_merchant?: string | null
          ocr_raw?: Json | null
          ocr_raw_json?: Json | null
          ocr_total?: number | null
          ppn?: number | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      finance_transactions_line_items: {
        Row: {
          created_at: string | null
          description: string | null
          detected_tax: number | null
          finance_transaction_id: string | null
          id: string
          line_total: number | null
          qty: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          detected_tax?: number | null
          finance_transaction_id?: string | null
          id?: string
          line_total?: number | null
          qty?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          detected_tax?: number | null
          finance_transaction_id?: string | null
          id?: string
          line_total?: number | null
          qty?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_line_items_finance_transaction_id_fkey"
            columns: ["finance_transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      general_ledger: {
        Row: {
          created_at: string | null
          credit: number | null
          credit_account: string | null
          date: string | null
          debit: number | null
          debit_account: string
          description: string | null
          id: string
          journal_entry_id: string | null
          journal_number: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit?: number | null
          credit_account?: string | null
          date?: string | null
          debit?: number | null
          debit_account: string
          description?: string | null
          id?: string
          journal_entry_id?: string | null
          journal_number?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit?: number | null
          credit_account?: string | null
          date?: string | null
          debit?: number | null
          debit_account?: string
          description?: string | null
          id?: string
          journal_entry_id?: string | null
          journal_number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_gl_credit_account"
            columns: ["credit_account"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_credit_account"
            columns: ["credit_account"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_credit_account"
            columns: ["credit_account"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_credit_account"
            columns: ["credit_account"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_credit_account"
            columns: ["credit_account"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_credit_account"
            columns: ["credit_account"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_debit_account"
            columns: ["debit_account"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_debit_account"
            columns: ["debit_account"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_debit_account"
            columns: ["debit_account"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_debit_account"
            columns: ["debit_account"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_debit_account"
            columns: ["debit_account"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_gl_debit_account"
            columns: ["debit_account"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "general_ledger_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "general_ledger_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "vw_cash_flow_report"
            referencedColumns: ["journal_entry_id"]
          },
        ]
      }
      hrd_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrd_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hs_code_embeddings: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          hs_code_id: string | null
          id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          hs_code_id?: string | null
          id?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          hs_code_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hs_code_embeddings_hs_code_id_fkey"
            columns: ["hs_code_id"]
            isOneToOne: false
            referencedRelation: "hs_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      hs_codes: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          export_duty_rate: number | null
          export_restriction: string | null
          hs_code: string
          id: string
          import_duty_rate: number | null
          import_restriction: string | null
          is_active: boolean | null
          notes: string | null
          pph_rate: number | null
          sub_category: string | null
          unit: string | null
          updated_at: string | null
          vat_rate: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          export_duty_rate?: number | null
          export_restriction?: string | null
          hs_code: string
          id?: string
          import_duty_rate?: number | null
          import_restriction?: string | null
          is_active?: boolean | null
          notes?: string | null
          pph_rate?: number | null
          sub_category?: string | null
          unit?: string | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          export_duty_rate?: number | null
          export_restriction?: string | null
          hs_code?: string
          id?: string
          import_duty_rate?: number | null
          import_restriction?: string | null
          is_active?: boolean | null
          notes?: string | null
          pph_rate?: number | null
          sub_category?: string | null
          unit?: string | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Relationships: []
      }
      internal_usage: {
        Row: {
          coa_account_code: string
          coa_account_name: string
          coa_expense_code: string | null
          coa_inventory_code: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          department_name: string | null
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          purpose: string
          quantity: number
          stock_after: number
          stock_before: number
          total_cost: number
          unit_cost: number
          updated_at: string | null
          usage_date: string
          usage_location: string | null
          verified_by: string | null
          verified_by_name: string | null
        }
        Insert: {
          coa_account_code: string
          coa_account_name: string
          coa_expense_code?: string | null
          coa_inventory_code?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          department_name?: string | null
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          purpose: string
          quantity: number
          stock_after: number
          stock_before: number
          total_cost: number
          unit_cost: number
          updated_at?: string | null
          usage_date?: string
          usage_location?: string | null
          verified_by?: string | null
          verified_by_name?: string | null
        }
        Update: {
          coa_account_code?: string
          coa_account_name?: string
          coa_expense_code?: string | null
          coa_inventory_code?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          department_name?: string | null
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          purpose?: string
          quantity?: number
          stock_after?: number
          stock_before?: number
          total_cost?: number
          unit_cost?: number
          updated_at?: string | null
          usage_date?: string
          usage_location?: string | null
          verified_by?: string | null
          verified_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_usage_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_usage_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          akun_persediaan: string | null
          asal_barang: string | null
          berat: number | null
          coa_cogs_code: string | null
          coa_inventory_code: string | null
          cost_per_unit: number | null
          created_at: string | null
          dibuat_oleh: string | null
          harga_per_unit: number | null
          id: string
          item_id: string | null
          jenis_barang: string | null
          keterangan: string | null
          kode_barang: string | null
          lama_simpan: number | null
          line: string | null
          lokasi: string | null
          mata_uang: string | null
          nama_barang: string
          nomor_batch_lot: string | null
          nomor_dokumen_pabean: string | null
          nomor_seri: string | null
          qty_available: number | null
          sku: string
          status: string
          sync_status: string | null
          tanggal_masuk: string
          tanggal_posting_ceisa: string | null
          total_biaya: number | null
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          akun_persediaan?: string | null
          asal_barang?: string | null
          berat?: number | null
          coa_cogs_code?: string | null
          coa_inventory_code?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          dibuat_oleh?: string | null
          harga_per_unit?: number | null
          id?: string
          item_id?: string | null
          jenis_barang?: string | null
          keterangan?: string | null
          kode_barang?: string | null
          lama_simpan?: number | null
          line?: string | null
          lokasi?: string | null
          mata_uang?: string | null
          nama_barang: string
          nomor_batch_lot?: string | null
          nomor_dokumen_pabean?: string | null
          nomor_seri?: string | null
          qty_available?: number | null
          sku: string
          status: string
          sync_status?: string | null
          tanggal_masuk: string
          tanggal_posting_ceisa?: string | null
          total_biaya?: number | null
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          akun_persediaan?: string | null
          asal_barang?: string | null
          berat?: number | null
          coa_cogs_code?: string | null
          coa_inventory_code?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          dibuat_oleh?: string | null
          harga_per_unit?: number | null
          id?: string
          item_id?: string | null
          jenis_barang?: string | null
          keterangan?: string | null
          kode_barang?: string | null
          lama_simpan?: number | null
          line?: string | null
          lokasi?: string | null
          mata_uang?: string | null
          nama_barang?: string
          nomor_batch_lot?: string | null
          nomor_dokumen_pabean?: string | null
          nomor_seri?: string | null
          qty_available?: number | null
          sku?: string
          status?: string
          sync_status?: string | null
          tanggal_masuk?: string
          tanggal_posting_ceisa?: string | null
          total_biaya?: number | null
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_brand_mapping: {
        Row: {
          brand_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          item_name: string
          updated_at: string | null
        }
        Insert: {
          brand_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_name: string
          updated_at?: string | null
        }
        Update: {
          brand_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      item_master: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          item_name: string
          jenis_barang: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          item_name: string
          jenis_barang: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          item_name?: string
          jenis_barang?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sku: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sku?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sku?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      jenis_barang: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_number: string | null
          account_type: string | null
          code_booking: string | null
          created_at: string | null
          created_by: string | null
          credit: number | null
          credit_account: string | null
          date: string | null
          debit: number | null
          debit_account: string | null
          description: string | null
          entry_date: string | null
          entry_type: string | null
          id: string
          jenis_transaksi: string | null
          journal_date: string | null
          journal_number: string | null
          journal_ref: string | null
          kategori: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          nama: string | null
          posting_date: string | null
          reference: string | null
          reference_id: string | null
          reference_type: string | null
          sales_transactions_id: string | null
          service_type: string | null
          source_id: string | null
          source_table: string | null
          stock_adjustment_id: string | null
          stock_movement_id: string | null
          tanggal: string | null
          total_credit: number | null
          total_debit: number | null
          transaction_date: string | null
          transaction_id: string | null
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          account_code?: string | null
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          code_booking?: string | null
          created_at?: string | null
          created_by?: string | null
          credit?: number | null
          credit_account?: string | null
          date?: string | null
          debit?: number | null
          debit_account?: string | null
          description?: string | null
          entry_date?: string | null
          entry_type?: string | null
          id?: string
          jenis_transaksi?: string | null
          journal_date?: string | null
          journal_number?: string | null
          journal_ref?: string | null
          kategori?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          nama?: string | null
          posting_date?: string | null
          reference?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sales_transactions_id?: string | null
          service_type?: string | null
          source_id?: string | null
          source_table?: string | null
          stock_adjustment_id?: string | null
          stock_movement_id?: string | null
          tanggal?: string | null
          total_credit?: number | null
          total_debit?: number | null
          transaction_date?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          account_code?: string | null
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          code_booking?: string | null
          created_at?: string | null
          created_by?: string | null
          credit?: number | null
          credit_account?: string | null
          date?: string | null
          debit?: number | null
          debit_account?: string | null
          description?: string | null
          entry_date?: string | null
          entry_type?: string | null
          id?: string
          jenis_transaksi?: string | null
          journal_date?: string | null
          journal_number?: string | null
          journal_ref?: string | null
          kategori?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          nama?: string | null
          posting_date?: string | null
          reference?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sales_transactions_id?: string | null
          service_type?: string | null
          source_id?: string | null
          source_table?: string | null
          stock_adjustment_id?: string | null
          stock_movement_id?: string | null
          tanggal?: string | null
          total_credit?: number | null
          total_debit?: number | null
          transaction_date?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_journal_stock_adj"
            columns: ["stock_adjustment_id"]
            isOneToOne: false
            referencedRelation: "stock_adjustments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_sales_transactions_fk"
            columns: ["sales_transactions_id"]
            isOneToOne: false
            referencedRelation: "sales_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_stock_movement_id_fkey"
            columns: ["stock_movement_id"]
            isOneToOne: false
            referencedRelation: "stock_movement"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_items: {
        Row: {
          account_code: string | null
          account_id: string
          account_type: string | null
          credit: number
          debit: number
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_code?: string | null
          account_id: string
          account_type?: string | null
          credit?: number
          debit?: number
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_code?: string | null
          account_id?: string
          account_type?: string | null
          credit?: number
          debit?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_items_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_items_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "vw_cash_flow_report"
            referencedColumns: ["journal_entry_id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          account_code: string
          account_name: string | null
          created_at: string | null
          credit: number | null
          debit: number | null
          description: string | null
          id: string
          journal_id: string
        }
        Insert: {
          account_code: string
          account_name?: string | null
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          id?: string
          journal_id: string
        }
        Update: {
          account_code?: string
          account_name?: string | null
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          id?: string
          journal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "vw_cash_flow_report"
            referencedColumns: ["journal_entry_id"]
          },
        ]
      }
      kas_transaksi: {
        Row: {
          account_name: string
          account_number: string
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bukti: string | null
          bukti_url: string | null
          created_at: string
          document_number: string
          employee_id: string | null
          employee_name: string | null
          id: string
          keterangan: string | null
          nominal: number
          nominal_signed: number | null
          ocr_data: Json | null
          payment_type: string
          quantity: number | null
          rejection_reason: string | null
          service_category: string | null
          service_type: string | null
          tanggal: string
          tax_amount: number | null
          tax_percentage: number | null
          tax_type: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bukti?: string | null
          bukti_url?: string | null
          created_at?: string
          document_number?: string
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          keterangan?: string | null
          nominal: number
          nominal_signed?: number | null
          ocr_data?: Json | null
          payment_type: string
          quantity?: number | null
          rejection_reason?: string | null
          service_category?: string | null
          service_type?: string | null
          tanggal: string
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bukti?: string | null
          bukti_url?: string | null
          created_at?: string
          document_number?: string
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          keterangan?: string | null
          nominal?: number
          nominal_signed?: number | null
          ocr_data?: Json | null
          payment_type?: string
          quantity?: number | null
          rejection_reason?: string | null
          service_category?: string | null
          service_type?: string | null
          tanggal?: string
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      laporan_neraca: {
        Row: {
          account_code: string
          account_name: string
          balance: number
          created_at: string
          id: string
          period_end: string
          period_start: string
          section: string
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          balance?: number
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          section: string
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          balance?: number
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_balance: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string
          leave_type_id: string | null
          remaining_days: number
          total_days: number
          updated_at: string | null
          used_days: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          leave_type_id?: string | null
          remaining_days: number
          total_days: number
          updated_at?: string | null
          used_days?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          leave_type_id?: string | null
          remaining_days?: number
          total_days?: number
          updated_at?: string | null
          used_days?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          document_url: string | null
          employee_id: string | null
          end_date: string
          id: string
          leave_type_id: string | null
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: string | null
          total_days: number
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          document_url?: string | null
          employee_id?: string | null
          end_date: string
          id?: string
          leave_type_id?: string | null
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: string | null
          total_days: number
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          document_url?: string | null
          employee_id?: string | null
          end_date?: string
          id?: string
          leave_type_id?: string | null
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: string | null
          total_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_paid: boolean | null
          leave_name: string
          max_days: number | null
          requires_approval: boolean | null
          requires_document: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_paid?: boolean | null
          leave_name: string
          max_days?: number | null
          requires_approval?: boolean | null
          requires_document?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_paid?: boolean | null
          leave_name?: string
          max_days?: number | null
          requires_approval?: boolean | null
          requires_document?: boolean | null
        }
        Relationships: []
      }
      loan_installments: {
        Row: {
          actual_payment_date: string | null
          created_at: string | null
          days_late: number | null
          due_date: string
          id: string
          installment_number: number
          interest_amount: number
          late_fee: number | null
          late_fee_percentage: number | null
          loan_id: string
          notes: string | null
          paid_amount: number | null
          payment_date: string | null
          principal_amount: number
          remaining_balance: number | null
          status: string | null
          tax_amount: number | null
          tax_percentage: number | null
          tax_type: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_payment_date?: string | null
          created_at?: string | null
          days_late?: number | null
          due_date: string
          id?: string
          installment_number: number
          interest_amount?: number
          late_fee?: number | null
          late_fee_percentage?: number | null
          loan_id: string
          notes?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          principal_amount?: number
          remaining_balance?: number | null
          status?: string | null
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          actual_payment_date?: string | null
          created_at?: string | null
          days_late?: number | null
          due_date?: string
          id?: string
          installment_number?: number
          interest_amount?: number
          late_fee?: number | null
          late_fee_percentage?: number | null
          loan_id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          principal_amount?: number
          remaining_balance?: number | null
          status?: string | null
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_installments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_installments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "vw_loan_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          borrower_id: string | null
          coa_cash_code: string
          coa_interest_code: string | null
          coa_loan_code: string
          created_at: string | null
          id: string
          interest_rate: number | null
          journal_ref: string | null
          late_fee_per_day: number | null
          late_fee_percentage: number | null
          lender_name: string
          lender_type: string | null
          loan_date: string
          loan_number: string | null
          loan_term_months: number | null
          maturity_date: string | null
          notes: string | null
          payment_history: Json | null
          payment_schedule: string | null
          principal_amount: number
          purpose: string | null
          remaining_balance: number | null
          status: string | null
          tax_amount: number | null
          tax_percentage: number | null
          tax_type: string | null
          total_interest_paid: number | null
          total_paid: number | null
          updated_at: string | null
        }
        Insert: {
          borrower_id?: string | null
          coa_cash_code: string
          coa_interest_code?: string | null
          coa_loan_code: string
          created_at?: string | null
          id?: string
          interest_rate?: number | null
          journal_ref?: string | null
          late_fee_per_day?: number | null
          late_fee_percentage?: number | null
          lender_name: string
          lender_type?: string | null
          loan_date: string
          loan_number?: string | null
          loan_term_months?: number | null
          maturity_date?: string | null
          notes?: string | null
          payment_history?: Json | null
          payment_schedule?: string | null
          principal_amount: number
          purpose?: string | null
          remaining_balance?: number | null
          status?: string | null
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          total_interest_paid?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Update: {
          borrower_id?: string | null
          coa_cash_code?: string
          coa_interest_code?: string | null
          coa_loan_code?: string
          created_at?: string | null
          id?: string
          interest_rate?: number | null
          journal_ref?: string | null
          late_fee_per_day?: number | null
          late_fee_percentage?: number | null
          lender_name?: string
          lender_type?: string | null
          loan_date?: string
          loan_number?: string | null
          loan_term_months?: number | null
          maturity_date?: string | null
          notes?: string | null
          payment_history?: Json | null
          payment_schedule?: string | null
          principal_amount?: number
          purpose?: string | null
          remaining_balance?: number | null
          status?: string | null
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          total_interest_paid?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_borrower"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrowers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
        ]
      }
      locations: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      lots: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          item_name: string | null
          lot_number: string
          manufacturing_date: string | null
          quantity: number | null
          rack_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          item_name?: string | null
          lot_number: string
          manufacturing_date?: string | null
          quantity?: number | null
          rack_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          item_name?: string | null
          lot_number?: string
          manufacturing_date?: string | null
          quantity?: number | null
          rack_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_rack_id_fkey"
            columns: ["rack_id"]
            isOneToOne: false
            referencedRelation: "racks"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string | null
          description: string | null
          duration_months: number
          entity_id: string | null
          facility_type: string
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
          visits_per_month: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_months: number
          entity_id?: string | null
          facility_type: string
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string | null
          visits_per_month?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_months?: number
          entity_id?: string | null
          facility_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
          visits_per_month?: number | null
        }
        Relationships: []
      }
      noa_documents: {
        Row: {
          arrival_date: string | null
          bl_number: string | null
          cbm: string | null
          charges: Json | null
          consignee: string | null
          container_no: string | null
          created_at: string | null
          created_by: string | null
          file_url: string | null
          full_json: Json | null
          goods_description: string | null
          gross_weight: string | null
          hs_code: string | null
          id: string
          port_discharge: string | null
          port_loading: string | null
          shipper: string | null
          status: string | null
          vessel: string | null
          voyage: string | null
        }
        Insert: {
          arrival_date?: string | null
          bl_number?: string | null
          cbm?: string | null
          charges?: Json | null
          consignee?: string | null
          container_no?: string | null
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          full_json?: Json | null
          goods_description?: string | null
          gross_weight?: string | null
          hs_code?: string | null
          id?: string
          port_discharge?: string | null
          port_loading?: string | null
          shipper?: string | null
          status?: string | null
          vessel?: string | null
          voyage?: string | null
        }
        Update: {
          arrival_date?: string | null
          bl_number?: string | null
          cbm?: string | null
          charges?: Json | null
          consignee?: string | null
          container_no?: string | null
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          full_json?: Json | null
          goods_description?: string | null
          gross_weight?: string | null
          hs_code?: string | null
          id?: string
          port_discharge?: string | null
          port_loading?: string | null
          shipper?: string | null
          status?: string | null
          vessel?: string | null
          voyage?: string | null
        }
        Relationships: []
      }
      ocr_results: {
        Row: {
          confidence: string | null
          created_at: string | null
          created_by: string | null
          extracted_data: Json | null
          extracted_text: string | null
          file_name: string | null
          file_url: string | null
          id: string
          image_url: string | null
          raw_text: string | null
          updated_at: string | null
          user_id: string | null
          "users.entity": string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          created_by?: string | null
          extracted_data?: Json | null
          extracted_text?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          raw_text?: string | null
          updated_at?: string | null
          user_id?: string | null
          "users.entity"?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          created_by?: string | null
          extracted_data?: Json | null
          extracted_text?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          raw_text?: string | null
          updated_at?: string | null
          user_id?: string | null
          "users.entity"?: string | null
        }
        Relationships: []
      }
      password_resets: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_terms: {
        Row: {
          created_at: string | null
          days: number
          description: string | null
          id: string
          is_active: boolean | null
          term_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          term_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          term_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payroll: {
        Row: {
          allowances: Json | null
          basic_salary: number
          created_at: string | null
          deductions: Json | null
          employee_id: string | null
          gross_salary: number
          id: string
          net_salary: number
          notes: string | null
          overtime_hours: number | null
          overtime_pay: number | null
          payment_date: string | null
          payment_status: string | null
          period_month: number
          period_year: number
          tax: number | null
          updated_at: string | null
        }
        Insert: {
          allowances?: Json | null
          basic_salary: number
          created_at?: string | null
          deductions?: Json | null
          employee_id?: string | null
          gross_salary: number
          id?: string
          net_salary: number
          notes?: string | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          payment_date?: string | null
          payment_status?: string | null
          period_month: number
          period_year: number
          tax?: number | null
          updated_at?: string | null
        }
        Update: {
          allowances?: Json | null
          basic_salary?: number
          created_at?: string | null
          deductions?: Json | null
          employee_id?: string | null
          gross_salary?: number
          id?: string
          net_salary?: number
          notes?: string | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          payment_date?: string | null
          payment_status?: string | null
          period_month?: number
          period_year?: number
          tax?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          achievements: string | null
          areas_for_improvement: string | null
          attendance_punctuality: string | null
          comments: string | null
          communication: string | null
          created_at: string | null
          criteria: Json | null
          employee_id: string | null
          goals: string | null
          id: string
          initiative: string | null
          leadership: string | null
          overall_rating: number | null
          problem_solving: string | null
          productivity: string | null
          quality_of_work: string | null
          review_date: string
          review_period_end: string
          review_period_start: string
          reviewer_id: string | null
          status: string | null
          strengths: string | null
          teamwork: string | null
          training_needs: string | null
          updated_at: string | null
        }
        Insert: {
          achievements?: string | null
          areas_for_improvement?: string | null
          attendance_punctuality?: string | null
          comments?: string | null
          communication?: string | null
          created_at?: string | null
          criteria?: Json | null
          employee_id?: string | null
          goals?: string | null
          id?: string
          initiative?: string | null
          leadership?: string | null
          overall_rating?: number | null
          problem_solving?: string | null
          productivity?: string | null
          quality_of_work?: string | null
          review_date: string
          review_period_end: string
          review_period_start: string
          reviewer_id?: string | null
          status?: string | null
          strengths?: string | null
          teamwork?: string | null
          training_needs?: string | null
          updated_at?: string | null
        }
        Update: {
          achievements?: string | null
          areas_for_improvement?: string | null
          attendance_punctuality?: string | null
          comments?: string | null
          communication?: string | null
          created_at?: string | null
          criteria?: Json | null
          employee_id?: string | null
          goals?: string | null
          id?: string
          initiative?: string | null
          leadership?: string | null
          overall_rating?: number | null
          problem_solving?: string | null
          productivity?: string | null
          quality_of_work?: string | null
          review_date?: string
          review_period_end?: string
          review_period_start?: string
          reviewer_id?: string | null
          status?: string | null
          strengths?: string | null
          teamwork?: string | null
          training_needs?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      perpindahan_lini: {
        Row: {
          berat: number | null
          created_at: string | null
          hari_di_lini_1: number | null
          id: string
          kode_barang: string | null
          lokasi: string | null
          nama_barang: string
          nomor_dokumen_pabean: string | null
          sku: string
          tanggal_masuk_lini_1: string | null
          tanggal_pindah_lini_2: string
          total_biaya_lini_1: number | null
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          berat?: number | null
          created_at?: string | null
          hari_di_lini_1?: number | null
          id?: string
          kode_barang?: string | null
          lokasi?: string | null
          nama_barang: string
          nomor_dokumen_pabean?: string | null
          sku: string
          tanggal_masuk_lini_1?: string | null
          tanggal_pindah_lini_2: string
          total_biaya_lini_1?: number | null
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          berat?: number | null
          created_at?: string | null
          hari_di_lini_1?: number | null
          id?: string
          kode_barang?: string | null
          lokasi?: string | null
          nama_barang?: string
          nomor_dokumen_pabean?: string | null
          sku?: string
          tanggal_masuk_lini_1?: string | null
          tanggal_pindah_lini_2?: string
          total_biaya_lini_1?: number | null
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          level: string | null
          position_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          level?: string | null
          position_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          level?: string | null
          position_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reference: {
        Row: {
          berat: number | null
          brand: string | null
          coa_account_code: string | null
          coa_account_name: string | null
          created_at: string | null
          description: string | null
          hs_code: string | null
          id: string
          item_name: string
          jenis_layanan: string | null
          kategori_layanan: string | null
          satuan: string | null
          service_category: string | null
          service_type: string | null
          typical_weight: string | null
          unit: string | null
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          berat?: number | null
          brand?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          created_at?: string | null
          description?: string | null
          hs_code?: string | null
          id?: string
          item_name: string
          jenis_layanan?: string | null
          kategori_layanan?: string | null
          satuan?: string | null
          service_category?: string | null
          service_type?: string | null
          typical_weight?: string | null
          unit?: string | null
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          berat?: number | null
          brand?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          created_at?: string | null
          description?: string | null
          hs_code?: string | null
          id?: string
          item_name?: string
          jenis_layanan?: string | null
          kategori_layanan?: string | null
          satuan?: string | null
          service_category?: string | null
          service_type?: string | null
          typical_weight?: string | null
          unit?: string | null
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      purchase_requests: {
        Row: {
          barcode: string | null
          code: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          email: string | null
          foto_barang: string | null
          id: string
          item_description: string | null
          item_name: string
          name: string
          notes: string | null
          pph_amount: number | null
          pph_percentage: number | null
          ppn_amount: number | null
          ppn_percentage: number | null
          quantity: number
          request_code: string | null
          request_date: string
          request_number: string | null
          requester_id: string | null
          requester_name: string | null
          shipping_cost: number | null
          status: string | null
          supplier_id: string | null
          tax: number | null
          total_amount: number
          unit: string | null
          unit_price: number
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          barcode?: string | null
          code?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          email?: string | null
          foto_barang?: string | null
          id?: string
          item_description?: string | null
          item_name: string
          name: string
          notes?: string | null
          pph_amount?: number | null
          pph_percentage?: number | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity: number
          request_code?: string | null
          request_date: string
          request_number?: string | null
          requester_id?: string | null
          requester_name?: string | null
          shipping_cost?: number | null
          status?: string | null
          supplier_id?: string | null
          tax?: number | null
          total_amount: number
          unit?: string | null
          unit_price: number
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          barcode?: string | null
          code?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          email?: string | null
          foto_barang?: string | null
          id?: string
          item_description?: string | null
          item_name?: string
          name?: string
          notes?: string | null
          pph_amount?: number | null
          pph_percentage?: number | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number
          request_code?: string | null
          request_date?: string
          request_number?: string | null
          requester_id?: string | null
          requester_name?: string | null
          shipping_cost?: number | null
          status?: string | null
          supplier_id?: string | null
          tax?: number | null
          total_amount?: number
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skema_PR_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_transactions: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          brand: string | null
          bukti: string | null
          coa_cash_code: string | null
          coa_expense_code: string | null
          coa_inventory_code: string | null
          coa_payable_code: string | null
          coa_tax_code: string | null
          created_at: string | null
          description: string | null
          id: string
          item_id: string | null
          item_name: string | null
          journal_ref: string | null
          notes: string | null
          ocr_data: Json | null
          payment_method: string | null
          ppn_amount: number | null
          ppn_percentage: number | null
          quantity: number | null
          rejection_reason: string | null
          subtotal: number
          supplier_name: string | null
          tax_amount: number | null
          tax_percentage: number | null
          tax_type: string | null
          total_amount: number
          transaction_date: string
          transaction_type: string
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand?: string | null
          bukti?: string | null
          coa_cash_code?: string | null
          coa_expense_code?: string | null
          coa_inventory_code?: string | null
          coa_payable_code?: string | null
          coa_tax_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          item_id?: string | null
          item_name?: string | null
          journal_ref?: string | null
          notes?: string | null
          ocr_data?: Json | null
          payment_method?: string | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number | null
          rejection_reason?: string | null
          subtotal: number
          supplier_name?: string | null
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          total_amount: number
          transaction_date: string
          transaction_type: string
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand?: string | null
          bukti?: string | null
          coa_cash_code?: string | null
          coa_expense_code?: string | null
          coa_inventory_code?: string | null
          coa_payable_code?: string | null
          coa_tax_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          item_id?: string | null
          item_name?: string | null
          journal_ref?: string | null
          notes?: string | null
          ocr_data?: Json | null
          payment_method?: string | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number | null
          rejection_reason?: string | null
          subtotal?: number
          supplier_name?: string | null
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          total_amount?: number
          transaction_date?: string
          transaction_type?: string
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_expense"
            columns: ["coa_expense_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_expense"
            columns: ["coa_expense_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_expense"
            columns: ["coa_expense_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_expense"
            columns: ["coa_expense_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_expense"
            columns: ["coa_expense_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_expense"
            columns: ["coa_expense_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_inventory"
            columns: ["coa_inventory_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_inventory"
            columns: ["coa_inventory_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_inventory"
            columns: ["coa_inventory_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_inventory"
            columns: ["coa_inventory_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_inventory"
            columns: ["coa_inventory_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_inventory"
            columns: ["coa_inventory_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_payable"
            columns: ["coa_payable_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_payable"
            columns: ["coa_payable_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_payable"
            columns: ["coa_payable_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_payable"
            columns: ["coa_payable_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_payable"
            columns: ["coa_payable_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_payable"
            columns: ["coa_payable_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_tax"
            columns: ["coa_tax_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_tax"
            columns: ["coa_tax_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_tax"
            columns: ["coa_tax_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_tax"
            columns: ["coa_tax_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_tax"
            columns: ["coa_tax_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_tax"
            columns: ["coa_tax_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "purchase_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "stock"
            referencedColumns: ["id"]
          },
        ]
      }
      racks: {
        Row: {
          capacity: number | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          level: number | null
          name: string
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          capacity?: number | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name: string
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          capacity?: number | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name?: string
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "racks_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          entity_id: string | null
          id: string
          menu_key: string
          role: string
          updated_at: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          menu_key: string
          role: string
          updated_at?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          menu_key?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          entitas: string | null
          entity: string | null
          id: string
          permissions: Json | null
          role_id: number
          role_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entitas?: string | null
          entity?: string | null
          id?: string
          permissions?: Json | null
          role_id: number
          role_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entitas?: string | null
          entity?: string | null
          id?: string
          permissions?: Json | null
          role_id?: number
          role_name?: string
        }
        Relationships: []
      }
      sales_transactions: {
        Row: {
          approval_status: string | null
          brand: string | null
          bukti: string | null
          coa_account_code: string | null
          coa_account_name: string | null
          coa_cash_code: string | null
          coa_cogs_code: string | null
          coa_inventory_code: string | null
          coa_revenue_code: string | null
          coa_tax_code: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customer_name: string | null
          description: string | null
          id: string
          item_id: string | null
          item_name: string
          journal_ref: string | null
          notes: string | null
          ocr_data: Json | null
          payment_method: string | null
          pph_amount: number | null
          pph_percentage: number | null
          ppn_amount: number | null
          ppn_percentage: number | null
          quantity: number
          stock_after: number | null
          stock_before: number | null
          subtotal: number
          tax_amount: number | null
          tax_percentage: number | null
          tax_type: string | null
          total_amount: number
          transaction_date: string
          transaction_id: string | null
          transaction_type: string
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          brand?: string | null
          bukti?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          coa_cash_code?: string | null
          coa_cogs_code?: string | null
          coa_inventory_code?: string | null
          coa_revenue_code?: string | null
          coa_tax_code?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          item_id?: string | null
          item_name: string
          journal_ref?: string | null
          notes?: string | null
          ocr_data?: Json | null
          payment_method?: string | null
          pph_amount?: number | null
          pph_percentage?: number | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity: number
          stock_after?: number | null
          stock_before?: number | null
          subtotal: number
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          total_amount: number
          transaction_date?: string
          transaction_id?: string | null
          transaction_type: string
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          brand?: string | null
          bukti?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          coa_cash_code?: string | null
          coa_cogs_code?: string | null
          coa_inventory_code?: string | null
          coa_revenue_code?: string | null
          coa_tax_code?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          item_id?: string | null
          item_name?: string
          journal_ref?: string | null
          notes?: string | null
          ocr_data?: Json | null
          payment_method?: string | null
          pph_amount?: number | null
          pph_percentage?: number | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number
          stock_after?: number | null
          stock_before?: number | null
          subtotal?: number
          tax_amount?: number | null
          tax_percentage?: number | null
          tax_type?: string | null
          total_amount?: number
          transaction_date?: string
          transaction_id?: string | null
          transaction_type?: string
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "vw_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_items: {
        Row: {
          category: string | null
          coa_account_code: string | null
          coa_account_name: string | null
          coa_expense_code: string | null
          coa_revenue_code: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          item_arrival_date: string | null
          item_name: string
          jenis_penjualan: string | null
          ppn_on_sale: number | null
          ppn_status: string | null
          price: number | null
          selling_price: number | null
          selling_price_after_ppn: number | null
          service_category: string | null
          service_type: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          coa_expense_code?: string | null
          coa_revenue_code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_arrival_date?: string | null
          item_name: string
          jenis_penjualan?: string | null
          ppn_on_sale?: number | null
          ppn_status?: string | null
          price?: number | null
          selling_price?: number | null
          selling_price_after_ppn?: number | null
          service_category?: string | null
          service_type?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          coa_expense_code?: string | null
          coa_revenue_code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_arrival_date?: string | null
          item_name?: string
          jenis_penjualan?: string | null
          ppn_on_sale?: number | null
          ppn_status?: string | null
          price?: number | null
          selling_price?: number | null
          selling_price_after_ppn?: number | null
          service_category?: string | null
          service_type?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_items_coa_account_code_fkey"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "service_items_coa_account_code_fkey"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "service_items_coa_account_code_fkey"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "service_items_coa_account_code_fkey"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "service_items_coa_account_code_fkey"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "service_items_coa_account_code_fkey"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
        ]
      }
      service_purchase: {
        Row: {
          approval_status: string | null
          coa_cash_code: string | null
          coa_expense_code: string | null
          coa_payable_code: string | null
          created_at: string | null
          description: string | null
          id: string
          item_name: string
          journal_ref: string | null
          notes: string | null
          payment_method: string | null
          payment_type: string | null
          ppn_amount: number | null
          ppn_percentage: number | null
          quantity: number | null
          service_category: string | null
          service_type: string | null
          subtotal: number
          supplier_name: string | null
          total_amount: number
          transaction_date: string
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          coa_cash_code?: string | null
          coa_expense_code?: string | null
          coa_payable_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          item_name: string
          journal_ref?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_type?: string | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number | null
          service_category?: string | null
          service_type?: string | null
          subtotal: number
          supplier_name?: string | null
          total_amount: number
          transaction_date: string
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          coa_cash_code?: string | null
          coa_expense_code?: string | null
          coa_payable_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          item_name?: string
          journal_ref?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_type?: string | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number | null
          service_category?: string | null
          service_type?: string | null
          subtotal?: number
          supplier_name?: string | null
          total_amount?: number
          transaction_date?: string
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      shippers: {
        Row: {
          address: string | null
          bank_account_holder: string | null
          bank_name: string | null
          category: string | null
          city: string | null
          contact_person: string
          country: string | null
          created_at: string | null
          currency: string
          email: string
          id: string
          is_pkp: string | null
          payment_terms: string | null
          phone_number: string
          shipper_code: string
          shipper_name: string
          status: string
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          bank_account_holder?: string | null
          bank_name?: string | null
          category?: string | null
          city?: string | null
          contact_person: string
          country?: string | null
          created_at?: string | null
          currency?: string
          email: string
          id?: string
          is_pkp?: string | null
          payment_terms?: string | null
          phone_number: string
          shipper_code: string
          shipper_name: string
          status?: string
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          bank_account_holder?: string | null
          bank_name?: string | null
          category?: string | null
          city?: string | null
          contact_person?: string
          country?: string | null
          created_at?: string | null
          currency?: string
          email?: string
          id?: string
          is_pkp?: string | null
          payment_terms?: string | null
          phone_number?: string
          shipper_code?: string
          shipper_name?: string
          status?: string
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shippers_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sql_audit_logs: {
        Row: {
          created_at: string | null
          error: string | null
          executed_at: string
          id: string
          query: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          executed_at?: string
          id?: string
          query: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          executed_at?: string
          id?: string
          query?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      stock: {
        Row: {
          barcode: string | null
          brand: string | null
          coa_account_code: string | null
          coa_account_expense: string | null
          coa_account_hpp: string | null
          coa_account_inventory: string | null
          coa_account_name: string | null
          cost_per_unit: number | null
          created_at: string | null
          description: string | null
          harga_beli_setelah_pajak: number | null
          harga_jual: number | null
          harga_jual_setelah_pajak: number | null
          hawb: string | null
          id: string
          is_pajak: boolean | null
          item_name: string
          item_quantity: number | null
          jenis_barang: string | null
          kode_barang: string | null
          lot_id: string | null
          mawb: string | null
          nominal_barang: number | null
          nomor_plp: string | null
          part_number: string | null
          ppn_type: string | null
          purchase_price: number | null
          quantity: number | null
          rack_id: string | null
          racks: string | null
          selling_price: number | null
          selling_price_after_ppn: number | null
          service_category: string | null
          service_type: string | null
          sku: string | null
          supplier_address: string | null
          supplier_email: string | null
          supplier_id: string | null
          supplier_name: string | null
          supplier_phone: string | null
          tanggal_masuk_barang: string | null
          tipe_barang: string | null
          typical_weight: string | null
          unit: string | null
          updated_at: string | null
          warehouse_id: string | null
          warehouses: string | null
          zone_id: string | null
          zones: string | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          coa_account_code?: string | null
          coa_account_expense?: string | null
          coa_account_hpp?: string | null
          coa_account_inventory?: string | null
          coa_account_name?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          harga_beli_setelah_pajak?: number | null
          harga_jual?: number | null
          harga_jual_setelah_pajak?: number | null
          hawb?: string | null
          id?: string
          is_pajak?: boolean | null
          item_name: string
          item_quantity?: number | null
          jenis_barang?: string | null
          kode_barang?: string | null
          lot_id?: string | null
          mawb?: string | null
          nominal_barang?: number | null
          nomor_plp?: string | null
          part_number?: string | null
          ppn_type?: string | null
          purchase_price?: number | null
          quantity?: number | null
          rack_id?: string | null
          racks?: string | null
          selling_price?: number | null
          selling_price_after_ppn?: number | null
          service_category?: string | null
          service_type?: string | null
          sku?: string | null
          supplier_address?: string | null
          supplier_email?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          supplier_phone?: string | null
          tanggal_masuk_barang?: string | null
          tipe_barang?: string | null
          typical_weight?: string | null
          unit?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
          warehouses?: string | null
          zone_id?: string | null
          zones?: string | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          coa_account_code?: string | null
          coa_account_expense?: string | null
          coa_account_hpp?: string | null
          coa_account_inventory?: string | null
          coa_account_name?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          harga_beli_setelah_pajak?: number | null
          harga_jual?: number | null
          harga_jual_setelah_pajak?: number | null
          hawb?: string | null
          id?: string
          is_pajak?: boolean | null
          item_name?: string
          item_quantity?: number | null
          jenis_barang?: string | null
          kode_barang?: string | null
          lot_id?: string | null
          mawb?: string | null
          nominal_barang?: number | null
          nomor_plp?: string | null
          part_number?: string | null
          ppn_type?: string | null
          purchase_price?: number | null
          quantity?: number | null
          rack_id?: string | null
          racks?: string | null
          selling_price?: number | null
          selling_price_after_ppn?: number | null
          service_category?: string | null
          service_type?: string | null
          sku?: string | null
          supplier_address?: string | null
          supplier_email?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          supplier_phone?: string | null
          tanggal_masuk_barang?: string | null
          tipe_barang?: string | null
          typical_weight?: string | null
          unit?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
          warehouses?: string | null
          zone_id?: string | null
          zones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_rack_id_fkey"
            columns: ["rack_id"]
            isOneToOne: false
            referencedRelation: "racks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          adjustment_value: number | null
          after_quantity: number | null
          approval_date: string | null
          approved_by: string | null
          before_quantity: number | null
          created_at: string | null
          created_by: string | null
          id: string
          item_name: string
          lot: string | null
          notes: string | null
          quantity: number
          quantity_change: number | null
          rack: string | null
          reason: string
          reference_number: string
          selling_price_after_ppn: number | null
          sku: string
          status: string | null
          stock_id: string | null
          stock_id_uuid: string | null
          supplier_id: string | null
          supplier_name: string | null
          transaction_date: string
          transaction_type: string
          unit: string
          updated_at: string | null
          warehouse: string | null
          zone: string | null
        }
        Insert: {
          adjustment_value?: number | null
          after_quantity?: number | null
          approval_date?: string | null
          approved_by?: string | null
          before_quantity?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_name: string
          lot?: string | null
          notes?: string | null
          quantity: number
          quantity_change?: number | null
          rack?: string | null
          reason: string
          reference_number: string
          selling_price_after_ppn?: number | null
          sku: string
          status?: string | null
          stock_id?: string | null
          stock_id_uuid?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          transaction_date?: string
          transaction_type: string
          unit: string
          updated_at?: string | null
          warehouse?: string | null
          zone?: string | null
        }
        Update: {
          adjustment_value?: number | null
          after_quantity?: number | null
          approval_date?: string | null
          approved_by?: string | null
          before_quantity?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_name?: string
          lot?: string | null
          notes?: string | null
          quantity?: number
          quantity_change?: number | null
          rack?: string | null
          reason?: string
          reference_number?: string
          selling_price_after_ppn?: number | null
          sku?: string
          status?: string | null
          stock_id?: string | null
          stock_id_uuid?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          transaction_date?: string
          transaction_type?: string
          unit?: string
          updated_at?: string | null
          warehouse?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_adjustment_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_adjustment_suppliers"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_balances: {
        Row: {
          account_id: string | null
          id: string
          item_id: string
          period: string | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          id?: string
          item_id: string
          period?: string | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          id?: string
          item_id?: string
          period?: string | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_balances_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_barang_import: {
        Row: {
          berat: number | null
          consignee: string | null
          deskripsi_barang: string | null
          hawb: string | null
          hs_code: string | null
          id: string
          jenis_barang: string | null
          jumlah: number | null
          lots: string | null
          mawb: string | null
          plp: string | null
          racks: string | null
          tanggal_barang_masuk: string | null
          unit: string | null
          volume: number | null
          warehouses: string | null
          zones: string | null
        }
        Insert: {
          berat?: number | null
          consignee?: string | null
          deskripsi_barang?: string | null
          hawb?: string | null
          hs_code?: string | null
          id?: string
          jenis_barang?: string | null
          jumlah?: number | null
          lots?: string | null
          mawb?: string | null
          plp?: string | null
          racks?: string | null
          tanggal_barang_masuk?: string | null
          unit?: string | null
          volume?: number | null
          warehouses?: string | null
          zones?: string | null
        }
        Update: {
          berat?: number | null
          consignee?: string | null
          deskripsi_barang?: string | null
          hawb?: string | null
          hs_code?: string | null
          id?: string
          jenis_barang?: string | null
          jumlah?: number | null
          lots?: string | null
          mawb?: string | null
          plp?: string | null
          racks?: string | null
          tanggal_barang_masuk?: string | null
          unit?: string | null
          volume?: number | null
          warehouses?: string | null
          zones?: string | null
        }
        Relationships: []
      }
      stock_coa_backfill_audit: {
        Row: {
          backup_at: string | null
          coa_account_code: string | null
          coa_account_name: string | null
          id: string | null
        }
        Insert: {
          backup_at?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          id?: string | null
        }
        Update: {
          backup_at?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
      stock_movement: {
        Row: {
          cost_per_unit: number | null
          created_at: string | null
          from_line: string | null
          from_location_id: string | null
          id: string
          item_id: string
          movement_at: string
          movement_date: string | null
          movement_type: string
          qty: number
          reference_no: string | null
          remarks: string | null
          to_line: string | null
          to_location_id: string | null
          total_value: number | null
          unit_cost: number | null
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string | null
          from_line?: string | null
          from_location_id?: string | null
          id?: string
          item_id: string
          movement_at?: string
          movement_date?: string | null
          movement_type: string
          qty: number
          reference_no?: string | null
          remarks?: string | null
          to_line?: string | null
          to_location_id?: string | null
          total_value?: number | null
          unit_cost?: number | null
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string | null
          from_line?: string | null
          from_location_id?: string | null
          id?: string
          item_id?: string
          movement_at?: string
          movement_date?: string | null
          movement_type?: string
          qty?: number
          reference_no?: string | null
          remarks?: string | null
          to_line?: string | null
          to_location_id?: string | null
          total_value?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movement_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          destination: string | null
          id: string
          item_name: string | null
          movement_type: string | null
          qty: number | null
          sku: string | null
          source: string | null
          total_cost: number | null
        }
        Insert: {
          created_at?: string | null
          destination?: string | null
          id?: string
          item_name?: string | null
          movement_type?: string | null
          qty?: number | null
          sku?: string | null
          source?: string | null
          total_cost?: number | null
        }
        Update: {
          created_at?: string | null
          destination?: string | null
          id?: string
          item_name?: string | null
          movement_type?: string | null
          qty?: number | null
          sku?: string | null
          source?: string | null
          total_cost?: number | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_name: string | null
          category: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          email: string | null
          id: string
          is_active: boolean
          is_pkp: string | null
          name: string | null
          npwp: number | null
          payment_terms: string | null
          phone_number: string | null
          status: string | null
          supplier_code: string
          supplier_name: string
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          category?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_pkp?: string | null
          name?: string | null
          npwp?: number | null
          payment_terms?: string | null
          phone_number?: string | null
          status?: string | null
          supplier_code?: string
          supplier_name: string
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          category?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_pkp?: string | null
          name?: string | null
          npwp?: number | null
          payment_terms?: string | null
          phone_number?: string | null
          status?: string | null
          supplier_code?: string
          supplier_name?: string
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_reminders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          due_date: string
          id: string
          is_completed: boolean | null
          notes: string | null
          period_month: number | null
          period_year: number
          reminder_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          period_month?: number | null
          period_year: number
          reminder_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          period_month?: number | null
          period_year?: number
          reminder_type?: string
        }
        Relationships: []
      }
      tax_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          period_month: number
          period_year: number
          report_type: string
          status: string | null
          total_dpp: number | null
          total_pph: number | null
          total_ppn: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          period_month: number
          period_year: number
          report_type: string
          status?: string | null
          total_dpp?: number | null
          total_pph?: number | null
          total_ppn?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          period_month?: number
          period_year?: number
          report_type?: string
          status?: string | null
          total_dpp?: number | null
          total_pph?: number | null
          total_ppn?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tax_settings: {
        Row: {
          created_at: string | null
          description: string | null
          effective_date: string
          id: string
          is_active: boolean | null
          rate: number
          tax_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          effective_date: string
          id?: string
          is_active?: boolean | null
          rate: number
          tax_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean | null
          rate?: number
          tax_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tax_transactions: {
        Row: {
          amount: number | null
          coa_tax_code: string | null
          coa_tax_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          item_name: string | null
          quantity: number | null
          related_doc_no: string | null
          related_transaction_id: string | null
          sales_transaction_id: string | null
          sales_transactions_id: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_percentage: string | null
          tax_type: string | null
          total_amount: number | null
          transaction_date: string
          transaction_type: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          coa_tax_code?: string | null
          coa_tax_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          item_name?: string | null
          quantity?: number | null
          related_doc_no?: string | null
          related_transaction_id?: string | null
          sales_transaction_id?: string | null
          sales_transactions_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_percentage?: string | null
          tax_type?: string | null
          total_amount?: number | null
          transaction_date?: string
          transaction_type?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          coa_tax_code?: string | null
          coa_tax_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          item_name?: string | null
          quantity?: number | null
          related_doc_no?: string | null
          related_transaction_id?: string | null
          sales_transaction_id?: string | null
          sales_transactions_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_percentage?: string | null
          tax_type?: string | null
          total_amount?: number | null
          transaction_date?: string
          transaction_type?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_transactions_sales_fk"
            columns: ["sales_transactions_id"]
            isOneToOne: false
            referencedRelation: "sales_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_cart: {
        Row: {
          brand: string | null
          coa_selected: string | null
          consignee: string | null
          created_at: string | null
          customer: string | null
          description: string | null
          harga_beli: number | null
          harga_jual: number | null
          id: string
          item_name: string | null
          jenis_layanan: string | null
          jenis_transaksi: string
          kas_sumber: string | null
          kas_tujuan: string | null
          kategori: string | null
          kategori_pengeluaran: string | null
          nominal: number
          payment_type: string | null
          ppn_amount: number | null
          ppn_percentage: number | null
          quantity: number | null
          selected_bank: string | null
          selected_kas: string | null
          session_id: string | null
          status: string | null
          stock_info: Json | null
          sumber_penerimaan: string | null
          supplier: string | null
          tanggal: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          coa_selected?: string | null
          consignee?: string | null
          created_at?: string | null
          customer?: string | null
          description?: string | null
          harga_beli?: number | null
          harga_jual?: number | null
          id?: string
          item_name?: string | null
          jenis_layanan?: string | null
          jenis_transaksi: string
          kas_sumber?: string | null
          kas_tujuan?: string | null
          kategori?: string | null
          kategori_pengeluaran?: string | null
          nominal: number
          payment_type?: string | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number | null
          selected_bank?: string | null
          selected_kas?: string | null
          session_id?: string | null
          status?: string | null
          stock_info?: Json | null
          sumber_penerimaan?: string | null
          supplier?: string | null
          tanggal: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          coa_selected?: string | null
          consignee?: string | null
          created_at?: string | null
          customer?: string | null
          description?: string | null
          harga_beli?: number | null
          harga_jual?: number | null
          id?: string
          item_name?: string | null
          jenis_layanan?: string | null
          jenis_transaksi?: string
          kas_sumber?: string | null
          kas_tujuan?: string | null
          kategori?: string | null
          kategori_pengeluaran?: string | null
          nominal?: number
          payment_type?: string | null
          ppn_amount?: number | null
          ppn_percentage?: number | null
          quantity?: number | null
          selected_bank?: string | null
          selected_kas?: string | null
          session_id?: string | null
          status?: string | null
          stock_info?: Json | null
          sumber_penerimaan?: string | null
          supplier?: string | null
          tanggal?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_coa_selected"
            columns: ["coa_selected"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_selected"
            columns: ["coa_selected"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_selected"
            columns: ["coa_selected"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_selected"
            columns: ["coa_selected"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_selected"
            columns: ["coa_selected"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_selected"
            columns: ["coa_selected"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
        ]
      }
      trial_balance: {
        Row: {
          created_at: string
          credit_account: string | null
          debit_account: string | null
          id: string
          period_end: string
          period_start: string
          total_credit: number
          total_debit: number
        }
        Insert: {
          created_at?: string
          credit_account?: string | null
          debit_account?: string | null
          id?: string
          period_end: string
          period_start: string
          total_credit?: number
          total_debit?: number
        }
        Update: {
          created_at?: string
          credit_account?: string | null
          debit_account?: string | null
          id?: string
          period_end?: string
          period_start?: string
          total_credit?: number
          total_debit?: number
        }
        Relationships: []
      }
      trial_balance_backup: {
        Row: {
          account_code: string | null
          account_name: string | null
          balance: number | null
          closing_balance: number | null
          created_at: string | null
          credit: number | null
          credit_balance: number | null
          debit: number | null
          debit_balance: number | null
          id: string | null
          net_balance: number | null
          opening_balance: number | null
          period: string | null
          period_end: string | null
          period_start: string | null
          total_credit: number | null
          total_debit: number | null
          updated_at: string | null
        }
        Insert: {
          account_code?: string | null
          account_name?: string | null
          balance?: number | null
          closing_balance?: number | null
          created_at?: string | null
          credit?: number | null
          credit_balance?: number | null
          debit?: number | null
          debit_balance?: number | null
          id?: string | null
          net_balance?: number | null
          opening_balance?: number | null
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          total_credit?: number | null
          total_debit?: number | null
          updated_at?: string | null
        }
        Update: {
          account_code?: string | null
          account_name?: string | null
          balance?: number | null
          closing_balance?: number | null
          created_at?: string | null
          credit?: number | null
          credit_balance?: number | null
          debit?: number | null
          debit_balance?: number | null
          id?: string | null
          net_balance?: number | null
          opening_balance?: number | null
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          total_credit?: number | null
          total_debit?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_memberships: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          membership_id: string | null
          payment_status: string | null
          remaining_visits: number | null
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          membership_id?: string | null
          payment_status?: string | null
          remaining_visits?: number | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          membership_id?: string | null
          payment_status?: string | null
          remaining_visits?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          avatar_url: string | null
          bank_account_holder: string | null
          birth_place: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          department: string | null
          education: string | null
          email: string
          entity: string | null
          entity_type: string | null
          ethnicity: string | null
          expiry_date: string | null
          family_card_url: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          ktp_address: string | null
          ktp_document_url: string | null
          ktp_number: number | null
          last_login: string | null
          last_name: string | null
          license_number: string | null
          phone: string | null
          phone_number: string | null
          pkp_status: string | null
          religion: string | null
          role: string
          role_id: number | null
          role_name: string | null
          selfie_url: string | null
          sim_url: string | null
          skck_url: string | null
          status: Database["public"]["Enums"]["user_status"]
          supplier_name: string | null
          updated_at: string | null
          "upload-ijasah": string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bank_account_holder?: string | null
          birth_place?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          department?: string | null
          education?: string | null
          email: string
          entity?: string | null
          entity_type?: string | null
          ethnicity?: string | null
          expiry_date?: string | null
          family_card_url?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean | null
          ktp_address?: string | null
          ktp_document_url?: string | null
          ktp_number?: number | null
          last_login?: string | null
          last_name?: string | null
          license_number?: string | null
          phone?: string | null
          phone_number?: string | null
          pkp_status?: string | null
          religion?: string | null
          role?: string
          role_id?: number | null
          role_name?: string | null
          selfie_url?: string | null
          sim_url?: string | null
          skck_url?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          supplier_name?: string | null
          updated_at?: string | null
          "upload-ijasah"?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bank_account_holder?: string | null
          birth_place?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          department?: string | null
          education?: string | null
          email?: string
          entity?: string | null
          entity_type?: string | null
          ethnicity?: string | null
          expiry_date?: string | null
          family_card_url?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          ktp_address?: string | null
          ktp_document_url?: string | null
          ktp_number?: number | null
          last_login?: string | null
          last_name?: string | null
          license_number?: string | null
          phone?: string | null
          phone_number?: string | null
          pkp_status?: string | null
          religion?: string | null
          role?: string
          role_id?: number | null
          role_name?: string | null
          selfie_url?: string | null
          sim_url?: string | null
          skck_url?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          supplier_name?: string | null
          updated_at?: string | null
          "upload-ijasah"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      vehicle_models: {
        Row: {
          brand: string
          category: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          features: Json | null
          fuel_type: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          model: string
          price_per_day: number
          price_per_month: number | null
          price_per_week: number | null
          seat_capacity: number | null
          transmission: string | null
          updated_at: string | null
        }
        Insert: {
          brand: string
          category: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          features?: Json | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          model: string
          price_per_day: number
          price_per_month?: number | null
          price_per_week?: number | null
          seat_capacity?: number | null
          transmission?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          features?: Json | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          model?: string
          price_per_day?: number
          price_per_month?: number | null
          price_per_week?: number | null
          seat_capacity?: number | null
          transmission?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicle_rentals: {
        Row: {
          additional_charges: number | null
          base_price: number
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          deposit_amount: number | null
          discount: number | null
          end_date: string
          fuel_level_end: string | null
          fuel_level_start: string | null
          id: string
          notes: string | null
          odometer_end: number | null
          odometer_start: number | null
          payment_status: string | null
          pickup_location: string | null
          pickup_time: string | null
          rental_number: string
          rental_type: string | null
          return_location: string | null
          return_time: string | null
          start_date: string
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          additional_charges?: number | null
          base_price: number
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          discount?: number | null
          end_date: string
          fuel_level_end?: string | null
          fuel_level_start?: string | null
          id?: string
          notes?: string | null
          odometer_end?: number | null
          odometer_start?: number | null
          payment_status?: string | null
          pickup_location?: string | null
          pickup_time?: string | null
          rental_number: string
          rental_type?: string | null
          return_location?: string | null
          return_time?: string | null
          start_date: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          additional_charges?: number | null
          base_price?: number
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          discount?: number | null
          end_date?: string
          fuel_level_end?: string | null
          fuel_level_start?: string | null
          id?: string
          notes?: string | null
          odometer_end?: number | null
          odometer_start?: number | null
          payment_status?: string | null
          pickup_location?: string | null
          pickup_time?: string | null
          rental_number?: string
          rental_type?: string | null
          return_location?: string | null
          return_time?: string | null
          start_date?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_rentals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_rentals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_rentals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "vw_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_rentals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_rentals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string | null
          condition_notes: string | null
          created_at: string | null
          entity_id: string | null
          id: string
          insurance_expiry: string | null
          kir_expiry: string | null
          license_plate: string
          model_id: string | null
          odometer: number | null
          photos: Json | null
          status: string | null
          stnk_expiry: string | null
          updated_at: string | null
          vin_number: string | null
          year: number | null
        }
        Insert: {
          color?: string | null
          condition_notes?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          insurance_expiry?: string | null
          kir_expiry?: string | null
          license_plate: string
          model_id?: string | null
          odometer?: number | null
          photos?: Json | null
          status?: string | null
          stnk_expiry?: string | null
          updated_at?: string | null
          vin_number?: string | null
          year?: number | null
        }
        Update: {
          color?: string | null
          condition_notes?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          insurance_expiry?: string | null
          kir_expiry?: string | null
          license_plate?: string
          model_id?: string | null
          odometer?: number | null
          photos?: Json | null
          status?: string | null
          stnk_expiry?: string | null
          updated_at?: string | null
          vin_number?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string | null
          city: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          manager_name: string | null
          name: string
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      zones: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_all_financial_transactions: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          customer_name: string | null
          description: string | null
          id: string | null
          item_name: string | null
          journal_ref: string | null
          notes: string | null
          payment_method: string | null
          payment_type: string | null
          ppn_amount: number | null
          quantity: number | null
          subtotal: number | null
          supplier_name: string | null
          target_table: string | null
          total_amount: number | null
          transaction_date: string | null
          transaction_type: string | null
          unit_price: number | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string | null
          item_name?: string | null
          journal_ref?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_type?: string | null
          ppn_amount?: number | null
          quantity?: number | null
          subtotal?: number | null
          supplier_name?: string | null
          target_table?: string | null
          total_amount?: number | null
          transaction_date?: string | null
          transaction_type?: string | null
          unit_price?: number | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string | null
          item_name?: string | null
          journal_ref?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_type?: string | null
          ppn_amount?: number | null
          quantity?: number | null
          subtotal?: number | null
          supplier_name?: string | null
          target_table?: string | null
          total_amount?: number | null
          transaction_date?: string | null
          transaction_type?: string | null
          unit_price?: number | null
        }
        Relationships: []
      }
      vw_cash_flow_report: {
        Row: {
          cash_in: number | null
          cash_movement: number | null
          cash_out: number | null
          description: string | null
          entry_date: string | null
          jenis_transaksi: string | null
          journal_entry_id: string | null
        }
        Insert: {
          cash_in?: never
          cash_movement?: never
          cash_out?: never
          description?: string | null
          entry_date?: never
          jenis_transaksi?: string | null
          journal_entry_id?: string | null
        }
        Update: {
          cash_in?: never
          cash_movement?: never
          cash_out?: never
          description?: string | null
          entry_date?: never
          jenis_transaksi?: string | null
          journal_entry_id?: string | null
        }
        Relationships: []
      }
      vw_coa_accounts_by_service: {
        Row: {
          account_code: string | null
          account_name: string | null
          description: string | null
          jenis_layanan: string | null
          kategori_layanan: string | null
        }
        Relationships: []
      }
      vw_customers: {
        Row: {
          address: string | null
          bank_account_number: string | null
          created_at: string | null
          email: string | null
          id: string | null
          name: string | null
          payment_term_days: number | null
          payment_term_id: string | null
          payment_term_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_payment_term_id_fkey"
            columns: ["payment_term_id"]
            isOneToOne: false
            referencedRelation: "payment_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_dashboard_summary: {
        Row: {
          amount: number | null
          category: string | null
          credit_total: number | null
          debit_total: number | null
          entry_date: string | null
          month: number | null
          year: number | null
        }
        Relationships: []
      }
      vw_financial_report_from_journal_entries: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          amount: number | null
          credit_total: number | null
          debit_total: number | null
          entry_date: string | null
        }
        Relationships: []
      }
      vw_laba_rugi_detail: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          credit_total: number | null
          debit_total: number | null
          display_amount: number | null
          period_month: string | null
          transaction_date: string | null
        }
        Relationships: []
      }
      vw_laporan_keuangan: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          amount: number | null
          credit_total: number | null
          debit_total: number | null
          normal_balance: string | null
          period_month: string | null
          report_type: string | null
          section: string | null
          transaction_date: string | null
        }
        Relationships: []
      }
      vw_loan_summary: {
        Row: {
          coa_cash_code: string | null
          coa_interest_code: string | null
          coa_loan_code: string | null
          created_at: string | null
          id: string | null
          interest_rate: number | null
          journal_ref: string | null
          jumlah_pembayaran: number | null
          lender_name: string | null
          lender_type: string | null
          loan_date: string | null
          loan_number: string | null
          loan_term_months: number | null
          maturity_date: string | null
          notes: string | null
          payment_history: Json | null
          payment_schedule: string | null
          principal_amount: number | null
          purpose: string | null
          remaining_balance: number | null
          sisa_pokok: number | null
          status: string | null
          status_pembayaran: string | null
          total_bunga_dibayar: number | null
          total_interest_paid: number | null
          total_paid: number | null
          total_principal_dibayar: number | null
          updated_at: string | null
        }
        Insert: {
          coa_cash_code?: string | null
          coa_interest_code?: string | null
          coa_loan_code?: string | null
          created_at?: string | null
          id?: string | null
          interest_rate?: number | null
          journal_ref?: string | null
          jumlah_pembayaran?: never
          lender_name?: string | null
          lender_type?: string | null
          loan_date?: string | null
          loan_number?: string | null
          loan_term_months?: number | null
          maturity_date?: string | null
          notes?: string | null
          payment_history?: Json | null
          payment_schedule?: string | null
          principal_amount?: number | null
          purpose?: string | null
          remaining_balance?: number | null
          sisa_pokok?: never
          status?: string | null
          status_pembayaran?: never
          total_bunga_dibayar?: never
          total_interest_paid?: number | null
          total_paid?: number | null
          total_principal_dibayar?: never
          updated_at?: string | null
        }
        Update: {
          coa_cash_code?: string | null
          coa_interest_code?: string | null
          coa_loan_code?: string | null
          created_at?: string | null
          id?: string | null
          interest_rate?: number | null
          journal_ref?: string | null
          jumlah_pembayaran?: never
          lender_name?: string | null
          lender_type?: string | null
          loan_date?: string | null
          loan_number?: string | null
          loan_term_months?: number | null
          maturity_date?: string | null
          notes?: string | null
          payment_history?: Json | null
          payment_schedule?: string | null
          principal_amount?: number | null
          purpose?: string | null
          remaining_balance?: number | null
          sisa_pokok?: never
          status?: string | null
          status_pembayaran?: never
          total_bunga_dibayar?: never
          total_interest_paid?: number | null
          total_paid?: number | null
          total_principal_dibayar?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_cash"
            columns: ["coa_cash_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_interest"
            columns: ["coa_interest_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_from_journal"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_coa_loan"
            columns: ["coa_loan_code"]
            isOneToOne: false
            referencedRelation: "vw_trial_balance_per_account"
            referencedColumns: ["account_code"]
          },
        ]
      }
      vw_profit_and_loss: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          balance: number | null
          credit: number | null
          debit: number | null
          entry_date: string | null
        }
        Relationships: []
      }
      vw_purchase_requests: {
        Row: {
          item_name: string | null
          name: string | null
          request_code: string | null
          request_date: string | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          item_name?: string | null
          name?: string | null
          request_code?: string | null
          request_date?: never
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          item_name?: string | null
          name?: string | null
          request_code?: string | null
          request_date?: never
          status?: string | null
          total_amount?: number | null
        }
        Relationships: []
      }
      vw_trial_balance_from_journal: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          credit: number | null
          debit: number | null
          entry_date: string | null
        }
        Relationships: []
      }
      vw_trial_balance_per_account: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          balance: number | null
          entry_date: string | null
          total_credit: number | null
          total_debit: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_loan_payment: {
        Args: {
          p_bank_name?: string
          p_interest_amount?: number
          p_loan_id: string
          p_notes?: string
          p_payment_date: string
          p_payment_method?: string
          p_principal_amount: number
          p_reference_number?: string
        }
        Returns: Json
      }
      ai_cancel_booking: {
        Args: { p_booking_id: string; p_user_id: string }
        Returns: boolean
      }
      ai_create_booking: {
        Args: {
          p_end: string
          p_facility_id: string
          p_metadata?: Json
          p_price: number
          p_start: string
          p_user_id: string
        }
        Returns: string
      }
      ai_safe_sql_exec: {
        Args: { sql_text: string }
        Returns: Record<string, unknown>[]
      }
      ai_update_booking_time: {
        Args: {
          p_booking_id: string
          p_end: string
          p_start: string
          p_user_id: string
        }
        Returns: boolean
      }
      apply_coa_mapping_to_disbursement: {
        Args: { p_disbursement_id: string }
        Returns: undefined
      }
      calculate_late_fee:
        | {
            Args: {
              p_due_date: string
              p_installment_amount: number
              p_payment_date: string
            }
            Returns: number
          }
        | {
            Args: {
              p_due_date: string
              p_installment_amount: number
              p_late_fee_percentage?: number
              p_payment_date: string
            }
            Returns: number
          }
      calculate_tax: {
        Args: { p_base_amount: number; p_tax_percentage: number }
        Returns: number
      }
      cancel_journal: { Args: { p_journal_id: string }; Returns: string }
      check_availability: {
        Args: { e: string; f_id: string; s: string }
        Returns: boolean
      }
      cleanup_expired_tokens: { Args: never; Returns: undefined }
      cleanup_old_cart_items: { Args: never; Returns: undefined }
      create_journal_for_sales: {
        Args: { p_sales_id: string }
        Returns: string
      }
      create_monthly_tax_reminders: { Args: never; Returns: undefined }
      execute_sql: { Args: { query: string }; Returns: Json }
      fn_income_statement: {
        Args: { p_end: string; p_start: string }
        Returns: {
          account_code: string
          account_name: string
          credit_total: number
          debit_total: number
          is_total: boolean
          note: string
          saldo: number
          section: string
          sort_section: number
        }[]
      }
      fn_update_coa_balance: { Args: never; Returns: undefined }
      gen_stock_code: { Args: never; Returns: string }
      generate_booking_reference: { Args: never; Returns: string }
      generate_contract_number: { Args: never; Returns: string }
      generate_employee_number: { Args: never; Returns: string }
      generate_journal_number: { Args: never; Returns: string }
      generate_kas_document_number: { Args: never; Returns: string }
      generate_laba_rugi: {
        Args: never
        Returns: {
          amount: number
          type: string
        }[]
      }
      generate_neraca: {
        Args: never
        Returns: {
          amount: number
          type: string
        }[]
      }
      generate_pr_code: { Args: never; Returns: string }
      generate_rental_number: { Args: never; Returns: string }
      generate_supplier_code: {
        Args: { pad_len?: number; prefix?: string }
        Returns: string
      }
      generate_trial_balance: {
        Args: never
        Returns: {
          account_code: string
          total_credit: number
          total_debit: number
        }[]
      }
      get_balance_sheet: {
        Args: { p_as_of_date: string }
        Returns: {
          account_code: string
          account_name: string
          amount: number
          section: string
        }[]
      }
      get_brands_by_item: {
        Args: { p_item_name: string }
        Returns: {
          brand_name: string
        }[]
      }
      get_coa_mapping: {
        Args: { p_service_category: string; p_service_type: string }
        Returns: {
          asset_account_code: string
          asset_account_name: string
          cogs_account_code: string
          cogs_account_name: string
          revenue_account_code: string
          revenue_account_name: string
        }[]
      }
      get_general_ledger: {
        Args: { p_account_code: string }
        Returns: {
          balance: number
          credit: number
          debit: number
          description: string
          journal_date: string
          journal_ref: string
        }[]
      }
      get_hari_di_gudang: { Args: { tanggal_masuk: string }; Returns: number }
      get_hari_di_lini: { Args: { tanggal_masuk: string }; Returns: number }
      get_product_reference: {
        Args: { p_brand?: string; p_item_name: string }
        Returns: {
          brand: string
          coa_account_code: string
          coa_account_name: string
          description: string
          item_name: string
          service_category: string
          service_type: string
          typical_weight: string
          unit: string
        }[]
      }
      get_profit_and_loss: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          account_code: string
          account_name: string
          amount: number
          section: string
        }[]
      }
      get_service_types_by_category: {
        Args: { p_category: string }
        Returns: {
          description: string
          revenue_account_code: string
          service_type: string
        }[]
      }
      get_trial_balance: {
        Args: never
        Returns: {
          account_code: string
          account_name: string
          balance: number
          total_credit: number
          total_debit: number
        }[]
      }
      get_user_department: { Args: never; Returns: string }
      get_user_employee_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      insert_journal_entries: { Args: { entries: Json }; Returns: undefined }
      kas_autonumber: { Args: never; Returns: string }
      match_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_hs_codes: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          description: string
          hs_code: string
          id: string
          similarity: number
          sub_category: string
        }[]
      }
      post_cash_disbursement: {
        Args: { disbursement_id: string }
        Returns: string
      }
      post_cash_disbursement_to_journal: {
        Args: { p_disbursement_id: string }
        Returns: string
      }
      post_journal_to_general_ledger: {
        Args: { p_journal_id: string }
        Returns: undefined
      }
      rebuild_general_ledger: { Args: never; Returns: undefined }
      recalc_journal_totals: { Args: { p_je_id: string }; Returns: undefined }
      recalc_trial_balance_period: {
        Args: { p_account_code?: string; p_period_start: string }
        Returns: undefined
      }
      repost_gl_for_journal_entry:
        | {
            Args: { p_je_id: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.repost_gl_for_journal_entry(p_je_id => text), public.repost_gl_for_journal_entry(p_je_id => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { p_je_id: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.repost_gl_for_journal_entry(p_je_id => text), public.repost_gl_for_journal_entry(p_je_id => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      reverse_journal: { Args: { journal_id: string }; Returns: undefined }
      set_app_user: { Args: { uid: string }; Returns: undefined }
    }
    Enums: {
      airwaybill_status:
        | "ARRIVED"
        | "IN_CUSTOMS"
        | "CLEARED"
        | "DELIVERED"
        | "CANCELLED"
      customs_status: "PENDING" | "RELEASED" | "HOLD" | "CLEARED" | "REJECTED"
      import_type:
        | "DIRECT"
        | "CONSOLIDATED"
        | "COURIER"
        | "PERSONAL_GOODS"
        | "SAMPLE"
        | "OTHER"
      incoterm_type:
        | "EXW"
        | "FCA"
        | "FOB"
        | "CFR"
        | "CIF"
        | "CPT"
        | "CIP"
        | "DAP"
        | "DPU"
        | "DDP"
        | "OTHER"
      payment_status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "INVOICE_SENT"
      user_status: "active" | "inactive" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      airwaybill_status: [
        "ARRIVED",
        "IN_CUSTOMS",
        "CLEARED",
        "DELIVERED",
        "CANCELLED",
      ],
      customs_status: ["PENDING", "RELEASED", "HOLD", "CLEARED", "REJECTED"],
      import_type: [
        "DIRECT",
        "CONSOLIDATED",
        "COURIER",
        "PERSONAL_GOODS",
        "SAMPLE",
        "OTHER",
      ],
      incoterm_type: [
        "EXW",
        "FCA",
        "FOB",
        "CFR",
        "CIF",
        "CPT",
        "CIP",
        "DAP",
        "DPU",
        "DDP",
        "OTHER",
      ],
      payment_status: ["UNPAID", "PARTIALLY_PAID", "PAID", "INVOICE_SENT"],
      user_status: ["active", "inactive", "suspended"],
    },
  },
} as const
