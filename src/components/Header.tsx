import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import SupplierForm from "@/components/SupplierForm";
import ConsigneeForm from "@/components/ConsigneeForm";
import ShipperForm from "@/components/ShipperForm";

export default function Header() {
  const { user, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const [suspendedModal, setSuspendedModal] = useState(false);
  const [inactiveModal, setInactiveModal] = useState(false);
  const [registrationSuccessModal, setRegistrationSuccessModal] =
    useState(false);
  const [showsigninPassword, setshowsigninPassword] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    fullName: "",
    firstName: "",
    lastName: "",
    roleName: "read_only",
    entityType: "",
    phone: "",
    ktpAddress: "",
    ktpNumber: "",
    religion: "",
    birthPlace: "",
    birthDate: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
  });
  const [showEntityForm, setShowEntityForm] = useState<
    "supplier" | "consignee" | "shipper" | null
  >(null);

  // Load roles from database
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const { data, error } = await supabase
      .from("roles")
      .select("id, role_name")
      .order("role_name", { ascending: true });

    if (error) {
      console.error("Error loading roles:", error);
    } else {
      setRoles(data || []);
    }
  };

  // Helper function to humanize role names
  const humanizeRole = (roleName: string) => {
    return roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(signInData.email, signInData.password);
      toast({ title: "Success", description: "Signed in successfully" });
      setShowAuthDialog(false);
    } catch (error: any) {
      if (error.type === "suspended") {
        setSuspendedModal(true);
        return;
      }

      if (error.type === "inactive") {
        setInactiveModal(true);
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Login gagal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Create user via your signup edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-signup-multi-entity",
        {
          body: {
            email: signUpData.email,
            password: signUpData.password,
            full_name: signUpData.fullName,
            role: signUpData.roleName,
            entity_type: signUpData.entityType || "customer",
            phone: signUpData.phone,
            ktp_address: signUpData.ktpAddress,
            ktp_number: signUpData.ktpNumber,
            religion: signUpData.religion,
            birth_place: signUpData.birthPlace,
            birth_date: signUpData.birthDate,
            gender: signUpData.gender,
            marital_status: signUpData.maritalStatus,
            nationality: signUpData.nationality,
          },
        },
      );

      if (error) {
        throw error;
      }

      // 2️⃣ Send verification email (FIXED)
      await supabase.functions.invoke("send-confirmation-email", {
        body: {
          email: signUpData.email, // FIXED
          full_name: signUpData.fullName, // FIXED
          redirectUrl: "https://acc.skykargo.co.id",
        },
      });

      // 3️⃣ Done
      setShowAuthDialog(false);
      toast({
        title: "Success",
        description:
          "Account created successfully! Please check your email for verification.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Signup failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Success", description: "Signed out successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-1 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 backdrop-blur-sm shadow-[inset_0_0_3px_rgba(255,255,255,0.6),_0_4px_10px_rgba(0,0,0,0.1)] border border-slate-200 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all duration-300">
            <img
              src="/logo.jpg"
              alt="Sakti Kargo Yaksa"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900 [text-shadow:_1px_1px_3px_rgba(0,0,0,0.35)]">
                Sakti Kargo Yaksa
              </h1>
              <p className="text-xs text-slate-500 hidden sm:inline [text-shadow:_1px_1px_3px_rgba(0,0,0,0.35)]">
                Freight & Finance Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col items-end text-right leading-tight">
                  <span
                    className="text-base font-bold text-slate-900 tracking-wide
                  [text-shadow:_1px_1px_2px_rgba(0,0,0,0.25)]"
                  >
                    👋 Hallo {userProfile?.full_name || user.email}
                  </span>
                  <span
                    className="text-xs font-semibold text-slate-600 uppercase
                    [text-shadow:_0px_1px_1px_rgba(0,0,0,0.15)]"
                  >
                    {userProfile?.role_name
                      ? userProfile.role_name.replaceAll("_", " ")
                      : "User"}
                  </span>
                </div>

                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="shadow-sm hover:shadow-md transition-all"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowAuthDialog(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                Sign In / Sign Up
              </Button>
            )}
          </div>
        </div>
      </header>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>User Authentication</DialogTitle>
            <DialogDescription>
              Sign in or create a new account
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="signin" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 mt-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="px-6 pb-6 mt-4 shrink-0">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInData.email}
                    onChange={(e) =>
                      setSignInData({ ...signInData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showsigninPassword ? "text" : "password"}
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData({
                          ...signInData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setshowsigninPassword(!showsigninPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-gray-700 transition-colors"
                    >
                      {showsigninPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthDialog(false);
                    navigate("/forgot-password");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </TabsContent>

            <TabsContent
              value="signup"
              className="flex-1 min-h-0 flex flex-col px-6 pb-6 mt-4"
            >
              <form
                onSubmit={handleSignUp}
                className="flex-1 overflow-y-auto pr-2 space-y-4"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#cbd5e1 #f1f5f9",
                }}
              >
                {/* Role */}
                <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                  <Label
                    htmlFor="signup-role"
                    className="text-sm font-medium text-slate-700"
                  >
                    Role *
                  </Label>
                  <Select
                    value={signUpData.roleName}
                    onValueChange={(value) => {
                      setSignUpData({ ...signUpData, roleName: value });
                      // Check if role is supplier, consignee, or shipper
                      const lowerRole = value.toLowerCase();
                      if (lowerRole.includes("supplier")) {
                        setShowEntityForm("supplier");
                      } else if (lowerRole.includes("consignee")) {
                        setShowEntityForm("consignee");
                      } else if (lowerRole.includes("shipper")) {
                        setShowEntityForm("shipper");
                      } else {
                        setShowEntityForm(null);
                      }
                    }}
                  >
                    <SelectTrigger
                      id="signup-role"
                      className="bg-white border-blue-200"
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.role_name}>
                          {humanizeRole(role.role_name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show entity-specific form if supplier, consignee, or shipper is selected */}
                {showEntityForm && (
                  <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                      {showEntityForm === "supplier" && "Supplier Information"}
                      {showEntityForm === "consignee" &&
                        "Consignee Information"}
                      {showEntityForm === "shipper" && "Shipper Information"}
                    </h3>
                    {showEntityForm === "supplier" && <SupplierForm />}
                    {showEntityForm === "consignee" && <ConsigneeForm />}
                    {showEntityForm === "shipper" && <ShipperForm />}
                  </div>
                )}

                {/* Only show personal information form if NOT supplier/consignee/shipper */}
                {!showEntityForm && (
                  <>
                    {/* Personal Information Section */}
                    <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                        Personal Information
                      </h3>

                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="signup-firstname" className="text-sm">
                            First Name *
                          </Label>
                          <Input
                            id="signup-firstname"
                            type="text"
                            placeholder="John"
                            value={signUpData.firstName}
                            onChange={(e) =>
                              setSignUpData({
                                ...signUpData,
                                firstName: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-lastname" className="text-sm">
                            Last Name *
                          </Label>
                          <Input
                            id="signup-lastname"
                            type="text"
                            placeholder="Doe"
                            value={signUpData.lastName}
                            onChange={(e) =>
                              setSignUpData({
                                ...signUpData,
                                lastName: e.target.value,
                              })
                            }
                            required
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-fullname" className="text-sm">
                          Full Name *
                        </Label>
                        <Input
                          id="signup-fullname"
                          type="text"
                          placeholder="John Doe"
                          value={signUpData.fullName}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              fullName: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* Account Credentials Section */}
                    <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                        Account Credentials
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm">
                          Email *
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signUpData.email}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              email: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm">
                          Password *
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={signUpData.password}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              password: e.target.value,
                            })
                          }
                          required
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* KTP & Personal Details Section */}
                    <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                        Identity Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="signup-ktp-address" className="text-sm">
                          KTP Address
                        </Label>
                        <Input
                          id="signup-ktp-address"
                          type="text"
                          placeholder="Jl. Example No. 123"
                          value={signUpData.ktpAddress}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              ktpAddress: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-ktp-number" className="text-sm">
                          KTP Number
                        </Label>
                        <Input
                          id="signup-ktp-number"
                          type="text"
                          placeholder="1234567890123456"
                          value={signUpData.ktpNumber}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              ktpNumber: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="signup-religion" className="text-sm">
                            Religion
                          </Label>
                          <Input
                            id="signup-religion"
                            type="text"
                            placeholder="Islam"
                            value={signUpData.religion}
                            onChange={(e) =>
                              setSignUpData({
                                ...signUpData,
                                religion: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-ethnicity" className="text-sm">
                            Ethnicity
                          </Label>
                          <Input
                            id="signup-ethnicity"
                            type="text"
                            placeholder="Jawa"
                            value={signUpData.ethnicity}
                            onChange={(e) =>
                              setSignUpData({
                                ...signUpData,
                                ethnicity: e.target.value,
                              })
                            }
                            className="bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-education" className="text-sm">
                          Education
                        </Label>
                        <Input
                          id="signup-education"
                          type="text"
                          placeholder="S1"
                          value={signUpData.education}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              education: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-medium text-slate-700 border-b pb-2">
                        Contact Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-sm">
                          Phone Number
                        </Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+62 812 3456 7890"
                          value={signUpData.phoneNumber}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-license-number"
                          className="text-sm"
                        >
                          License Number
                        </Label>
                        <Input
                          id="signup-license-number"
                          type="text"
                          placeholder="1234567890"
                          value={signUpData.licenseNumber}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              licenseNumber: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-license-expiry"
                          className="text-sm"
                        >
                          SIM/License Expiry Date
                        </Label>
                        <Input
                          id="signup-license-expiry"
                          type="date"
                          value={signUpData.licenseExpiryDate}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              licenseExpiryDate: e.target.value,
                            })
                          }
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* Upload Documents - Only for driver_perusahaan */}
                    {signUpData.roleName === "driver_perusahaan" && (
                      <div className="space-y-3 bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-300">
                        <h3 className="text-sm font-medium text-amber-900 border-b border-amber-300 pb-2">
                          Upload Documents (Driver)
                        </h3>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="upload-selfie" className="text-sm">
                              Selfie Photo
                            </Label>
                            <Input
                              id="upload-selfie"
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setSignUpData({
                                  ...signUpData,
                                  selfiePhoto: e.target.files?.[0] || null,
                                })
                              }
                              className="bg-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="upload-family-card"
                              className="text-sm"
                            >
                              Family Card
                            </Label>
                            <Input
                              id="upload-family-card"
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) =>
                                setSignUpData({
                                  ...signUpData,
                                  familyCard: e.target.files?.[0] || null,
                                })
                              }
                              className="bg-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="upload-ktp" className="text-sm">
                              KTP Document
                            </Label>
                            <Input
                              id="upload-ktp"
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) =>
                                setSignUpData({
                                  ...signUpData,
                                  ktpDocument: e.target.files?.[0] || null,
                                })
                              }
                              className="bg-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="upload-sim" className="text-sm">
                              SIM Document
                            </Label>
                            <Input
                              id="upload-sim"
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) =>
                                setSignUpData({
                                  ...signUpData,
                                  simDocument: e.target.files?.[0] || null,
                                })
                              }
                              className="bg-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="upload-skck" className="text-sm">
                              SKCK Document
                            </Label>
                            <Input
                              id="upload-skck"
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) =>
                                setSignUpData({
                                  ...signUpData,
                                  skckDocument: e.target.files?.[0] || null,
                                })
                              }
                              className="bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 sticky bottom-0 bg-white border-t">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        disabled={loading}
                      >
                        {loading ? "Creating account..." : "Sign Up"}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      {/* 🔥 Modal: Suspended */}
      <Dialog open={suspendedModal} onOpenChange={setSuspendedModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akun Ditangguhkan</DialogTitle>
            <DialogDescription>
              Akun Anda telah ditangguhkan oleh administrator.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setSuspendedModal(false)}>OK</Button>
        </DialogContent>
      </Dialog>

      {/* 🔥 Modal: Inactive */}
      <Dialog open={inactiveModal} onOpenChange={setInactiveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akun Tidak Aktif</DialogTitle>
            <DialogDescription>
              Akun Anda tidak aktif, silakan hubungi administrator.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setInactiveModal(false)}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
