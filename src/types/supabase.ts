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
        Relationships: [
          {
            foreignKeyName: "barang_lini_1_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stock"
            referencedColumns: ["id"]
          },
        ]
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
      cash_book: {
        Row: {
          account_name: string | null
          created_at: string | null
          document_number: string | null
          id: string
          keterangan: string | null
          nominal: number | null
          payment_type: string | null
        }
        Insert: {
          account_name?: string | null
          created_at?: string | null
          document_number?: string | null
          id?: string
          keterangan?: string | null
          nominal?: number | null
          payment_type?: string | null
        }
        Update: {
          account_name?: string | null
          created_at?: string | null
          document_number?: string | null
          id?: string
          keterangan?: string | null
          nominal?: number | null
          payment_type?: string | null
        }
        Relationships: []
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
          id: string
          is_active: boolean | null
          is_header: boolean | null
          jenis_layanan: string | null
          kategori_layanan: string | null
          level: number
          normal_balance: string | null
          parent_code: string | null
          updated_at: string | null
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
          id?: string
          is_active?: boolean | null
          is_header?: boolean | null
          jenis_layanan?: string | null
          kategori_layanan?: string | null
          level?: number
          normal_balance?: string | null
          parent_code?: string | null
          updated_at?: string | null
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
          id?: string
          is_active?: boolean | null
          is_header?: boolean | null
          jenis_layanan?: string | null
          kategori_layanan?: string | null
          level?: number
          normal_balance?: string | null
          parent_code?: string | null
          updated_at?: string | null
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
          payment_terms: string | null
          phone_number: string
          status: string
          tax_id: string | null
          updated_at: string | null
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
          payment_terms?: string | null
          phone_number: string
          status?: string
          tax_id?: string | null
          updated_at?: string | null
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
          payment_terms?: string | null
          phone_number?: string
          status?: string
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          upload_date: string | null
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
          upload_date?: string | null
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
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      general_ledger: {
        Row: {
          account_code: string
          account_type: string | null
          amount_signed: number | null
          created_at: string
          credit: number
          date: string
          debit: number
          description: string | null
          id: string
          journal_entry_id: string
          posting_date: string | null
          running_balance: number | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_type?: string | null
          amount_signed?: number | null
          created_at?: string
          credit?: number
          date: string
          debit?: number
          description?: string | null
          id?: string
          journal_entry_id: string
          posting_date?: string | null
          running_balance?: number | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_type?: string | null
          amount_signed?: number | null
          created_at?: string
          credit?: number
          date?: string
          debit?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
          posting_date?: string | null
          running_balance?: number | null
          updated_at?: string
        }
        Relationships: []
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
          date: string | null
          debit: number | null
          description: string | null
          entry_date: string | null
          entry_type: string | null
          id: string
          license_plate: string | null
          make: string | null
          model: string | null
          nama: string | null
          service_type: string | null
          source_id: string | null
          source_table: string | null
          stock_adjustment_id: string | null
          stock_movement_id: string | null
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
          date?: string | null
          debit?: number | null
          description?: string | null
          entry_date?: string | null
          entry_type?: string | null
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          nama?: string | null
          service_type?: string | null
          source_id?: string | null
          source_table?: string | null
          stock_adjustment_id?: string | null
          stock_movement_id?: string | null
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
          date?: string | null
          debit?: number | null
          description?: string | null
          entry_date?: string | null
          entry_type?: string | null
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          nama?: string | null
          service_type?: string | null
          source_id?: string | null
          source_table?: string | null
          stock_adjustment_id?: string | null
          stock_movement_id?: string | null
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
        ]
      }
      kas_transaksi: {
        Row: {
          account_name: string
          account_number: string
          created_at: string
          document_number: string
          id: string
          keterangan: string | null
          nominal: number
          nominal_signed: number | null
          payment_type: string
          service_category: string | null
          service_type: string | null
          tanggal: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          created_at?: string
          document_number?: string
          id?: string
          keterangan?: string | null
          nominal: number
          nominal_signed?: number | null
          payment_type: string
          service_category?: string | null
          service_type?: string | null
          tanggal: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          created_at?: string
          document_number?: string
          id?: string
          keterangan?: string | null
          nominal?: number
          nominal_signed?: number | null
          payment_type?: string
          service_category?: string | null
          service_type?: string | null
          tanggal?: string
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
      permohonan_dana: {
        Row: {
          created_at: string | null
          created_by: string | null
          departemen: string
          id: string
          jumlah: number
          keterangan: string | null
          nama_pemohon: string
          status: string | null
          tanggal_permohonan: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          departemen: string
          id?: string
          jumlah: number
          keterangan?: string | null
          nama_pemohon: string
          status?: string | null
          tanggal_permohonan: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          departemen?: string
          id?: string
          jumlah?: number
          keterangan?: string | null
          nama_pemohon?: string
          status?: string | null
          tanggal_permohonan?: string
          updated_at?: string | null
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
        }
        Relationships: [
          {
            foreignKeyName: "skema_PR_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          permissions: Json | null
          role_id: number
          role_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          permissions?: Json | null
          role_id: number
          role_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          permissions?: Json | null
          role_id?: number
          role_name?: string
        }
        Relationships: []
      }
      sales_transactions: {
        Row: {
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
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          payment_method: string
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
          total_amount: number
          transaction_date: string
          transaction_type: string
          unit_price: number
          updated_at: string | null
        }
        Insert: {
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
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          payment_method: string
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
          total_amount: number
          transaction_date?: string
          transaction_type: string
          unit_price: number
          updated_at?: string | null
        }
        Update: {
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
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          payment_method?: string
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
          total_amount?: number
          transaction_date?: string
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
            foreignKeyName: "sales_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
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
            referencedRelation: "vw_balance_sheet"
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
        ]
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
        }
        Relationships: []
      }
      stock: {
        Row: {
          airwaybills: string | null
          ceisa_document_date: string | null
          ceisa_document_number: string | null
          ceisa_document_type: string | null
          ceisa_notes: string | null
          ceisa_status: string | null
          coa_account_code: string | null
          coa_account_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          hs_category: string | null
          hs_code: string | null
          hs_description: string | null
          hs_sub_category: string | null
          id: string
          item_arrival_date: string
          item_id: string | null
          item_name: string
          item_quantity: number
          lots: string | null
          ppn_on_purchase: number | null
          ppn_on_sale: number | null
          ppn_status: string | null
          purchase_price: number
          purchase_price_after_ppn: number | null
          racks: string | null
          selling_price: number | null
          selling_price_after_ppn: number | null
          service_category: string | null
          service_type: string | null
          sku: string | null
          stock_code: string | null
          supplier_id: string | null
          supplier_name: string | null
          unit: string | null
          updated_at: string | null
          volume: string | null
          warehouses: string | null
          weight: number | null
          wms_notes: string | null
          wms_reference_number: string | null
          zones: string | null
        }
        Insert: {
          airwaybills?: string | null
          ceisa_document_date?: string | null
          ceisa_document_number?: string | null
          ceisa_document_type?: string | null
          ceisa_notes?: string | null
          ceisa_status?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hs_category?: string | null
          hs_code?: string | null
          hs_description?: string | null
          hs_sub_category?: string | null
          id?: string
          item_arrival_date: string
          item_id?: string | null
          item_name: string
          item_quantity: number
          lots?: string | null
          ppn_on_purchase?: number | null
          ppn_on_sale?: number | null
          ppn_status?: string | null
          purchase_price?: number
          purchase_price_after_ppn?: number | null
          racks?: string | null
          selling_price?: number | null
          selling_price_after_ppn?: number | null
          service_category?: string | null
          service_type?: string | null
          sku?: string | null
          stock_code?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          unit?: string | null
          updated_at?: string | null
          volume?: string | null
          warehouses?: string | null
          weight?: number | null
          wms_notes?: string | null
          wms_reference_number?: string | null
          zones?: string | null
        }
        Update: {
          airwaybills?: string | null
          ceisa_document_date?: string | null
          ceisa_document_number?: string | null
          ceisa_document_type?: string | null
          ceisa_notes?: string | null
          ceisa_status?: string | null
          coa_account_code?: string | null
          coa_account_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hs_category?: string | null
          hs_code?: string | null
          hs_description?: string | null
          hs_sub_category?: string | null
          id?: string
          item_arrival_date?: string
          item_id?: string | null
          item_name?: string
          item_quantity?: number
          lots?: string | null
          ppn_on_purchase?: number | null
          ppn_on_sale?: number | null
          ppn_status?: string | null
          purchase_price?: number
          purchase_price_after_ppn?: number | null
          racks?: string | null
          selling_price?: number | null
          selling_price_after_ppn?: number | null
          service_category?: string | null
          service_type?: string | null
          sku?: string | null
          stock_code?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          unit?: string | null
          updated_at?: string | null
          volume?: string | null
          warehouses?: string | null
          weight?: number | null
          wms_notes?: string | null
          wms_reference_number?: string | null
          zones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_stock_coa"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_stock_coa"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "vw_balance_sheet"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_stock_coa"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "vw_coa_accounts_by_service"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_stock_coa"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "vw_laba_rugi_detail"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_stock_coa"
            columns: ["coa_account_code"]
            isOneToOne: false
            referencedRelation: "vw_laporan_keuangan"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "fk_stock_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_suppliers"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
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
            foreignKeyName: "fk_adjustment_stock"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stock"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "fk_stock_adjustments_stock"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stock"
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
          payment_terms: string | null
          phone_number: string | null
          status: string | null
          supplier_code: string
          supplier_name: string
          tax_id: string | null
          updated_at: string | null
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
          payment_terms?: string | null
          phone_number?: string | null
          status?: string | null
          supplier_code?: string
          supplier_name: string
          tax_id?: string | null
          updated_at?: string | null
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
          payment_terms?: string | null
          phone_number?: string | null
          status?: string | null
          supplier_code?: string
          supplier_name?: string
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          amount: number
          coa_tax_code: string
          coa_tax_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          related_doc_no: string | null
          related_transaction_id: string | null
          tax_type: string
          transaction_date: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          coa_tax_code: string
          coa_tax_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          related_doc_no?: string | null
          related_transaction_id?: string | null
          tax_type: string
          transaction_date?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          coa_tax_code?: string
          coa_tax_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          related_doc_no?: string | null
          related_transaction_id?: string | null
          tax_type?: string
          transaction_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trial_balance: {
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
          id: string
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
          id?: string
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
          id?: string
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
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          phone_number: string | null
          role_id: number | null
          role_name: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          phone_number?: string | null
          role_id?: number | null
          role_name?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone_number?: string | null
          role_id?: number | null
          role_name?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
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
      vw_balance_sheet: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          balance: number | null
          credit_balance: number | null
          date: string | null
          debit_balance: number | null
        }
        Relationships: []
      }
      vw_cash_flow_report: {
        Row: {
          bulan: string | null
          saldo_kas_bersih: number | null
          tahun: number | null
          total_kas_keluar: number | null
          total_kas_masuk: number | null
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
      vw_dashboard_summary: {
        Row: {
          account_type: string | null
          total_balance: number | null
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
      vw_laporan_keuangan_all: {
        Row: {
          account_code: string | null
          account_name: string | null
          amount: number | null
          credit_total: number | null
          debit_total: number | null
          report_type: string | null
          section: string | null
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
    }
    Functions: {
      create_monthly_tax_reminders: { Args: never; Returns: undefined }
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
      generate_pr_code: { Args: never; Returns: string }
      generate_supplier_code: {
        Args: { pad_len?: number; prefix?: string }
        Returns: string
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
      get_hari_di_gudang: { Args: { tanggal_masuk: string }; Returns: number }
      get_hari_di_lini: { Args: { tanggal_masuk: string }; Returns: number }
      get_service_types_by_category: {
        Args: { p_category: string }
        Returns: {
          description: string
          revenue_account_code: string
          service_type: string
        }[]
      }
      kas_autonumber: { Args: never; Returns: string }
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
