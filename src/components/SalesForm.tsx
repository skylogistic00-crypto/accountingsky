import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface Item {
  id: string;
  item_name: string;
  quantity: number;
  coa_account_code: string;
  coa_account_name: string;
}

interface ServiceItem {
  id: string;
  item_name: string;
  price: number;
  unit: string;
  coa_revenue_code: string;
}

interface Customer {
  id: string;
  name: string;
}

interface COAAccount {
  account_code: string;
  account_name: string;
  account_type: string;
}

export default function SalesForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coaAccounts, setCOAAccounts] = useState<COAAccount[]>([]);
  
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    transaction_type: "Barang",
    item_id: "",
    item_name: "",
    stock_current: 0,
    quantity: 0,
    stock_after: 0,
    unit_price: 0,
    subtotal: 0,
    tax_percentage: 11,
    tax_amount: 0,
    total_amount: 0,
    payment_method: "Tunai",
    customer_id: "",
    customer_name: "",
    coa_account_code: "",
    coa_account_name: "",
    notes: "",
    cost_per_unit: 0,
  });

  const [stockWarning, setStockWarning] = useState("");

  useEffect(() => {
    fetchItems();
    fetchServiceItems();
    fetchCustomers();
    fetchCOAAccounts();
  }, []);

  useEffect(() => {
    // Calculate subtotal
    const subtotal = formData.quantity * formData.unit_price;
    // Calculate tax
    const taxAmount = (subtotal * formData.tax_percentage) / 100;
    // Calculate total
    const totalAmount = subtotal + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    }));
  }, [formData.quantity, formData.unit_price, formData.tax_percentage]);

  useEffect(() => {
    // Calculate stock after
    const stockAfter = formData.stock_current - formData.quantity;
    setFormData(prev => ({ ...prev, stock_after: stockAfter }));
    
    if (stockAfter < 0 && formData.transaction_type === "Barang") {
      setStockWarning("⚠️ Stok tidak mencukupi!");
    } else {
      setStockWarning("");
    }
  }, [formData.stock_current, formData.quantity, formData.transaction_type]);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("stock")
      .select("id, item_name, item_quantity, coa_account_code, coa_account_name")
      .gt("item_quantity", 0)
      .order("item_name");
    
    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data barang",
        variant: "destructive",
      });
    } else {
      // Map item_quantity to quantity for consistency
      const mappedItems = (data || []).map(item => ({
        id: item.id,
        item_name: item.item_name,
        quantity: item.item_quantity,
        coa_account_code: item.coa_account_code,
        coa_account_name: item.coa_account_name,
      }));
      setItems(mappedItems);
    }
  };

  const fetchServiceItems = async () => {
    const { data, error } = await supabase
      .from("service_items")
      .select("id, item_name, price, unit, coa_revenue_code")
      .eq("is_active", true)
      .order("item_name");
    
    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data jasa",
        variant: "destructive",
      });
    } else {
      setServiceItems(data || []);
    }
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name")
      .order("name");
    
    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data customer",
        variant: "destructive",
      });
    } else {
      setCustomers(data || []);
    }
  };

  const fetchCOAAccounts = async () => {
    const { data, error } = await supabase
      .from("chart_of_accounts")
      .select("account_code, account_name, account_type")
      .in("account_type", ["Revenue", "Income", "COGS", "Asset"])
      .order("account_code");
    
    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data COA",
        variant: "destructive",
      });
    } else {
      setCOAAccounts(data || []);
    }
  };

  const handleItemChange = async (itemId: string) => {
    const { data, error } = await supabase
      .from("stock")
      .select("id, item_name, item_quantity, coa_account_code, coa_account_name")
      .eq("id", itemId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data barang",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setFormData(prev => ({
        ...prev,
        item_id: itemId,
        item_name: data.item_name,
        stock_current: data.item_quantity,
        coa_account_code: data.coa_account_code || "",
        coa_account_name: data.coa_account_name || "",
      }));
    }
  };

  const handleServiceChange = async (serviceId: string) => {
    // Query with COA revenue code for automatic journal
    const { data, error } = await supabase
      .from("service_items")
      .select("id, item_name, price, unit, coa_revenue_code")
      .eq("id", serviceId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data jasa",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      // Get COA account name
      const { data: coaData } = await supabase
        .from("chart_of_accounts")
        .select("account_name")
        .eq("account_code", data.coa_revenue_code)
        .single();

      setFormData(prev => ({
        ...prev,
        item_id: serviceId,
        item_name: data.item_name,
        unit_price: data.price,
        stock_current: 0,
        quantity: prev.quantity || 1,
        // Auto-fill COA from service_items
        coa_account_code: data.coa_revenue_code,
        coa_account_name: coaData?.account_name || "",
      }));
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customer_id: customerId,
        customer_name: selectedCustomer.name,
      }));
    }
  };

  const handleCOAChange = (accountCode: string) => {
    const selectedAccount = coaAccounts.find(acc => acc.account_code === accountCode);
    if (selectedAccount) {
      setFormData(prev => ({
        ...prev,
        coa_account_code: accountCode,
        coa_account_name: selectedAccount.account_name,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.stock_after < 0 && formData.transaction_type === "Barang") {
      toast({
        title: "Stok tidak mencukupi",
        description: "Stok tidak mencukupi untuk transaksi ini",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Validate stock with edge function (only for Barang)
      if (formData.transaction_type === "Barang") {
        const { data: stockCheck, error: stockError } = await supabase.functions.invoke(
          "supabase-functions-check-stock-balance",
          {
            body: {
              item_id: formData.item_id,
              qty: formData.quantity,
            },
          }
        );

        if (stockError || !stockCheck?.success) {
          toast({
            title: "Stok tidak mencukupi",
            description: stockCheck?.message || "Stok tidak mencukupi",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Step 2: Insert sales transaction with all COA codes
      const { data: transaction, error: transactionError } = await supabase
        .from("sales_transactions")
        .insert({
          transaction_date: formData.transaction_date,
          transaction_type: formData.transaction_type,
          item_id: formData.item_id,
          item_name: formData.item_name,
          stock_before: formData.transaction_type === "Barang" ? formData.stock_current : null,
          quantity: formData.quantity,
          stock_after: formData.transaction_type === "Barang" ? formData.stock_after : null,
          unit_price: formData.unit_price,
          subtotal: formData.subtotal,
          tax_percentage: formData.tax_percentage,
          tax_amount: formData.tax_amount,
          total_amount: formData.total_amount,
          payment_method: formData.payment_method,
          customer_id: formData.customer_id,
          customer_name: formData.customer_name,
          coa_cash_code: formData.payment_method === "Piutang" ? "1-1200" : "1-1100",
          coa_revenue_code: formData.coa_account_code,
          coa_cogs_code: formData.transaction_type === "Barang" ? "5-1100" : null,
          coa_inventory_code: formData.transaction_type === "Barang" ? formData.coa_account_code : null,
          coa_tax_code: formData.tax_amount > 0 ? "2-1250" : null,
          notes: formData.notes,
          created_by: user?.email || "system",
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Step 3: Create journal entries based on transaction type
      const journalEntries = [];
      const transactionId = `SALE-${transaction.id.substring(0, 8)}`;

      if (formData.transaction_type === "Barang") {
        // Update stock in stock table
        const { error: updateStockError } = await supabase
          .from("stock")
          .update({ 
            item_quantity: formData.stock_after,
            updated_at: new Date().toISOString()
          })
          .eq("id", formData.item_id);

        if (updateStockError) {
          console.error("Update stock error:", updateStockError);
        }

        // Calculate COGS (use average cost or set default)
        const cogs = formData.quantity * (formData.cost_per_unit || 0);

        // 1️⃣ Dr Kas/Piutang
        const debitAccountCode = formData.payment_method === "Piutang" ? "1-1200" : "1-1100";
        const debitAccountName = formData.payment_method === "Piutang" ? "Piutang Usaha" : "Kas";
        
        journalEntries.push({
          transaction_id: transactionId,
          transaction_date: formData.transaction_date,
          account_code: debitAccountCode,
          account_name: debitAccountName,
          debit: formData.total_amount,
          credit: 0,
          description: `Penjualan Barang - ${formData.item_name} (${formData.payment_method})`,
          created_by: user?.email || "system",
        });

        // 2️⃣ Cr Pendapatan Penjualan Barang
        journalEntries.push({
          transaction_id: transactionId,
          transaction_date: formData.transaction_date,
          account_code: formData.coa_account_code,
          account_name: formData.coa_account_name,
          debit: 0,
          credit: formData.subtotal,
          description: `Pendapatan Penjualan Barang - ${formData.item_name}`,
          created_by: user?.email || "system",
        });

        // 3️⃣ Cr PPN Keluaran (if any)
        if (formData.tax_amount > 0) {
          journalEntries.push({
            transaction_id: transactionId,
            transaction_date: formData.transaction_date,
            account_code: "2-1250",
            account_name: "Hutang PPN",
            debit: 0,
            credit: formData.tax_amount,
            description: `PPN Keluaran ${formData.tax_percentage}%`,
            created_by: user?.email || "system",
          });
        }

        // 4️⃣ Dr Harga Pokok Penjualan
        if (cogs > 0) {
          journalEntries.push({
            transaction_id: transactionId,
            transaction_date: formData.transaction_date,
            account_code: "5-1100",
            account_name: "Harga Pokok Penjualan",
            debit: cogs,
            credit: 0,
            description: `HPP - ${formData.item_name}`,
            created_by: user?.email || "system",
          });

          // 5️⃣ Cr Persediaan Barang
          journalEntries.push({
            transaction_id: transactionId,
            transaction_date: formData.transaction_date,
            account_code: formData.coa_account_code,
            account_name: formData.coa_account_name,
            debit: 0,
            credit: cogs,
            description: `Pengurangan Persediaan - ${formData.item_name}`,
            created_by: user?.email || "system",
          });
        }

        // Refresh stock data from stock table
        const { data: updatedItem } = await supabase
          .from("stock")
          .select("item_quantity")
          .eq("id", formData.item_id)
          .single();

        if (updatedItem) {
          setFormData(prev => ({ ...prev, stock_current: updatedItem.item_quantity }));
        }
      } else {
        // Journal for Jasa (from service_items.coa_revenue_code)
        
        // 1️⃣ Dr Kas/Piutang
        const debitAccountCode = formData.payment_method === "Piutang" ? "1-1200" : "1-1100";
        const debitAccountName = formData.payment_method === "Piutang" ? "Piutang Usaha" : "Kas";
        
        journalEntries.push({
          transaction_id: transactionId,
          transaction_date: formData.transaction_date,
          account_code: debitAccountCode,
          account_name: debitAccountName,
          debit: formData.total_amount,
          credit: 0,
          description: `Penjualan Jasa - ${formData.item_name} (${formData.payment_method})`,
          created_by: user?.email || "system",
        });

        // 2️⃣ Cr Pendapatan Jasa (from service_items.coa_revenue_code)
        journalEntries.push({
          transaction_id: transactionId,
          transaction_date: formData.transaction_date,
          account_code: formData.coa_account_code,
          account_name: formData.coa_account_name,
          debit: 0,
          credit: formData.subtotal,
          description: `Pendapatan Jasa - ${formData.item_name}`,
          created_by: user?.email || "system",
        });

        // 3️⃣ Cr PPN Keluaran (if any)
        if (formData.tax_amount > 0) {
          journalEntries.push({
            transaction_id: transactionId,
            transaction_date: formData.transaction_date,
            account_code: "2-1250",
            account_name: "Hutang PPN",
            debit: 0,
            credit: formData.tax_amount,
            description: `PPN Keluaran ${formData.tax_percentage}%`,
            created_by: user?.email || "system",
          });
        }
      }

      // Insert journal entries
      const { error: journalError } = await supabase
        .from("journal_entries")
        .insert(journalEntries);

      if (journalError) {
        console.error("Journal error:", journalError);
        toast({
          title: "Warning",
          description: "Transaksi tersimpan tapi jurnal gagal dibuat",
          variant: "destructive",
        });
      } else {
        toast({
          title: "📝 Jurnal Otomatis Dibuat",
          description: `${journalEntries.length} entri jurnal berhasil dibuat untuk transaksi ${transactionId}`,
        });
      }

      // Step 5: Show success notification
      toast({
        title: "✅ Berhasil!",
        description: "Transaksi berhasil disimpan dan jurnal otomatis telah dibuat.",
      });

      // Reset form
      setFormData({
        transaction_date: new Date().toISOString().split("T")[0],
        transaction_type: "Barang",
        item_id: "",
        item_name: "",
        stock_current: 0,
        quantity: 0,
        stock_after: 0,
        unit_price: 0,
        subtotal: 0,
        tax_percentage: 11,
        tax_amount: 0,
        total_amount: 0,
        payment_method: "Tunai",
        customer_id: "",
        customer_name: "",
        coa_account_code: "",
        coa_account_name: "",
        notes: "",
        cost_per_unit: 0,
      });

      // Refresh items to get updated stock
      fetchItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const isFormValid = 
    formData.item_name &&
    formData.quantity > 0 &&
    formData.unit_price > 0 &&
    formData.customer_id &&
    formData.coa_account_code &&
    (formData.transaction_type === "Jasa" || formData.stock_after >= 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Card className="max-w-5xl mx-auto rounded-2xl shadow-md">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl">Form Penjualan Barang & Jasa</CardTitle>
          <CardDescription>
            Catat transaksi penjualan barang atau jasa dengan otomatis update stok dan jurnal
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grid 2 Columns with gap-3 */}
            <div className="grid md:grid-cols-2 gap-3">
              {/* Tanggal Transaksi */}
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Tanggal Transaksi *</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) =>
                    setFormData({ ...formData, transaction_date: e.target.value })
                  }
                  required
                  className="border"
                />
              </div>

              {/* Jenis Penjualan */}
              <div className="space-y-2">
                <Label htmlFor="transaction_type">Jenis Penjualan *</Label>
                <Select
                  value={formData.transaction_type}
                  onValueChange={(value) =>
                    setFormData({ 
                      ...formData, 
                      transaction_type: value,
                      item_id: "",
                      item_name: "",
                      stock_current: 0,
                      quantity: 0,
                      unit_price: 0
                    })
                  }
                >
                  <SelectTrigger id="transaction_type" className="border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Barang">Barang</SelectItem>
                    <SelectItem value="Jasa">Jasa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nama Barang/Jasa */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="item_id">
                  Nama {formData.transaction_type === "Barang" ? "Barang" : "Jasa"} *
                </Label>
                {formData.transaction_type === "Barang" ? (
                  <Select
                    value={formData.item_id}
                    onValueChange={handleItemChange}
                  >
                    <SelectTrigger id="item_id" className="border">
                      <SelectValue placeholder="Pilih barang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.item_name} (Stok: {item.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={formData.item_id}
                    onValueChange={handleServiceChange}
                  >
                    <SelectTrigger id="item_id" className="border">
                      <SelectValue placeholder="Pilih jasa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceItems.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.item_name} - {formatRupiah(service.price)}/{service.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Stok Saat Ini (only for Barang) */}
              {formData.transaction_type === "Barang" && (
                <div className="space-y-2">
                  <Label htmlFor="stock_current">Stok Saat Ini</Label>
                  <Input
                    id="stock_current"
                    type="number"
                    value={formData.stock_current}
                    readOnly
                    className="bg-gray-100 border"
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                  }
                  required
                  className="border"
                />
              </div>

              {/* Stok Akhir (only for Barang) */}
              {formData.transaction_type === "Barang" && (
                <div className="space-y-2">
                  <Label htmlFor="stock_after">Stok Akhir</Label>
                  <div className="relative">
                    <Input
                      id="stock_after"
                      type="number"
                      value={formData.stock_after}
                      readOnly
                      className={`bg-gray-100 border ${
                        formData.stock_after < 0 ? "border-red-500 text-red-600" : ""
                      }`}
                    />
                    {formData.stock_after < 0 && (
                      <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {stockWarning && (
                    <div className="bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-medium border border-red-300">
                      {stockWarning}
                    </div>
                  )}
                </div>
              )}

              {/* Harga per Unit */}
              <div className="space-y-2">
                <Label htmlFor="unit_price">Harga per Unit *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })
                  }
                  required
                  className={`border ${formData.transaction_type === "Jasa" ? "bg-gray-100" : ""}`}
                  readOnly={formData.transaction_type === "Jasa"}
                />
              </div>

              {/* Total Harga */}
              <div className="space-y-2">
                <Label htmlFor="subtotal">Total Harga</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
                  <p className="text-lg font-semibold text-blue-700">
                    {formatRupiah(formData.subtotal)}
                  </p>
                </div>
              </div>

              {/* Pajak */}
              <div className="space-y-2">
                <Label htmlFor="tax_percentage">Pajak (%)</Label>
                <Input
                  id="tax_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })
                  }
                  className="border"
                />
              </div>

              {/* Total Akhir */}
              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Akhir</Label>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md shadow-sm">
                  <p className="text-lg font-semibold text-green-700">
                    {formatRupiah(formData.total_amount)}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer *</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger id="customer_id" className="border">
                    <SelectValue placeholder="Pilih customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Metode Pembayaran */}
              <div className="space-y-2">
                <Label htmlFor="payment_method">Metode Pembayaran *</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    setFormData({ ...formData, payment_method: value })
                  }
                >
                  <SelectTrigger id="payment_method" className="border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tunai">Tunai</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                    <SelectItem value="Piutang">Piutang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Kode Akun COA */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="coa_account_code">Kode Akun COA (Revenue) *</Label>
                <Select
                  value={formData.coa_account_code}
                  onValueChange={handleCOAChange}
                >
                  <SelectTrigger id="coa_account_code" className="border">
                    <SelectValue placeholder="Pilih akun COA..." />
                  </SelectTrigger>
                  <SelectContent>
                    {coaAccounts
                      .filter(acc => acc.account_type === "Revenue" || acc.account_type === "Income")
                      .map((account) => (
                        <SelectItem key={account.account_code} value={account.account_code}>
                          {account.account_code} - {account.account_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Catatan */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Tambahkan catatan transaksi..."
                  rows={3}
                  className="border"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || loading}
                className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}