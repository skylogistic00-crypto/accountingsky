import { useState } from "react";
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

export default function Header() {
  const { user, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const [suspendedModal, setSuspendedModal] = useState(false);
  const [inactiveModal, setInactiveModal] = useState(false);
  const [showsigninPassword, setshowsigninPassword] = useState(false);

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    fullName: "",
    roleName: "read_only",
  });

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
      await signUp(
        signUpData.email,
        signUpData.password,
        signUpData.fullName,
        signUpData.roleName,
      );
      toast({
        title: "Success",
        description: "Account created! Please check your email.",
      });
      setShowAuthDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    console.log("SIGNUP DATA:", signUpData);
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
    <>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Authentication</DialogTitle>
            <DialogDescription>
              Sign in or create a new account
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
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

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpData.fullName}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpData.email}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showsigninPassword ? "text" : "password"}
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
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
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Role</Label>
                  <Select
                    value={signUpData.roleName}
                    onValueChange={(value) =>
                      setSignUpData({ ...signUpData, roleName: value })
                    }
                  >
                    <SelectTrigger id="signup-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="accounting_manager">
                        Accounting Manager
                      </SelectItem>
                      <SelectItem value="accounting_staff">
                        Accounting Staff
                      </SelectItem>
                      <SelectItem value="warehouse_manager">
                        Warehouse Manager
                      </SelectItem>
                      <SelectItem value="warehouse_staff">
                        Warehouse Staff
                      </SelectItem>
                      <SelectItem value="customs_specialist">
                        Customs Specialist
                      </SelectItem>
                      <SelectItem value="read_only">Read Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
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
    </>
  );
}
