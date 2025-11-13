import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Package,
  ArrowLeft,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canEdit, canDelete } from "@/utils/roleAccess";

interface StockItem {
  id: string;
  item_name: string;
  service_category: string;
  service_type: string;
  description: string;
  coa_account_code: string;
  coa_account_name: string;
  item_arrival_date: string;
  unit: string;
  sku: string;
  weight: string;
  volume: string;
  supplier_name: string;
  warehouses: string;
  zones: string;
  racks: string;
  lots: string;
  wms_reference_number: string;
  ceisa_document_number: string;
  ceisa_document_type: string;
  ceisa_document_date: string;
  ceisa_status: string;
  wms_notes: string;
  ceisa_notes: string;
  item_quantity: number;
  ppn_status: string;
  purchase_price: number;
  selling_price: number;
  ppn_on_purchase: number;
  ppn_on_sale: number;
  purchase_price_after_ppn: number;
  selling_price_after_ppn: number;
  airwaybills: string;
  hs_code: string;
  hs_category: string;
  hs_sub_category: string;
  hs_description: string;
}

interface CategoryMapping {
  service_category: string;
  service_type: string;
  description: string;
}

interface COAAccount {
  account_code: string;
  account_name: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface Zone {
  id: string;
  name: string;
  code: string;
}

interface Rack {
  id: string;
  name: string;
  code: string;
}

interface Lot {
  id: string;
  lot_number: string;
}

interface HSCode {
  id: string;
  hs_code: string;
  description: string;
  category: string;
  sub_category: string;
}

const CEISA_DOCUMENT_TYPES = [
  "BC 2.0 – Pemberitahuan Impor Barang",
  "BC 2.3 – Pemberitahuan Impor Barang untuk ditimbun di Tempat Penimbunan Berikat",
  "BC 2.5 – Pemberitahuan Impor Barang dari Tempat Penimbunan Berikat",
  "BC 2.7 – Pemberitahuan Pengeluaran untuk diangkut dari Tempat Penimbunan Berikat ke Tempat Penimbunan Berikat lainnya",
  "BC 2.8 – Pemberitahuan Impor Barang dari Pusat Logistik Berikat",
  "BC 3.0 – Pemberitahuan Ekspor Barang",
  "BC 3.3 – Pemberitahuan Ekspor Barang melalui/dari Pusat Logistik Berikat",
  "BC 4.0 – Pemberitahuan Pemasukan Barang asal Tempat Lain dalam Daerah Pabean ke Tempat Penimbunan Berikat",
];

const CEISA_STATUS_OPTIONS = ["Approved", "Rejected", "Completed"];

export default function StockForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [coaAccounts, setCOAAccounts] = useState<COAAccount[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [hsCategories, setHsCategories] = useState<string[]>([]);
  const [hsSubCategories, setHsSubCategories] = useState<HSCode[]>([]);
  const [hsDescriptions, setHsDescriptions] = useState<HSCode[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { userRole } = useAuth();

  const [formData, setFormData] = useState({
    item_name: "",
    service_category: "",
    service_type: "",
    description: "",
    coa_account_code: "",
    coa_account_name: "",
    item_arrival_date: "",
    unit: "",
    sku: "",
    weight: "",
    volume: "",
    supplier_name: "",
    warehouses: "",
    zones: "",
    racks: "",
    lots: "",
    wms_reference_number: "",
    ceisa_document_number: "",
    ceisa_document_type: "",
    ceisa_document_date: "",
    ceisa_status: "",
    wms_notes: "",
    ceisa_notes: "",
    item_quantity: 0,
    ppn_status: "No",
    purchase_price: 0,
    selling_price: 0,
    ppn_on_purchase: 0,
    ppn_on_sale: 0,
    purchase_price_after_ppn: 0,
    selling_price_after_ppn: 0,
    airwaybills: "",
    hs_code: "",
    hs_category: "",
    hs_sub_category: "",
    hs_description: "",
  });

  useEffect(() => {
    fetchStockItems();
    fetchCategories();
    fetchCOAAccounts();
    fetchWarehouses();
    fetchZones();
    fetchRacks();
    fetchLots();
    fetchHSCategories();
  }, []);

  useEffect(() => {
    if (formData.service_category) {
      fetchServiceTypes(formData.service_category);
    }
  }, [formData.service_category]);

  useEffect(() => {
    if (formData.service_type) {
      fetchDescriptions(formData.service_type);
    }
  }, [formData.service_type]);

  useEffect(() => {
    if (formData.coa_account_code) {
      const account = coaAccounts.find(
        (acc) => acc.account_code === formData.coa_account_code,
      );
      if (account) {
        setFormData((prev) => ({
          ...prev,
          coa_account_name: account.account_name,
        }));
      }
    }
  }, [formData.coa_account_code, coaAccounts]);

  useEffect(() => {
    if (formData.ppn_status === "Yes") {
      calculatePPNPrices();
    }
  }, [
    formData.purchase_price,
    formData.selling_price,
    formData.ppn_on_purchase,
    formData.ppn_on_sale,
    formData.ppn_status,
  ]);

  useEffect(() => {
    if (formData.hs_category) {
      fetchHSSubCategories(formData.hs_category);
    }
  }, [formData.hs_category]);

  useEffect(() => {
    if (formData.hs_category && formData.hs_sub_category) {
      fetchHSDescriptions(formData.hs_category, formData.hs_sub_category);
    }
  }, [formData.hs_category, formData.hs_sub_category]);

  const calculatePPNPrices = () => {
    const purchaseAfterPPN =
      formData.purchase_price * (1 + formData.ppn_on_purchase / 100);
    const sellingAfterPPN =
      formData.selling_price * (1 + formData.ppn_on_sale / 100);

    setFormData((prev) => ({
      ...prev,
      purchase_price_after_ppn: purchaseAfterPPN,
      selling_price_after_ppn: sellingAfterPPN,
    }));
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const DetailDialog = ({ item }: { item: StockItem }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 text-indigo-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-indigo-600">
              Detail Stock: {item.item_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Nama Barang</p>
                  <p className="font-medium">{item.item_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">SKU</p>
                  <p className="font-medium font-mono text-indigo-600">
                    {item.sku || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    Kategori Layanan/Produk
                  </p>
                  <p className="font-medium">{item.service_category || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Jenis Layanan/Produk</p>
                  <p className="font-medium">{item.service_type || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Deskripsi</p>
                  <p className="font-medium">{item.description || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tanggal Masuk Barang</p>
                  <p className="font-medium">
                    {item.item_arrival_date
                      ? new Date(item.item_arrival_date).toLocaleDateString(
                          "id-ID",
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Satuan</p>
                  <p className="font-medium">{item.unit || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Jumlah</p>
                  <p className="font-medium">{item.item_quantity || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Berat</p>
                  <p className="font-medium">
                    {item.weight ? `${item.weight} kg` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Volume</p>
                  <p className="font-medium">
                    {item.volume ? `${item.volume} m³` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Nama Supplier</p>
                  <p className="font-medium">{item.supplier_name || "-"}</p>
                </div>
              </div>
            </div>

            {/* COA Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                Informasi COA
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Kode Akun COA</p>
                  <p className="font-medium">{item.coa_account_code || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Nama Akun COA</p>
                  <p className="font-medium">{item.coa_account_name || "-"}</p>
                </div>
              </div>
            </div>

            {/* AWB & HS Code Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                Informasi AWB & HS Code
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">AWB (Air Waybill)</p>
                  <p className="font-medium">{item.airwaybills || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">HS Code</p>
                  <p className="font-medium font-mono text-indigo-600">
                    {item.hs_code || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">HS Category</p>
                  <p className="font-medium">{item.hs_category || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">HS Sub Category</p>
                  <p className="font-medium">{item.hs_sub_category || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">HS Description</p>
                  <p className="font-medium">{item.hs_description || "-"}</p>
                </div>
              </div>
            </div>

            {/* Warehouse Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                Informasi Gudang
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Gudang</p>
                  <p className="font-medium">{item.warehouses || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Zona</p>
                  <p className="font-medium">{item.zones || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Rak</p>
                  <p className="font-medium">{item.racks || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lot</p>
                  <p className="font-medium">{item.lots || "-"}</p>
                </div>
              </div>
            </div>

            {/* WMS & CEISA Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                Informasi WMS & CEISA
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Nomor Referensi WMS</p>
                  <p className="font-medium">
                    {item.wms_reference_number || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    Nomor Referensi CEISA
                  </p>
                  <p className="font-medium">
                    {item.ceisa_document_number || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Jenis Dokumen CEISA</p>
                  <p className="font-medium">
                    {item.ceisa_document_type || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    Tanggal Dokumen CEISA
                  </p>
                  <p className="font-medium">
                    {item.ceisa_document_date
                      ? new Date(item.ceisa_document_date).toLocaleDateString(
                          "id-ID",
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status CEISA</p>
                  <p className="font-medium">{item.ceisa_status || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Catatan WMS</p>
                  <p className="font-medium">{item.wms_notes || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Catatan CEISA</p>
                  <p className="font-medium">{item.ceisa_notes || "-"}</p>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                Informasi Harga
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Status PPN</p>
                  <p className="font-medium">{item.ppn_status || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Harga Beli</p>
                  <p className="font-medium text-green-600">
                    {formatRupiah(item.purchase_price || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Harga Jual</p>
                  <p className="font-medium text-blue-600">
                    {formatRupiah(item.selling_price || 0)}
                  </p>
                </div>
                {item.ppn_status === "Yes" && (
                  <>
                    <div>
                      <p className="text-sm text-slate-500">PPN Beli (%)</p>
                      <p className="font-medium">
                        {item.ppn_on_purchase || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">PPN Jual (%)</p>
                      <p className="font-medium">{item.ppn_on_sale || 0}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        Harga Beli Setelah PPN
                      </p>
                      <p className="font-medium text-green-600">
                        {formatRupiah(item.purchase_price_after_ppn || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        Harga Jual Setelah PPN
                      </p>
                      <p className="font-medium text-blue-600">
                        {formatRupiah(item.selling_price_after_ppn || 0)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const fetchStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from("stock")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("account_name")
        .eq("is_active", true)
        .eq("level", 2)
        .order("account_code");

      if (error) throw error;

      const uniqueCategories = [
        ...new Set(data?.map((item) => item.account_name) || []),
      ];
      setCategories(uniqueCategories);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchServiceTypes = async (category: string) => {
    try {
      // Find the parent account code for the selected category
      const { data: parentData, error: parentError } = await supabase
        .from("chart_of_accounts")
        .select("account_code")
        .eq("account_name", category)
        .eq("level", 2)
        .single();

      if (parentError) throw parentError;

      // Get child accounts (level 3) that belong to this parent
      const parentCode = parentData.account_code.split("-")[0];
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("account_name")
        .eq("is_active", true)
        .eq("level", 3)
        .like("account_code", `${parentCode}-%`)
        .order("account_code");

      if (error) throw error;

      const types = data?.map((item) => item.account_name) || [];
      setServiceTypes(types);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchDescriptions = async (serviceType: string) => {
    try {
      const { data, error } = await supabase
        .from("vw_coa_accounts_by_service")
        .select("description, account_name, account_code")
        .eq("kategori_layanan", formData.service_category)
        .eq("jenis_layanan", serviceType);

      if (error) throw error;

      const descs =
        data?.map((item) => item.description || item.account_name) || [];
      setDescriptions(descs);

      // Auto-fill description if only one result
      if (data && data.length === 1) {
        const autoFillValue = data[0].description || data[0].account_name;
        setFormData((prev) => ({
          ...prev,
          description: autoFillValue,
          coa_account_code: data[0].account_code,
          coa_account_name: data[0].account_name,
        }));
      } else {
        // Reset description if more than one option
        setFormData((prev) => ({
          ...prev,
          description: "",
          coa_account_code: "",
          coa_account_name: "",
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCOAAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("account_code, account_name")
        .eq("is_active", true)
        .order("account_code");

      if (error) throw error;
      setCOAAccounts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from("zones")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setZones(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchRacks = async () => {
    try {
      const { data, error } = await supabase
        .from("racks")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setRacks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchLots = async () => {
    try {
      const { data, error } = await supabase
        .from("lots")
        .select("id, lot_number")
        .eq("is_active", true)
        .order("lot_number");

      if (error) throw error;
      setLots(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchHSCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("hs_codes")
        .select("category")
        .eq("is_active", true)
        .order("category");

      if (error) throw error;

      const uniqueCategories = [
        ...new Set(data?.map((item) => item.category).filter(Boolean) || []),
      ];
      setHsCategories(uniqueCategories);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchHSSubCategories = async (category: string) => {
    try {
      const { data, error } = await supabase
        .from("hs_codes")
        .select("id, hs_code, sub_category, description")
        .eq("category", category)
        .eq("is_active", true)
        .order("sub_category");

      if (error) throw error;
      setHsSubCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchHSDescriptions = async (category: string, subCategory: string) => {
    try {
      const { data, error } = await supabase
        .from("hs_codes")
        .select("id, hs_code, description")
        .eq("category", category)
        .eq("sub_category", subCategory)
        .eq("is_active", true)
        .order("hs_code");

      if (error) throw error;
      setHsDescriptions(data || []);

      // Auto-fill hs_description if only one result
      if (data && data.length === 1) {
        setFormData((prev) => ({
          ...prev,
          hs_description: data[0].description,
          hs_code: data[0].hs_code,
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("stock")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "✅ Berhasil",
          description: "Data stock berhasil diupdate",
        });
      } else {
        const { error } = await supabase.from("stock").insert([formData]);

        if (error) throw error;

        toast({
          title: "✅ Berhasil",
          description: "Data stock berhasil ditambahkan",
        });
      }

      resetForm();
      fetchStockItems();
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("stock")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData(data);
      setEditingId(id);
      setShowForm(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const { error } = await supabase.from("stock").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "✅ Berhasil",
        description: "Data stock berhasil dihapus",
      });

      fetchStockItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: "",
      service_category: "",
      service_type: "",
      description: "",
      coa_account_code: "",
      coa_account_name: "",
      item_arrival_date: "",
      unit: "",
      sku: "",
      weight: "",
      volume: "",
      supplier_name: "",
      warehouses: "",
      zones: "",
      racks: "",
      lots: "",
      wms_reference_number: "",
      ceisa_document_number: "",
      ceisa_document_type: "",
      ceisa_document_date: "",
      ceisa_status: "",
      wms_notes: "",
      ceisa_notes: "",
      item_quantity: 0,
      ppn_status: "No",
      purchase_price: 0,
      selling_price: 0,
      ppn_on_purchase: 0,
      ppn_on_sale: 0,
      purchase_price_after_ppn: 0,
      selling_price_after_ppn: 0,
      airwaybills: "",
      hs_code: "",
      hs_category: "",
      hs_sub_category: "",
      hs_description: "",
    });
    setEditingId(null);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const filteredItems = items.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.warehouses &&
        item.warehouses.toLowerCase().includes(searchTerm.toLowerCase())),
  );

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
                <h1 className="text-2xl font-bold text-white">
                  Stock Management
                </h1>
                <p className="text-sm text-blue-100">
                  Kelola data stock barang Anda
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-white text-indigo-600 hover:bg-blue-50 shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Tutup Form" : "Tambah Stock"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Form Input */}
        {showForm && (
          <Card className="mb-6 bg-white shadow-lg rounded-xl border border-slate-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50">
              <CardTitle className="text-xl">
                {editingId ? "✏️ Edit Stock" : "+ Tambah Stock"}
              </CardTitle>
              <CardDescription>
                {editingId
                  ? "Perbarui informasi stock"
                  : "Tambahkan stock baru ke sistem"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                    Informasi Dasar
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nama Barang *</Label>
                      <Input
                        value={formData.item_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            item_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>Kategori Layanan/Produk *</Label>
                      <Select
                        value={formData.service_category}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            service_category: value,
                            service_type: "",
                            description: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Jenis Layanan/Produk *</Label>
                      <Select
                        value={formData.service_type}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            service_type: value,
                            description: "",
                          })
                        }
                        disabled={!formData.service_category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Deskripsi</Label>
                      <Select
                        value={formData.description}
                        onValueChange={(value) =>
                          setFormData({ ...formData, description: value })
                        }
                        disabled={!formData.service_type}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih deskripsi" />
                        </SelectTrigger>
                        <SelectContent>
                          {descriptions.map((desc, idx) => (
                            <SelectItem key={idx} value={desc}>
                              {desc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Kode Akun COA *</Label>
                      <Select
                        value={formData.coa_account_code}
                        onValueChange={(value) =>
                          setFormData({ ...formData, coa_account_code: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kode akun" />
                        </SelectTrigger>
                        <SelectContent>
                          {coaAccounts.map((acc) => (
                            <SelectItem
                              key={acc.account_code}
                              value={acc.account_code}
                            >
                              {acc.account_code} - {acc.account_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Nama Akun COA</Label>
                      <Input
                        value={formData.coa_account_name}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>

                    <div>
                      <Label>Tanggal Masuk Barang *</Label>
                      <Input
                        type="date"
                        value={formData.item_arrival_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            item_arrival_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>SKU *</Label>
                      <Input
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>Satuan *</Label>
                      <Input
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        placeholder="pcs, kg, box, dll"
                        required
                      />
                    </div>

                    <div>
                      <Label>Berat (kg)</Label>
                      <Input
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Volume (m³)</Label>
                      <Input
                        value={formData.volume}
                        onChange={(e) =>
                          setFormData({ ...formData, volume: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Nama Supplier</Label>
                      <Input
                        value={formData.supplier_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supplier_name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* AWB & HS Code Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                    Informasi AWB & HS Code
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>AWB (Air Waybill)</Label>
                      <Input
                        value={formData.airwaybills}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            airwaybills: e.target.value,
                          })
                        }
                        placeholder="Nomor AWB"
                      />
                    </div>

                    <div>
                      <Label>HS Category</Label>
                      <Select
                        value={formData.hs_category}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            hs_category: value,
                            hs_sub_category: "",
                            hs_description: "",
                            hs_code: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori HS" />
                        </SelectTrigger>
                        <SelectContent>
                          {hsCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>HS Sub Category</Label>
                      <Select
                        value={formData.hs_sub_category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, hs_sub_category: value })
                        }
                        disabled={!formData.hs_category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sub kategori HS" />
                        </SelectTrigger>
                        <SelectContent>
                          {hsSubCategories.map((sub) => (
                            <SelectItem
                              key={sub.id}
                              value={sub.sub_category || ""}
                            >
                              {sub.sub_category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>HS Description</Label>
                      <Select
                        value={formData.hs_description}
                        onValueChange={(value) => {
                          const selectedHS = hsDescriptions.find(
                            (hs) => hs.description === value,
                          );
                          setFormData({
                            ...formData,
                            hs_description: value,
                            hs_code: selectedHS?.hs_code || "",
                          });
                        }}
                        disabled={!formData.hs_sub_category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih deskripsi HS" />
                        </SelectTrigger>
                        <SelectContent>
                          {hsDescriptions.map((desc) => (
                            <SelectItem key={desc.id} value={desc.description}>
                              {desc.hs_code} - {desc.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>HS Code</Label>
                      <Input
                        value={formData.hs_code}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Warehouse Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                    Informasi Gudang
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Gudang</Label>
                      <Select
                        value={formData.warehouses}
                        onValueChange={(value) =>
                          setFormData({ ...formData, warehouses: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gudang" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((wh) => (
                            <SelectItem key={wh.id} value={wh.name}>
                              {wh.code} - {wh.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Zona</Label>
                      <Select
                        value={formData.zones}
                        onValueChange={(value) =>
                          setFormData({ ...formData, zones: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih zona" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.name}>
                              {zone.code} - {zone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Rak</Label>
                      <Select
                        value={formData.racks}
                        onValueChange={(value) =>
                          setFormData({ ...formData, racks: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih rak" />
                        </SelectTrigger>
                        <SelectContent>
                          {racks.map((rack) => (
                            <SelectItem key={rack.id} value={rack.name}>
                              {rack.code} - {rack.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Lot</Label>
                      <Select
                        value={formData.lots}
                        onValueChange={(value) =>
                          setFormData({ ...formData, lots: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih lot" />
                        </SelectTrigger>
                        <SelectContent>
                          {lots.map((lot) => (
                            <SelectItem key={lot.id} value={lot.lot_number}>
                              {lot.lot_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* WMS & CEISA Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                    Informasi WMS & CEISA
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nomor Referensi WMS</Label>
                      <Input
                        value={formData.wms_reference_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            wms_reference_number: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Nomor Referensi CEISA</Label>
                      <Input
                        value={formData.ceisa_document_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ceisa_document_number: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Jenis Dokumen CEISA</Label>
                      <Select
                        value={formData.ceisa_document_type}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            ceisa_document_type: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis dokumen" />
                        </SelectTrigger>
                        <SelectContent>
                          {CEISA_DOCUMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Tanggal Dokumen CEISA</Label>
                      <Input
                        type="date"
                        value={formData.ceisa_document_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ceisa_document_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Status CEISA</Label>
                      <Select
                        value={formData.ceisa_status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, ceisa_status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          {CEISA_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Jumlah *</Label>
                      <Input
                        type="number"
                        value={formData.item_quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            item_quantity: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Catatan WMS</Label>
                      <Textarea
                        value={formData.wms_notes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            wms_notes: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Catatan CEISA</Label>
                      <Textarea
                        value={formData.ceisa_notes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ceisa_notes: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                    Informasi Harga
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Status PPN *</Label>
                      <Select
                        value={formData.ppn_status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, ppn_status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Harga Beli *</Label>
                      <Input
                        type="number"
                        value={formData.purchase_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchase_price: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {formatRupiah(formData.purchase_price)}
                      </p>
                    </div>

                    <div>
                      <Label>Harga Jual *</Label>
                      <Input
                        type="number"
                        value={formData.selling_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            selling_price: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {formatRupiah(formData.selling_price)}
                      </p>
                    </div>

                    {formData.ppn_status === "Yes" && (
                      <>
                        <div>
                          <Label>PPN Beli (%)</Label>
                          <Input
                            type="number"
                            value={formData.ppn_on_purchase}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ppn_on_purchase: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>PPN Jual (%)</Label>
                          <Input
                            type="number"
                            value={formData.ppn_on_sale}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ppn_on_sale: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>Harga Beli Setelah PPN</Label>
                          <Input
                            type="number"
                            value={formData.purchase_price_after_ppn}
                            disabled
                            className="bg-slate-50"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            {formatRupiah(formData.purchase_price_after_ppn)}
                          </p>
                        </div>

                        <div>
                          <Label>Harga Jual Setelah PPN</Label>
                          <Input
                            type="number"
                            value={formData.selling_price_after_ppn}
                            disabled
                            className="bg-slate-50"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            {formatRupiah(formData.selling_price_after_ppn)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <Plus className="mr-2" />
                    )}
                    {editingId ? "Update Stock" : "Tambah Stock"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table Data Stock */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Filter className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-lg">Data Stock</span>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari berdasarkan nama barang, SKU, atau gudang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-100 to-blue-100 hover:from-slate-100 hover:to-blue-100">
                  <TableHead className="font-semibold text-slate-700">
                    Nama Barang
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    SKU
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Tanggal Masuk
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Gudang
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Jumlah
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Satuan
                  </TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-slate-500 py-12"
                    >
                      <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                        <Package className="h-12 w-12 text-slate-300" />
                      </div>
                      <p className="font-medium text-lg">
                        Belum ada data stock
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Tambahkan stock baru untuk memulai
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      } hover:bg-indigo-50 transition-colors border-b border-slate-100`}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {item.item_name}
                      </TableCell>
                      <TableCell className="font-mono text-indigo-600">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {item.item_arrival_date
                          ? new Date(item.item_arrival_date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {item.warehouses || "-"}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {item.item_quantity}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {item.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <DetailDialog item={item} />
                          {canEdit(userRole) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item.id)}
                              >
                                <Pencil className="w-4 h-4 text-blue-600" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
