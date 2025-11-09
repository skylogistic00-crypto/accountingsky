import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useToast } from "./ui/use-toast";
import { 
  Barcode, 
  Sparkles, 
  Loader2, 
  ArrowLeft, 
  Plus, 
  Package, 
  TrendingUp, 
  AlertCircle,
  Search,
  Filter,
  Box,
  DollarSign,
  Tag,
  Layers,
  Hash,
  ShoppingCart,
  Receipt,
  FileText,
  Eye
} from "lucide-react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

interface StockForm {
  item_name: string;
  category: string;
  warehouse_id: string;
  zone_id: string;
  rack_id: string;
  lot_id: string;
  jenis_barang: string;
  deskripsi: string;
  unit: string;
  barcode: string;
  supplier_name: string;
  nominal_barang: string;
  ppn_type: string;
  purchase_price: string;
  selling_price: string;
  ppn_beli: string;
  ppn_jual: string;
  hs_code: string;
  hs_code_description: string;
  tanggal_masuk_barang: string;
  batas_waktu_pengambilan: string;
  coa_account_code: string;
  coa_account_name: string;
  wms_reference_number: string;
  ceisa_document_number: string;
  ceisa_document_type: string;
  ceisa_document_date: string;
  ceisa_status: string;
  wms_notes: string;
  ceisa_notes: string;
}

interface HSCodeSuggestion {
  hs_code: string;
  description: string;
  category: string;
  sub_category: string;
  similarity: number;
}

