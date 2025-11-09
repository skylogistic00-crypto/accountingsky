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
import { useToast } from "./ui/use-toast";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";

interface PurchaseRequestFormProps {
  onSuccess?: () => void;
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
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
  });

  useEffect(() => {
    if (userProfile?.full_name) {
      setFormData((prev) => ({ ...prev, name: userProfile.full_name }));
    }
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
    fetchSuppliers();
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

  const handleSupplierChange = (supplierId: string) => {
    setFormData({ ...formData, supplier_id: supplierId });

    const supplier = suppliers.find((s) => s.id === supplierId);
    setSelectedSupplier(supplier || null);
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
      const requesterName = formData.name || userProfile?.full_name || user?.email?.split('@')[0] || 'Unknown User';
      
      const { error } = await supabase.from('purchase_requests').insert({
        request_code: requestCode,
        request_date: format(formData.request_date, 'yyyy-MM-dd'),
        name: requesterName,
        item_name: formData.item_name,
        quantity: parseInt(formData.qty),
        unit_price: parseFloat(formData.unit_price),
        shipping_cost: parseFloat(formData.shipping_cost) || 0,
        total_amount: calculateTotalAmount(),
        requester_id: user?.id,
        status: 'PENDING',
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
        title: 'Success',
        description: 'Purchase request created successfully',
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
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoUrl(null);
      setSelectedSupplier(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
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
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) =>
                  setFormData({ ...formData, item_name: e.target.value })
                }
                placeholder="Enter item name"
                required
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
    </div>
  );
}