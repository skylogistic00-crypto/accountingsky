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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
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
} from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Upload, X, Plus } from "lucide-react";
import { format } from "date-fns";

interface PurchaseRequestFormProps {
  onSuccess?: () => void;
}

interface Supplier {
  id: string;
  supplier_name: string;
  phone_number?: string;
  address?: string;
  email?: string;
}

interface StockItem {
  id: string;
  item_name: string;
  hs_category?: string;
  supplier_name?: string;
  unit?: string;
  purchase_price?: number;
  selling_price?: number;
  ppn_on_purchase?: number;
}

interface PurchaseRequestForm {
  request_date: Date;
  name: string;
  item_name: string;
  supplier_id: string;
  qty: string;
  unit: string;
  unit_price: string;
  shipping_cost: string;
  tax: string;
  barcode: string;
  notes: string;
  email: string;
  status: string;
  hs_category: string;
}

export default function PurchaseRequestForm({
  onSuccess,
}: PurchaseRequestFormProps = {}) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(
    null,
  );
  const [openItemCombobox, setOpenItemCombobox] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    supplier_name: "",
    contact_person: "",
    phone_number: "",
    email: "",
    city: "",
    country: "",
    is_pkp: "",
    tax_id: "",
    bank_name: "",
    bank_account_holder: "",
    payment_terms: "",
    category: "",
    currency: "IDR",
    status: "ACTIVE",
    address: "",
  });
  const [formData, setFormData] = useState<PurchaseRequestForm>({
    request_date: new Date(),
    name: "",
    item_name: "",
    supplier_id: "",
    qty: "1",
    unit: "",
    unit_price: "0",
    shipping_cost: "0",
    tax: "0",
    barcode: "",
    notes: "",
    email: user?.email || "",
    status: "PENDING",
    hs_category: "",
  });

  useEffect(() => {
    if (userProfile?.full_name) {
      setFormData((prev) => ({ ...prev, name: userProfile.full_name }));
    }
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
    fetchSuppliers();
    fetchStockItems();
  }, [userProfile, user]);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, supplier_name, phone_number, address, email")
        .eq("status", "ACTIVE")
        .order("supplier_name");

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchStockItems = async () => {
    try {
      console.log("=== Fetching Stock Items ===");
      const { data, error } = await supabase
        .from("stock")
        .select(
          "id, item_name, hs_category, supplier_name, unit, purchase_price, selling_price, ppn_on_purchase",
        )
        .order("item_name");

      if (error) {
        console.error("Error fetching stock items:", error);
        throw error;
      }

      console.log("Stock items fetched:", data?.length || 0, "items");
      console.log("Sample stock item:", data?.[0]);
      setStockItems(data || []);
    } catch (error) {
      console.error("Error fetching stock items:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data stock",
        variant: "destructive",
      });
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    if (supplierId === "add_new") {
      setIsSupplierDialogOpen(true);
      return;
    }

    setFormData({ ...formData, supplier_id: supplierId });

    const supplier = suppliers.find((s) => s.id === supplierId);
    setSelectedSupplier(supplier || null);
  };

  const handleItemSelect = (item: StockItem) => {
    console.log("=== Item Selected ===");
    console.log("Selected item:", item);

    setSelectedStockItem(item);

    // Use ppn_on_purchase directly as tax value
    const taxValue = item.ppn_on_purchase?.toString() || "0";

    setFormData({
      ...formData,
      item_name: item.item_name,
      hs_category: item.hs_category || "",
      unit: item.unit || "",
      unit_price: item.purchase_price?.toString() || "0",
      tax: taxValue,
    });

    console.log("Form data updated with:", {
      item_name: item.item_name,
      hs_category: item.hs_category,
      supplier_name: item.supplier_name,
      unit: item.unit,
      unit_price: item.purchase_price,
      tax: taxValue,
      ppn_on_purchase: item.ppn_on_purchase,
    });

    // Find supplier by name if available
    if (item.supplier_name) {
      const supplier = suppliers.find(
        (s) => s.supplier_name === item.supplier_name,
      );
      console.log("Setting supplier by name:", supplier);
      if (supplier) {
        setSelectedSupplier(supplier);
        setFormData((prev) => ({ ...prev, supplier_id: supplier.id }));
      }
    }

    setOpenItemCombobox(false);
  };

  const handleAddNewSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          supplier_name: newSupplierData.supplier_name,
          contact_person: newSupplierData.contact_person,
          phone_number: newSupplierData.phone_number,
          email: newSupplierData.email,
          city: newSupplierData.city,
          country: newSupplierData.country,
          is_pkp: newSupplierData.is_pkp,
          tax_id: newSupplierData.tax_id,
          bank_name: newSupplierData.bank_name,
          bank_account_holder: newSupplierData.bank_account_holder,
          payment_terms: newSupplierData.payment_terms,
          category: newSupplierData.category,
          currency: newSupplierData.currency,
          status: newSupplierData.status,
          address: newSupplierData.address,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Supplier ${data.supplier_name} berhasil ditambahkan`,
      });

      // Reset form
      setNewSupplierData({
        supplier_name: "",
        contact_person: "",
        phone_number: "",
        email: "",
        city: "",
        country: "",
        is_pkp: "",
        tax_id: "",
        bank_name: "",
        bank_account_holder: "",
        payment_terms: "",
        category: "",
        currency: "IDR",
        status: "ACTIVE",
        address: "",
      });

      // Refresh suppliers list
      await fetchSuppliers();

      // Auto-select the new supplier
      setFormData({ ...formData, supplier_id: data.id });
      setSelectedSupplier(data);

      setIsSupplierDialogOpen(false);
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `purchase-items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("purchase-items")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("purchase-items").getPublicUrl(filePath);

      setPhotoUrl(publicUrl);

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl(null);
  };

  const calculateTotalAmount = () => {
    const qty = parseFloat(formData.qty) || 0;
    const unitPrice = parseFloat(formData.unit_price) || 0;
    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    const tax = parseFloat(formData.tax) || 0;

    return qty * unitPrice + shippingCost + tax;
  };

  const formatToRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate request code
      const requestCode = `PR-${Date.now()}`;

      // Pastikan name tidak kosong
      const requesterName =
        formData.name ||
        userProfile?.full_name ||
        user?.email?.split("@")[0] ||
        "Unknown User";

      const { error } = await supabase.from("purchase_requests").insert({
        request_code: requestCode,
        request_date: format(formData.request_date, "yyyy-MM-dd"),
        name: requesterName,
        item_name: formData.item_name,
        quantity: parseInt(formData.qty),
        unit_price: parseFloat(formData.unit_price),
        shipping_cost: parseFloat(formData.shipping_cost) || 0,
        total_amount: calculateTotalAmount(),
        requester_id: user?.id,
        status: "PENDING",
        email: formData.email || null,
        tax: parseFloat(formData.tax) || 0,
        barcode: formData.barcode || null,
        notes: formData.notes || null,
        supplier_id: formData.supplier_id || null,
        foto_barang: photoUrl || null,
        item_description: formData.item_name,
        requester_name: requesterName,
        unit: formData.unit || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase request created successfully",
      });

      // Reset form
      setFormData({
        request_date: new Date(),
        name: userProfile?.full_name || "",
        item_name: "",
        supplier_id: "",
        qty: "1",
        unit: "",
        unit_price: "0",
        shipping_cost: "0",
        tax: "0",
        barcode: "",
        notes: "",
        email: user?.email || "",
        status: "PENDING",
        hs_category: "",
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoUrl(null);
      setSelectedSupplier(null);
      setSelectedStockItem(null);

      if (onSuccess) {
        onSuccess();
      }
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

  const totalAmount = calculateTotalAmount();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create Purchase Request</CardTitle>
          <CardDescription>
            Fill in the details for your purchase request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="request_date">Request Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.request_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.request_date}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, request_date: date })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name *</Label>
              <Popover
                open={openItemCombobox}
                onOpenChange={setOpenItemCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openItemCombobox}
                    className="w-full justify-between"
                  >
                    {formData.item_name || "Select or type item name..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search or type new item name..."
                      value={formData.item_name}
                      onValueChange={(value) =>
                        setFormData({ ...formData, item_name: value })
                      }
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="p-4 space-y-2">
                          <p className="text-sm text-slate-600">
                            Item "{formData.item_name}" tidak ditemukan di list.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              // Keep the typed item name and close the combobox
                              setOpenItemCombobox(false);
                              toast({
                                title: "Item Baru",
                                description: `Item "${formData.item_name}" akan ditambahkan sebagai item baru`,
                              });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Gunakan "{formData.item_name}" sebagai item baru
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {stockItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.item_name}
                            onSelect={() => handleItemSelect(item)}
                          >
                            {item.item_name}
                            {item.hs_category && (
                              <span className="ml-2 text-xs text-slate-500">
                                ({item.hs_category})
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.item_name && !stockItems.find(item => item.item_name === formData.item_name) && (
                <p className="text-xs text-blue-600 mt-1">
                  ℹ️ Item baru akan dibuat: "{formData.item_name}"
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hs_category">Kategori (HS Category)</Label>
              <Input
                id="hs_category"
                value={formData.hs_category}
                onChange={(e) =>
                  setFormData({ ...formData, hs_category: e.target.value })
                }
                placeholder="Kategori barang"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto_barang">Foto Barang</Label>
              <div className="space-y-3">
                {!photoPreview ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <input
                      id="foto_barang"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    <label htmlFor="foto_barang" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-600">
                        {uploading ? "Uploading..." : "Click to upload photo"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative border border-slate-300 rounded-lg p-2">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4"
                      onClick={removePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_id">Supplier Name</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger id="supplier_id">
                  <SelectValue placeholder="Pilih supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name}
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="add_new"
                    className="text-blue-600 font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />+ Tambah supplier baru
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedSupplier && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-slate-700">
                  Supplier Information
                </h4>

                <div className="space-y-2">
                  <Label htmlFor="supplier_phone">Phone Number</Label>
                  <Input
                    id="supplier_phone"
                    value={selectedSupplier.phone_number || "-"}
                    disabled
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_address">Address</Label>
                  <Textarea
                    id="supplier_address"
                    value={selectedSupplier.address || "-"}
                    disabled
                    className="bg-white"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_email">Email</Label>
                  <Input
                    id="supplier_email"
                    value={selectedSupplier.email || "-"}
                    disabled
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity *</Label>
                <Input
                  id="qty"
                  type="number"
                  min="1"
                  value={formData.qty}
                  onChange={(e) =>
                    setFormData({ ...formData, qty: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Satuan Barang</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="Contoh: pcs, botol, unit, dll."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_price: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipping_cost">Shipping Cost *</Label>
                <Input
                  id="shipping_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.shipping_cost}
                  onChange={(e) =>
                    setFormData({ ...formData, shipping_cost: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData({ ...formData, tax: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatToRupiah(totalAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional information"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || uploading}
                className="flex-1"
              >
                {loading ? "Submitting..." : "Submit Purchase Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add New Supplier Dialog */}
      <Dialog
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Supplier Baru</DialogTitle>
            <DialogDescription>Isi detail supplier baru</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewSupplier} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Dasar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_supplier_name">Nama Supplier *</Label>
                  <Input
                    id="new_supplier_name"
                    value={newSupplierData.supplier_name}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        supplier_name: e.target.value,
                      })
                    }
                    placeholder="PT. Supplier Indonesia"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Informasi Kontak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_contact_person">Contact Person *</Label>
                  <Input
                    id="new_contact_person"
                    value={newSupplierData.contact_person}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        contact_person: e.target.value,
                      })
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_phone_number">Phone *</Label>
                  <Input
                    id="new_phone_number"
                    value={newSupplierData.phone_number}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        phone_number: e.target.value,
                      })
                    }
                    placeholder="+62 812 3456 7890"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_email">Email *</Label>
                  <Input
                    id="new_email"
                    type="email"
                    value={newSupplierData.email}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        email: e.target.value,
                      })
                    }
                    placeholder="supplier@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_city">City</Label>
                  <Input
                    id="new_city"
                    value={newSupplierData.city}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        city: e.target.value,
                      })
                    }
                    placeholder="Jakarta"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_country">Country</Label>
                  <Input
                    id="new_country"
                    value={newSupplierData.country}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        country: e.target.value,
                      })
                    }
                    placeholder="Indonesia"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_address">Address</Label>
                <Textarea
                  id="new_address"
                  value={newSupplierData.address}
                  onChange={(e) =>
                    setNewSupplierData({
                      ...newSupplierData,
                      address: e.target.value,
                    })
                  }
                  placeholder="Jl. Contoh No. 123"
                  rows={3}
                />
              </div>
            </div>

            {/* Tax Information */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Informasi Pajak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_is_pkp">PKP</Label>
                  <Select
                    value={newSupplierData.is_pkp}
                    onValueChange={(value) =>
                      setNewSupplierData({ ...newSupplierData, is_pkp: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status PKP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">Ya</SelectItem>
                      <SelectItem value="NO">Tidak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_tax_id">Tax ID / No. PKP</Label>
                  <Input
                    id="new_tax_id"
                    value={newSupplierData.tax_id}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        tax_id: e.target.value,
                      })
                    }
                    placeholder="01.234.567.8-901.000"
                  />
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Informasi Bank</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_bank_name">Bank Name</Label>
                  <Input
                    id="new_bank_name"
                    value={newSupplierData.bank_name}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        bank_name: e.target.value,
                      })
                    }
                    placeholder="Bank Mandiri"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_bank_account_holder">
                    Bank Account Holder
                  </Label>
                  <Input
                    id="new_bank_account_holder"
                    value={newSupplierData.bank_account_holder}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        bank_account_holder: e.target.value,
                      })
                    }
                    placeholder="PT. Supplier Indonesia"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Informasi Tambahan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_payment_terms">Payment Terms</Label>
                  <Input
                    id="new_payment_terms"
                    value={newSupplierData.payment_terms}
                    onChange={(e) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        payment_terms: e.target.value,
                      })
                    }
                    placeholder="Net 30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_category">Category</Label>
                  <Select
                    value={newSupplierData.category}
                    onValueChange={(value) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Raw Materials">Bahan Baku</SelectItem>
                      <SelectItem value="Work in Process">
                        Barang Dalam Proses
                      </SelectItem>
                      <SelectItem value="Finished Goods">
                        Barang Jadi
                      </SelectItem>
                      <SelectItem value="Resale/Merchandise">
                        Barang Dagangan
                      </SelectItem>
                      <SelectItem value="Spare Parts">Suku Cadang</SelectItem>
                      <SelectItem value="Food">Makanan</SelectItem>
                      <SelectItem value="Beverage">Minuman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_currency">Currency *</Label>
                  <Select
                    value={newSupplierData.currency}
                    onValueChange={(value) =>
                      setNewSupplierData({
                        ...newSupplierData,
                        currency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="SGD">SGD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_status">Status *</Label>
                  <Select
                    value={newSupplierData.status}
                    onValueChange={(value) =>
                      setNewSupplierData({ ...newSupplierData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Menyimpan..." : "Simpan Supplier"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSupplierDialogOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}