export default function StockForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [filteredStockItems, setFilteredStockItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hsSuggestions, setHsSuggestions] = useState<HSCodeSuggestion[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState<StockForm>({
    item_name: "",
    category: "",
    warehouse_id: "",
    zone_id: "",
    rack_id: "",
    lot_id: "",
    jenis_barang: "",
    deskripsi: "",
    unit: "",
    barcode: "",
    supplier_name: "",
    nominal_barang: "0",
    ppn_type: "Non-PKP",
    purchase_price: "0",
    selling_price: "0",
    ppn_beli: "11",
    ppn_jual: "11",
    hs_code: "",
    hs_code_description: "",
    tanggal_masuk_barang: "",
    batas_waktu_pengambilan: "",
    coa_account_code: "",
    coa_account_name: "",
    wms_reference_number: "",
    ceisa_document_number: "",
    ceisa_document_type: "",
    ceisa_document_date: "",
    ceisa_status: "",
    wms_notes: "",
    ceisa_notes: "",
  });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [jenisBarangFilter, setJenisBarangFilter] = useState('ALL');
  const [jenisBarangOptions, setJenisBarangOptions] = useState<string[]>([]);
  const [deskripsiOptions, setDeskripsiOptions] = useState<string[]>([]);
  const [subKategoriOptions, setSubKategoriOptions] = useState<string[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [racks, setRacks] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [coaAccounts, setCoaAccounts] = useState<any[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);

  const stockCategories = [
    "Bahan baku",
    "Bahan dalam proses (WIP)",
    "Barang jadi",
    "Barang dagangan",
    "Paket / bundle",
    "Suku cadang",
    "MRO (perlengkapan operasional)",
    "Barang habis pakai",
    "Kemasan",
    "Makanan",
    "Minuman",
    "Unit disewakan",
    "Unit demo / pinjaman",
    "Retur",
    "Barang cacat / rusak",
    "Barang kedaluwarsa",
    "Barang dalam perjalanan",
    "Barang titipan (konsinyasi)",
    "Barang milik pihak ketiga"
  ];

  useEffect(() => {
    fetchSuppliers();
    fetchStockItems();
    fetchJenisBarangOptions();
    fetchWarehouses();
    fetchCoaAccounts();
    fetchServiceCategories();

    const channel = supabase
      .channel('stock-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, () => {
        fetchStockItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = stockItems;

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter((item) => 
        item.category && item.category.includes(categoryFilter)
      );
    }

    if (jenisBarangFilter !== 'ALL') {
      filtered = filtered.filter((item) => 
        item.jenis_barang === jenisBarangFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.jenis_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStockItems(filtered);
  }, [searchTerm, categoryFilter, jenisBarangFilter, stockItems]);

  const fetchStockItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock')
        .select(`
          *,
          warehouses:warehouse_id(name, code),
          zones:zone_id(name, code),
          racks:rack_id(name, code),
          lots:lot_id(lot_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStockItems(data || []);
      setFilteredStockItems(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, supplier_name")
        .eq("status", "ACTIVE")
        .order("supplier_name");

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchJenisBarangOptions = async () => {
    try {
      const { data, error } = await supabase
        .from("hs_codes")
        .select("category")
        .order("category");

      if (error) throw error;
      
      // Get unique categories
      const uniqueCategories = Array.from(new Set(data?.map(item => item.category).filter(Boolean))) as string[];
      setJenisBarangOptions(uniqueCategories);
    } catch (error) {
      console.error("Error fetching jenis barang options:", error);
    }
  };

  const fetchDeskripsiOptions = async (jenisBarang: string) => {
    if (!jenisBarang) {
      setDeskripsiOptions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("hs_codes")
        .select("description")
        .eq("category", jenisBarang)
        .order("description");

      if (error) throw error;
      
      // Get unique descriptions
      const uniqueDescriptions = Array.from(new Set(data?.map(item => item.description).filter(Boolean))) as string[];
      setDeskripsiOptions(uniqueDescriptions);
    } catch (error) {
      console.error("Error fetching deskripsi options:", error);
    }
  };

  const fetchSubKategoriOptions = async (deskripsi: string) => {
    if (!deskripsi) {
      setFormData(prev => ({ ...prev, sub_kategori: "" }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("hs_codes")
        .select("sub_category")
        .eq("description", deskripsi)
        .limit(1);

      if (error) throw error;
      
      // Auto-fill sub kategori with the first result
      if (data && data.length > 0 && data[0].sub_category) {
        setFormData(prev => ({ ...prev, sub_kategori: data[0].sub_category }));
      } else {
        setFormData(prev => ({ ...prev, sub_kategori: "" }));
      }
    } catch (error) {
      console.error("Error fetching sub kategori:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from("warehouses")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchZones = async (warehouseId: string) => {
    if (!warehouseId) {
      setZones([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("zones")
        .select("id, name, code")
        .eq("warehouse_id", warehouseId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error("Error fetching zones:", error);
    }
  };

  const fetchRacks = async (zoneId: string) => {
    if (!zoneId) {
      setRacks([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("racks")
        .select("id, name, code")
        .eq("zone_id", zoneId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setRacks(data || []);
    } catch (error) {
      console.error("Error fetching racks:", error);
    }
  };

  const fetchLots = async (rackId: string) => {
    if (!rackId) {
      setLots([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lots")
        .select("id, lot_number")
        .eq("rack_id", rackId)
        .eq("is_active", true)
        .order("lot_number");

      if (error) throw error;
      setLots(data || []);
    } catch (error) {
      console.error("Error fetching lots:", error);
    }
  };

  const fetchCoaAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("account_code, account_name, account_type")
        .eq("is_active", true)
        .eq("is_header", false)
        .eq("account_type", "Aset")
        .ilike("account_name", "%persediaan%")
        .order("account_code");

      if (error) throw error;
      setCoaAccounts(data || []);
    } catch (error) {
      console.error("Error fetching COA accounts:", error);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("coa_category_mapping")
        .select("service_category")
        .eq("is_active", true);

      if (error) throw error;
      
      const uniqueCategories = Array.from(new Set(data?.map(item => item.service_category).filter(Boolean))) as string[];
      setServiceCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching service categories:", error);
    }
  };

  const fetchServiceTypesByCategory = async (category: string) => {
    if (!category) {
      setCategoryMappings([]);
      return;
    }

    try {
      console.log('Fetching service types for category:', category);
      
      const { data, error } = await supabase
        .from('coa_category_mapping')
        .select('service_type, revenue_account_code, description')
        .eq('service_category', category)
        .eq('is_active', true);

      console.log('Service types data:', data);
      console.log('Service types error:', error);

      if (error) throw error;
      setCategoryMappings(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "Info",
          description: `Tidak ada jenis layanan untuk kategori "${category}"`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching service types:", error);
      toast({
        title: "Error",
        description: "Gagal memuat jenis layanan",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value, jenis_barang: "", coa_account_code: "", coa_account_name: "" });
    fetchServiceTypesByCategory(value);
  };

  const handleServiceTypeChange = async (value: string) => {
    setFormData({ ...formData, jenis_barang: value });
    
    // Auto-fetch COA mapping
    if (formData.category && value) {
      try {
        const { data, error } = await supabase
          .rpc('get_coa_mapping', { 
            p_service_category: formData.category, 
            p_service_type: value 
          });

        if (error) throw error;
        
        if (data && data.length > 0) {
          const mapping = data[0];
          // For inventory items, use asset_account_code, for services use revenue_account_code
          const accountCode = mapping.asset_account_code || mapping.revenue_account_code;
          const accountName = mapping.asset_account_name || mapping.revenue_account_name;
          
          setFormData(prev => ({ 
            ...prev, 
            coa_account_code: accountCode || "",
            coa_account_name: accountName || ""
          }));
          
          toast({
            title: "COA Auto-Selected",
            description: `${accountCode} - ${accountName}`,
          });
        }
      } catch (error) {
        console.error("Error fetching COA mapping:", error);
      }
    }
    
    // Also fetch deskripsi options
    fetchDeskripsiOptions(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      autoDetectHSCode(value);
    }, 800);
    
    setSearchTimeout(newTimeout);
  };

  const handleWarehouseChange = (value: string) => {
    setFormData({ 
      ...formData, 
      warehouse_id: value, 
      zone_id: "", 
      rack_id: "", 
      lot_id: "" 
    });
    fetchZones(value);
  };

  const handleZoneChange = (value: string) => {
    setFormData({ 
      ...formData, 
      zone_id: value, 
      rack_id: "", 
      lot_id: "" 
    });
    fetchRacks(value);
  };

  const handleRackChange = (value: string) => {
    setFormData({ 
      ...formData, 
      rack_id: value, 
      lot_id: "" 
    });
    fetchLots(value);
  };

  const handleBack = () => {
    if (isDialogOpen) {
      setIsDialogOpen(false);
    }
    navigate('/dashboard');
  };

  const autoDetectHSCode = async (jenisBarang: string) => {
    if (!jenisBarang || jenisBarang.length < 3) {
      setFormData(prev => ({ ...prev, hs_code: "", hs_code_description: "" }));
      return;
    }

    setAutoDetecting(true);
    try {
      const searchTerm = jenisBarang.toLowerCase();
      
      const { data, error } = await supabase
        .from("hs_codes")
        .select("hs_code, description, category, sub_category")
        .or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,sub_category.ilike.%${searchTerm}%`)
        .limit(1);

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const match = data[0];
        setFormData(prev => ({
          ...prev,
          hs_code: match.hs_code,
          hs_code_description: match.description,
        }));
        
        toast({
          title: "HS Code terdeteksi!",
          description: `${match.hs_code} - ${match.description}`,
        });
      } else {
        setFormData(prev => ({ ...prev, hs_code: "", hs_code_description: "" }));
      }
    } catch (error: any) {
      console.error('Auto-detect error:', error);
    } finally {
      setAutoDetecting(false);
    }
  };

  const handleJenisBarangChange = (value: string) => {
    setFormData({ ...formData, jenis_barang: value, deskripsi: "", sub_kategori: "" });
    
    // Fetch deskripsi options based on selected jenis barang
    fetchDeskripsiOptions(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      autoDetectHSCode(value);
    }, 800);
    
    setSearchTimeout(newTimeout);
  };

  const handleDeskripsiChange = (value: string) => {
    setFormData({ ...formData, deskripsi: value, sub_kategori: "" });
    
    // Fetch sub kategori options based on selected deskripsi
    fetchSubKategoriOptions(value);
  };

  const getHSCodeSuggestions = async () => {
    if (!formData.jenis_barang) {
      toast({
        title: "Info",
        description: "Masukkan jenis barang untuk mendapatkan saran HS Code",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);
    try {
      const searchText = `${formData.jenis_barang} ${formData.category || ''}`.trim();

      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
        'supabase-functions-generate-embedding',
        {
          body: { text: searchText },
        }
      );

      if (embeddingError) throw embeddingError;

      const { data: searchData, error: searchError } = await supabase.functions.invoke(
        'supabase-functions-search-hs-codes',
        {
          body: { 
            embedding: embeddingData.embedding,
            limit: 5 
          },
        }
      );

      if (searchError) throw searchError;

      setHsSuggestions(searchData.results || []);
      
      if (searchData.results && searchData.results.length > 0) {
        toast({
          title: "Saran HS Code ditemukan!",
          description: `${searchData.results.length} kode HS yang cocok`,
        });
      } else {
        toast({
          title: "Tidak ada hasil",
          description: "Coba ubah deskripsi barang",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('AI search error:', error);
      toast({
        title: "Error",
        description: "Gagal mendapatkan saran HS Code",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const selectHSCode = (suggestion: HSCodeSuggestion) => {
    setFormData({
      ...formData,
      hs_code: suggestion.hs_code,
      hs_code_description: suggestion.description,
    });
    toast({
      title: "HS Code dipilih",
      description: `${suggestion.hs_code} - ${suggestion.description}`,
    });
  };

  const formatToRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePriceWithPPN = (price: string, ppnRate: string) => {
    const basePrice = parseFloat(price) || 0;
    const ppn = parseFloat(ppnRate) || 0;
    return basePrice + (basePrice * ppn / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stockData: any = {
        item_name: formData.item_name,
        category: formData.category ? [formData.category] : null,
        warehouse_id: formData.warehouse_id || null,
        zone_id: formData.zone_id || null,
        rack_id: formData.rack_id || null,
        lot_id: formData.lot_id || null,
        jenis_barang: formData.jenis_barang,
        deskripsi: formData.deskripsi || null,
        description: formData.deskripsi || null,
        unit: formData.unit || null,
        barcode: formData.barcode || null,
        supplier_name: formData.supplier_name || null,
        nominal_barang: parseInt(formData.nominal_barang) || 0,
        ppn_type: formData.ppn_type || null,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        ppn_beli: formData.ppn_type === "PKP" ? parseFloat(formData.ppn_beli || "11") : null,
        ppn_jual: formData.ppn_type === "PKP" ? parseFloat(formData.ppn_jual || "11") : null,
        hs_code: formData.hs_code || null,
        hs_code_description: formData.hs_code_description || null,
        tanggal_masuk_barang: formData.tanggal_masuk_barang || null,
        batas_waktu_pengambilan: formData.batas_waktu_pengambilan || null,
        coa_account_code: formData.coa_account_code || null,
        coa_account_name: formData.coa_account_name || null,
        wms_reference_number: formData.wms_reference_number || null,
        ceisa_document_number: formData.ceisa_document_number || null,
        ceisa_document_type: formData.ceisa_document_type || null,
        ceisa_document_date: formData.ceisa_document_date || null,
        ceisa_status: formData.ceisa_status || null,
        wms_notes: formData.wms_notes || null,
        ceisa_notes: formData.ceisa_notes || null,
      };

      const { error } = await supabase.from("stock").insert(stockData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock item berhasil ditambahkan",
      });

      // Reset form
      setFormData({
        item_name: "",
        category: "",
        warehouse_id: "",
        zone_id: "",
        rack_id: "",
        lot_id: "",
        jenis_barang: "",
        deskripsi: "",
        unit: "",
        barcode: "",
        supplier_name: "",
        nominal_barang: "0",
        ppn_type: "Non-PKP",
        purchase_price: "0",
        selling_price: "0",
        ppn_beli: "11",
        ppn_jual: "11",
        hs_code: "",
        hs_code_description: "",
        tanggal_masuk_barang: "",
        batas_waktu_pengambilan: "",
        coa_account_code: "",
        coa_account_name: "",
        wms_reference_number: "",
        ceisa_document_number: "",
        ceisa_document_type: "",
        ceisa_document_date: "",
        ceisa_status: "",
        wms_notes: "",
        ceisa_notes: "",
      });
      setHsSuggestions([]);
      setIsDialogOpen(false);
      fetchStockItems();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDetailDialog = async (item: any) => {
    setSelectedItem(item);
    
    // Fetch warehouse, zone, rack, and lot details
    let locationDetails = {
      warehouse: null,
      zone: null,
      rack: null,
      lot: null
    };

    try {
      if (item.warehouse_id) {
        const { data: warehouseData } = await supabase
          .from("warehouses")
          .select("name, code")
          .eq("id", item.warehouse_id)
          .single();
        locationDetails.warehouse = warehouseData;
      }

      if (item.zone_id) {
        const { data: zoneData } = await supabase
          .from("zones")
          .select("name, code")
          .eq("id", item.zone_id)
          .single();
        locationDetails.zone = zoneData;
      }

      if (item.rack_id) {
        const { data: rackData } = await supabase
          .from("racks")
          .select("name, code")
          .eq("id", item.rack_id)
          .single();
        locationDetails.rack = rackData;
      }

      if (item.lot_id) {
        const { data: lotData } = await supabase
          .from("lots")
          .select("lot_number")
          .eq("id", item.lot_id)
          .single();
        locationDetails.lot = lotData;
      }

      setSelectedItem({ ...item, locationDetails });
    } catch (error) {
      console.error("Error fetching location details:", error);
      setSelectedItem(item);
    }

    setIsDetailDialogOpen(true);
  };

  const showPartNumber = formData.category === "Suku cadang";
  const showBrand = formData.category === "Barang habis pakai" || formData.category === "Unit disewakan";
  const showVehicleFields = formData.category === "Unit disewakan";
  const showPriceFields = !formData.category || 
    (formData.category !== "Suku cadang" && 
     formData.category !== "Barang habis pakai" && 
     formData.category !== "Unit disewakan");
  const isPKP = formData.ppn_type === "PKP";

  const summaryData = {
    total: stockItems.length,
    totalValue: stockItems.reduce((sum, item) => sum + (item.selling_price * item.nominal_barang || 0), 0),
    lowStock: stockItems.filter((item) => item.nominal_barang < 10).length,
    categories: new Set(stockItems.flatMap(item => item.category || [])).size,
  };

  const uniqueCategories = Array.from(new Set(stockItems.flatMap(item => item.category || []).filter(Boolean)));
  const uniqueJenisBarang = Array.from(new Set(stockItems.map(item => item.jenis_barang).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with gradient */}
      <div className="border-b bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Stock Management</h1>
                <p className="text-sm text-blue-100">Kelola inventori dan stok barang</p>
              </div>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-indigo-600 hover:bg-blue-50 shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambahkan Stock Baru</DialogTitle>
                <DialogDescription>
                  Isi detail stock item baru
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informasi Dasar</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item_name">Nama Barang *</Label>
                      <Input
                        id="item_name"
                        value={formData.item_name}
                        onChange={(e) =>
                          setFormData({ ...formData, item_name: e.target.value })
                        }
                        placeholder="Masukkan nama barang"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori Layanan/Produk *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleCategoryChange(value)}
                        required
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Pilih kategori layanan/produk" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Pilih kategori untuk auto-select COA
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jenis_barang">Jenis Layanan/Barang *</Label>
                      <div className="relative">
                        <Select
                          value={formData.jenis_barang}
                          onValueChange={(value) => handleServiceTypeChange(value)}
                          disabled={!formData.category}
                          required
                        >
                          <SelectTrigger id="jenis_barang">
                            <SelectValue placeholder={formData.category ? "Pilih jenis layanan/barang" : "Pilih kategori terlebih dahulu"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryMappings.map((mapping) => (
                              <SelectItem key={mapping.service_type} value={mapping.service_type}>
                                {mapping.service_type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {autoDetecting && (
                          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        COA akan terisi otomatis saat Anda memilih
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="deskripsi">Deskripsi</Label>
                      <Select
                        value={formData.deskripsi}
                        onValueChange={(value) => handleDeskripsiChange(value)}
                        disabled={!formData.jenis_barang}
                      >
                        <SelectTrigger id="deskripsi">
                          <SelectValue placeholder={formData.jenis_barang ? "Pilih deskripsi" : "Pilih jenis barang terlebih dahulu"} />
                        </SelectTrigger>
                        <SelectContent>
                          {deskripsiOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coa_account_code">Kode Akun COA *</Label>
                      <Select
                        value={formData.coa_account_code}
                        onValueChange={(value) => {
                          const selectedAccount = coaAccounts.find(acc => acc.account_code === value);
                          setFormData({ 
                            ...formData, 
                            coa_account_code: value,
                            coa_account_name: selectedAccount?.account_name || ""
                          });
                        }}
                        required
                      >
                        <SelectTrigger id="coa_account_code">
                          <SelectValue placeholder="Pilih akun COA" />
                        </SelectTrigger>
                        <SelectContent>
                          {coaAccounts.map((account) => (
                            <SelectItem key={account.account_code} value={account.account_code}>
                              {account.account_code} - {account.account_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Pilih akun dari Chart of Accounts untuk pencatatan
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coa_account_name">Nama Akun COA</Label>
                      <Input
                        id="coa_account_name"
                        value={formData.coa_account_name}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Nama akun akan terisi otomatis"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tanggal_masuk_barang">Tanggal Masuk Barang *</Label>
                      <Input
                        id="tanggal_masuk_barang"
                        type="date"
                        value={formData.tanggal_masuk_barang}
                        onChange={(e) =>
                          setFormData({ ...formData, tanggal_masuk_barang: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batas_waktu_pengambilan">Batas Waktu Pengambilan</Label>
                      <Input
                        id="batas_waktu_pengambilan"
                        type="date"
                        value={formData.batas_waktu_pengambilan}
                        onChange={(e) =>
                          setFormData({ ...formData, batas_waktu_pengambilan: e.target.value })
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Tanggal batas waktu untuk pengambilan barang
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Satuan *</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) =>
                          setFormData({ ...formData, unit: value })
                        }
                        required
                      >
                        <SelectTrigger id="unit">
                          <SelectValue placeholder="Pilih satuan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">Pcs (Pieces)</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="kg">Kg (Kilogram)</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="meter">Meter</SelectItem>
                          <SelectItem value="unit">Unit</SelectItem>
                          <SelectItem value="set">Set</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <div className="relative">
                        <Input
                          id="barcode"
                          value={formData.barcode}
                          onChange={(e) =>
                            setFormData({ ...formData, barcode: e.target.value })
                          }
                          placeholder="Scan atau masukkan barcode"
                          className="pr-10"
                        />
                        <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplier_name">Supplier *</Label>
                      <Select
                        value={formData.supplier_name}
                        onValueChange={(value) =>
                          setFormData({ ...formData, supplier_name: value })
                        }
                        required
                      >
                        <SelectTrigger id="supplier_name">
                          <SelectValue placeholder="Pilih supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem
                              key={supplier.id}
                              value={supplier.supplier_name}
                            >
                              {supplier.supplier_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Warehouse Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Lokasi Gudang</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warehouse_id">Nama Gudang *</Label>
                      <Select
                        value={formData.warehouse_id}
                        onValueChange={(value) => handleWarehouseChange(value)}
                        required
                      >
                        <SelectTrigger id="warehouse_id">
                          <SelectValue placeholder="Pilih gudang" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name} ({warehouse.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zone_id">Nama Zona *</Label>
                      <Select
                        value={formData.zone_id}
                        onValueChange={(value) => handleZoneChange(value)}
                        disabled={!formData.warehouse_id}
                        required
                      >
                        <SelectTrigger id="zone_id">
                          <SelectValue placeholder={formData.warehouse_id ? "Pilih zona" : "Pilih gudang terlebih dahulu"} />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.name} ({zone.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rack_id">Nama Rak *</Label>
                      <Select
                        value={formData.rack_id}
                        onValueChange={(value) => handleRackChange(value)}
                        disabled={!formData.zone_id}
                        required
                      >
                        <SelectTrigger id="rack_id">
                          <SelectValue placeholder={formData.zone_id ? "Pilih rak" : "Pilih zona terlebih dahulu"} />
                        </SelectTrigger>
                        <SelectContent>
                          {racks.map((rack) => (
                            <SelectItem key={rack.id} value={rack.id}>
                              {rack.name} ({rack.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lot_id">Nama Lot *</Label>
                      <Select
                        value={formData.lot_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, lot_id: value })
                        }
                        disabled={!formData.rack_id}
                        required
                      >
                        <SelectTrigger id="lot_id">
                          <SelectValue placeholder={formData.rack_id ? "Pilih lot" : "Pilih rak terlebih dahulu"} />
                        </SelectTrigger>
                        <SelectContent>
                          {lots.map((lot) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              {lot.lot_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* WMS/CEISA Section */}
                <div className="md:col-span-2 border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4">Informasi WMS/CEISA</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wms_reference_number">Nomor Referensi WMS</Label>
                      <Input
                        id="wms_reference_number"
                        value={formData.wms_reference_number}
                        onChange={(e) =>
                          setFormData({ ...formData, wms_reference_number: e.target.value })
                        }
                        placeholder="WMS-2024-XXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ceisa_document_number">Nomor Dokumen CEISA</Label>
                      <Input
                        id="ceisa_document_number"
                        value={formData.ceisa_document_number}
                        onChange={(e) =>
                          setFormData({ ...formData, ceisa_document_number: e.target.value })
                        }
                        placeholder="000000-XXXXXX-XXXXXXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ceisa_document_type">Jenis Dokumen CEISA</Label>
                      <Select
                        value={formData.ceisa_document_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, ceisa_document_type: value })
                        }
                      >
                        <SelectTrigger id="ceisa_document_type">
                          <SelectValue placeholder="Pilih jenis dokumen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BC 2.3">BC 2.3 - Pemberitahuan Impor Barang</SelectItem>
                          <SelectItem value="BC 4.0">BC 4.0 - Pemberitahuan Ekspor Barang</SelectItem>
                          <SelectItem value="BC 2.5">BC 2.5 - Pemberitahuan Impor Barang Khusus</SelectItem>
                          <SelectItem value="BC 3.0">BC 3.0 - Pemberitahuan Ekspor Barang Khusus</SelectItem>
                          <SelectItem value="BC 1.1">BC 1.1 - Pemberitahuan Pabean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ceisa_document_date">Tanggal Dokumen CEISA</Label>
                      <Input
                        id="ceisa_document_date"
                        type="date"
                        value={formData.ceisa_document_date}
                        onChange={(e) =>
                          setFormData({ ...formData, ceisa_document_date: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ceisa_status">Status CEISA</Label>
                      <Select
                        value={formData.ceisa_status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, ceisa_status: value })
                        }
                      >
                        <SelectTrigger id="ceisa_status">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="wms_notes">Catatan WMS</Label>
                      <Textarea
                        id="wms_notes"
                        value={formData.wms_notes}
                        onChange={(e) =>
                          setFormData({ ...formData, wms_notes: e.target.value })
                        }
                        placeholder="Catatan tambahan untuk WMS"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ceisa_notes">Catatan CEISA</Label>
                      <Textarea
                        id="ceisa_notes"
                        value={formData.ceisa_notes}
                        onChange={(e) =>
                          setFormData({ ...formData, ceisa_notes: e.target.value })
                        }
                        placeholder="Catatan tambahan untuk CEISA"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* HS Code Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-semibold">HS Code (Harmonized System)</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getHSCodeSuggestions}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Mencari...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Saran AI
                        </>
                      )}
                    </Button>
                  </div>

                  {(formData.hs_code || formData.hs_code_description) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Badge variant="default" className="mt-1">
                          {formData.hs_code}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-green-900 font-medium">Terdeteksi Otomatis</p>
                          <p className="text-sm text-green-700">{formData.hs_code_description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hsSuggestions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium text-blue-900">Saran HS Code dari AI:</p>
                      <div className="space-y-2">
                        {hsSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.hs_code}
                            className="bg-white p-3 rounded border cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => selectHSCode(suggestion)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Badge variant="default" className="mb-1">
                                  {suggestion.hs_code}
                                </Badge>
                                <p className="text-sm text-gray-700">{suggestion.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {suggestion.category} → {suggestion.sub_category}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {(suggestion.similarity * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inventory & Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Inventory & Harga</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nominal_barang">Jumlah Stok *</Label>
                      <Input
                        id="nominal_barang"
                        type="number"
                        min="0"
                        value={formData.nominal_barang}
                        onChange={(e) =>
                          setFormData({ ...formData, nominal_barang: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ppn_type">Status PPN *</Label>
                      <Select
                        value={formData.ppn_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, ppn_type: value })
                        }
                        required
                      >
                        <SelectTrigger id="ppn_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PKP">PKP</SelectItem>
                          <SelectItem value="Non-PKP">Non-PKP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchase_price">Harga Beli *</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.purchase_price}
                        onChange={(e) =>
                          setFormData({ ...formData, purchase_price: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selling_price">Harga Jual *</Label>
                      <Input
                        id="selling_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.selling_price}
                        onChange={(e) =>
                          setFormData({ ...formData, selling_price: e.target.value })
                        }
                        required
                      />
                    </div>

                    {formData.ppn_type === "PKP" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="ppn_beli">PPN Beli (%)</Label>
                          <Input
                            id="ppn_beli"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.ppn_beli}
                            onChange={(e) =>
                              setFormData({ ...formData, ppn_beli: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ppn_jual">PPN Jual (%)</Label>
                          <Input
                            id="ppn_jual"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.ppn_jual}
                            onChange={(e) =>
                              setFormData({ ...formData, ppn_jual: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Harga Beli Setelah PPN</Label>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-lg font-semibold text-blue-700">
                              {formatToRupiah(calculatePriceWithPPN(formData.purchase_price, formData.ppn_beli || "11"))}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Harga Jual Setelah PPN</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-lg font-semibold text-green-700">
                              {formatToRupiah(calculatePriceWithPPN(formData.selling_price, formData.ppn_jual || "11"))}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 grid md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-slate-600">
                        Total Harga Beli{formData.ppn_type === "PKP" ? " (Setelah PPN)" : ""}:
                      </span>
                      <p className="text-lg font-bold text-blue-600">
                        {formatToRupiah(
                          (formData.ppn_type === "PKP" 
                            ? calculatePriceWithPPN(formData.purchase_price, formData.ppn_beli || "11")
                            : parseFloat(formData.purchase_price)) *
                            parseInt(formData.nominal_barang || "0"),
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">
                        Total Harga Jual{formData.ppn_type === "PKP" ? " (Setelah PPN)" : ""}:
                      </span>
                      <p className="text-lg font-bold text-green-600">
                        {formatToRupiah(
                          (formData.ppn_type === "PKP" 
                            ? calculatePriceWithPPN(formData.selling_price, formData.ppn_jual || "11")
                            : parseFloat(formData.selling_price)) *
                            parseInt(formData.nominal_barang || "0"),
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Menyimpan...' : 'Simpan Stock Item'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards with icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-lg bg-purple-400/90 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/90">Total Value</CardDescription>
                <DollarSign className="h-8 w-8 text-white/80" />
              </div>
              <CardTitle className="text-4xl font-bold">
                {formatToRupiah(summaryData.totalValue).replace('Rp', '').trim().split(',')[0]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-white/90">
                <TrendingUp className="mr-2 h-4 w-4" />
                Nilai inventori
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-emerald-400/90 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/90">Total Items</CardDescription>
                <Box className="h-8 w-8 text-white/80" />
              </div>
              <CardTitle className="text-4xl font-bold">{summaryData.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-white/90">
                <Package className="mr-2 h-4 w-4" />
                Total stock items
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-pink-400/90 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/90">Low Stock</CardDescription>
                <AlertCircle className="h-8 w-8 text-white/80" />
              </div>
              <CardTitle className="text-4xl font-bold">{summaryData.lowStock}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-white/90">
                <AlertCircle className="mr-2 h-4 w-4" />
                Items &lt; 10 unit
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-blue-400/90 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/90">Categories</CardDescription>
                <Package className="h-8 w-8 text-white/80" />
              </div>
              <CardTitle className="text-4xl font-bold">{summaryData.categories}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-white/90">
                <Package className="mr-2 h-4 w-4" />
                Kategori berbeda
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Filter className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-lg">Filter & Pencarian</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Cari berdasarkan nama, item, atau barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px] border-slate-300 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Kategori</SelectItem>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={jenisBarangFilter} onValueChange={setJenisBarangFilter}>
                  <SelectTrigger className="w-[200px] border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Jenis Barang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Jenis</SelectItem>
                    {uniqueJenisBarang.map((jenis) => (
                      <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2">Memuat data stock...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-100 to-blue-100 hover:from-slate-100 hover:to-blue-100">
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-indigo-600" />
                        Nama Barang
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-600" />
                        Jenis Barang
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-purple-600" />
                        Kategori
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-orange-600" />
                        Unit
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-emerald-600" />
                        Jumlah Stock
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-slate-600" />
                        Harga Beli
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        Harga Beli + PPN
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-cyan-600" />
                        Harga Jual
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-green-600" />
                        Harga Jual + PPN
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-600" />
                        HS Code
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-teal-600" />
                        Tanggal Masuk
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4 text-indigo-600" />
                        Detail
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStockItems.map((item, index) => {
                    const purchasePrice = item.purchase_price || 0;
                    const sellingPrice = item.selling_price || 0;
                    const ppnBuyRate = item.ppn_type === "PKP" ? (item.ppn_beli || 11) : 0;
                    const ppnSellRate = item.ppn_type === "PKP" ? (item.ppn_jual || 11) : 0;
                    const purchasePriceWithPPN = purchasePrice + (purchasePrice * ppnBuyRate / 100);
                    const sellingPriceWithPPN = sellingPrice + (sellingPrice * ppnSellRate / 100);
                    
                    return (
                      <TableRow 
                        key={item.id}
                        className="hover:bg-indigo-50 transition-colors border-b border-slate-100"
                      >
                        <TableCell className="font-medium text-slate-900">
                          {item.item_name}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.jenis_barang}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.category && item.category.length > 0 
                            ? item.category[0]
                            : '-'}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.unit || '-'}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.nominal_barang}
                        </TableCell>
                        <TableCell className="text-slate-700 font-semibold">
                          {formatToRupiah(purchasePrice)}
                        </TableCell>
                        <TableCell className="text-blue-700 font-semibold">
                          {formatToRupiah(purchasePriceWithPPN)}
                        </TableCell>
                        <TableCell className="text-slate-700 font-semibold">
                          {formatToRupiah(sellingPrice)}
                        </TableCell>
                        <TableCell className="text-green-700 font-bold">
                          {formatToRupiah(sellingPriceWithPPN)}
                        </TableCell>
                        <TableCell className="text-slate-700 font-mono">
                          {item.hs_code || '-'}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.tanggal_masuk_barang 
                            ? new Date(item.tanggal_masuk_barang).toLocaleDateString('id-ID')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailDialog(item)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && filteredStockItems.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                <Package className="h-12 w-12 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium text-lg">Tidak ada stock ditemukan</p>
              <p className="text-sm text-slate-400 mt-1">Coba ubah filter atau tambahkan stock baru</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Detail Barang
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang item stock
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-indigo-900 mb-3">Informasi Dasar</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">Nama Barang</Label>
                    <p className="font-medium text-slate-900">{selectedItem.item_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Jenis Barang</Label>
                    <p className="font-medium text-slate-900">{selectedItem.jenis_barang}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Kategori</Label>
                    <p className="font-medium text-slate-900">
                      {selectedItem.category && selectedItem.category.length > 0 
                        ? selectedItem.category.join(", ") 
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Lokasi Gudang</Label>
                    <p className="font-medium text-slate-900">
                      {selectedItem.locationDetails ? (
                        <>
                          {selectedItem.locationDetails.warehouse && (
                            <span className="block">
                              Gudang: {selectedItem.locationDetails.warehouse.name} ({selectedItem.locationDetails.warehouse.code})
                            </span>
                          )}
                          {selectedItem.locationDetails.zone && (
                            <span className="block">
                              Zona: {selectedItem.locationDetails.zone.name} ({selectedItem.locationDetails.zone.code})
                            </span>
                          )}
                          {selectedItem.locationDetails.rack && (
                            <span className="block">
                              Rak: {selectedItem.locationDetails.rack.name} ({selectedItem.locationDetails.rack.code})
                            </span>
                          )}
                          {selectedItem.locationDetails.lot && (
                            <span className="block">
                              Lot: {selectedItem.locationDetails.lot.lot_number}
                            </span>
                          )}
                          {!selectedItem.locationDetails.warehouse && "-"}
                        </>
                      ) : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Barcode</Label>
                    <p className="font-medium text-slate-900 font-mono">{selectedItem.barcode || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Part Number</Label>
                    <p className="font-medium text-slate-900">{selectedItem.part_number || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Tanggal Masuk Barang</Label>
                    <p className="font-medium text-slate-900">
                      {selectedItem.tanggal_masuk_barang 
                        ? new Date(selectedItem.tanggal_masuk_barang).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock & Pricing */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-emerald-900 mb-3">Stock & Harga</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">Jumlah Stock</Label>
                    <p className="font-bold text-2xl text-emerald-700">
                      {selectedItem.nominal_barang} {selectedItem.unit}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Status PPN</Label>
                    <Badge className={selectedItem.ppn_type === "PKP" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                      {selectedItem.ppn_type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-slate-600">Harga Beli</Label>
                    <p className="font-semibold text-slate-900">{formatToRupiah(selectedItem.purchase_price)}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Harga Jual</Label>
                    <p className="font-semibold text-slate-900">{formatToRupiah(selectedItem.selling_price)}</p>
                  </div>
                  {selectedItem.ppn_type === "PKP" && (
                    <>
                      <div>
                        <Label className="text-slate-600">PPN Beli</Label>
                        <p className="font-medium text-slate-900">{selectedItem.ppn_beli}%</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">PPN Jual</Label>
                        <p className="font-medium text-slate-900">{selectedItem.ppn_jual}%</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Harga Beli + PPN</Label>
                        <p className="font-semibold text-blue-700">
                          {formatToRupiah(selectedItem.purchase_price + (selectedItem.purchase_price * (selectedItem.ppn_beli || 11) / 100))}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Harga Jual + PPN</Label>
                        <p className="font-semibold text-green-700">
                          {formatToRupiah(selectedItem.selling_price + (selectedItem.selling_price * (selectedItem.ppn_jual || 11) / 100))}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* HS Code & Origin */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-amber-900 mb-3">HS Code & Asal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">HS Code</Label>
                    <p className="font-mono font-semibold text-amber-700">{selectedItem.hs_code || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Negara Asal</Label>
                    <p className="font-medium text-slate-900">{selectedItem.country_of_origin || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-600">Deskripsi HS Code</Label>
                    <p className="font-medium text-slate-900">{selectedItem.hs_code_description || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-purple-900 mb-3">Detail Produk</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">Berat</Label>
                    <p className="font-medium text-slate-900">
                      {selectedItem.weight ? `${selectedItem.weight} ${selectedItem.weight_unit}` : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Dimensi</Label>
                    <p className="font-medium text-slate-900">{selectedItem.dimensions || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Volume</Label>
                    <p className="font-medium text-slate-900">{selectedItem.volume || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Brand</Label>
                    <p className="font-medium text-slate-900">
                      {selectedItem.brand && selectedItem.brand.length > 0 
                        ? selectedItem.brand.join(", ") 
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Model</Label>
                    <p className="font-medium text-slate-900">{selectedItem.model || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Supplier</Label>
                    <p className="font-medium text-slate-900">{selectedItem.supplier_name || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Sub Kategori</Label>
                    <p className="font-medium text-slate-900">{selectedItem.sub_kategori || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Deskripsi</Label>
                    <p className="font-medium text-slate-900">{selectedItem.deskripsi || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Dibuat pada</Label>
                    <p className="text-slate-700">
                      {selectedItem.created_at 
                        ? new Date(selectedItem.created_at).toLocaleString('id-ID')
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Terakhir diupdate</Label>
                    <p className="text-slate-700">
                      {selectedItem.updated_at 
                        ? new Date(selectedItem.updated_at).toLocaleString('id-ID')
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsDetailDialogOpen(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}