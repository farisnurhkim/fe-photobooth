"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User as UserIcon, Loader2, Menu, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SessionProvider } from "next-auth/react";
import { cn } from "@/lib/utils";

function SettingsContent() {
  const { data: session, update } = useSession();

  // Profile States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [originalProfileImage, setOriginalProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Verification Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newEmailToVerify, setNewEmailToVerify] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setFullName(session.user.name || "");
      setEmail(session.user.email || "");
      
      const fetchProfile = async () => {
        try {
          const res = await api.get('/auth/profile');
          if (res.data.success && res.data.user.profilePicture) {
            setProfileImage(res.data.user.profilePicture);
            setOriginalProfileImage(res.data.user.profilePicture);
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      };
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, session?.user?.name]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!fullName || !email) {
      toast.error("Full name and email are required");
      return;
    }

    try {
      setIsUpdatingProfile(true);

      let finalProfilePicture = profileImage;
      let oldProfilePicture = null;

      // Upload new image if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        
        const uploadRes = await api.post("/media/upload-single", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        if (uploadRes.data.success) {
          finalProfilePicture = uploadRes.data.data.url;
          // Only attempt to delete if the old image is a cloud URL
          if (originalProfileImage && originalProfileImage.startsWith("http")) {
            oldProfilePicture = originalProfileImage;
          }
        }
      }

      const res = await api.put("/auth/profile", {
        nama_lengkap: fullName,
        email,
        profilePicture: finalProfilePicture,
      });

      if (res.data.success) {
        toast.success(res.data.message);

        // Delete old profile picture
        if (oldProfilePicture) {
          api.post("/media/delete", { fileUrl: oldProfilePicture }).catch((e) => 
            console.error("Failed to delete old profile picture:", e)
          );
        }
        
        // If email changed, backend sets isActive to false and requires re-verification
        if (session?.user?.email && session.user.email !== email) {
          setNewEmailToVerify(email);
          setShowVerifyModal(true);
        } else {
          // Update NextAuth session locally
          await update({
            ...session,
            user: {
              ...session?.user,
              name: fullName,
              email: email,
            },
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await api.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      if (res.data.success) {
        toast.success("Password updated successfully");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }
    
    try {
      setIsVerifying(true);
      const res = await api.post("/auth/verify-email", {
        email: newEmailToVerify,
        activationCode: verificationCode,
      });

      if (res.data.success) {
        toast.success("Email verified successfully!");
        setShowVerifyModal(false);
        setVerificationCode("");
        
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            email: newEmailToVerify,
            name: fullName,
          },
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-6 bg-white border-b border-gray-100 z-20 sticky top-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-neutral-900 hover:opacity-80 transition-opacity"
        >
          <span className="text-neutral-900">Snap</span>
          <span className="text-neutral-400">Book</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-[280px] bg-[#f9fafb] flex flex-col p-8 fixed left-0 top-0 h-full border-r border-gray-100 z-40 transition-transform duration-300 md:translate-x-0 shadow-2xl md:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex justify-end md:hidden mb-4">
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col mb-12 md:mt-4">
          <div className="flex items-center gap-4 md:gap-0 md:flex-col md:items-start">
            <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full overflow-hidden bg-white md:mb-4 shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
              {profileImage ? (
                <img src={profileImage} alt="User" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">{session?.user?.name || "Loading..."}</h3>
              <span className="text-[10px] font-bold tracking-widest text-[#a88d3b] uppercase mt-1 block">Premium Member</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 mt-6 md:mt-0">
          <Link 
            href="/settings" 
            onClick={() => setIsSidebarOpen(false)}
            className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 whitespace-nowrap"
          >
            <UserIcon className="w-4 h-4 text-[#a88d3b]" />
            <span className="text-xs font-bold tracking-widest uppercase">Profile</span>
          </Link>
        </nav>

        <div className="mt-auto pt-8 pb-4">
          <Link href="/">
            <Button className="w-full bg-[#4a4a4a] hover:bg-[#333] text-white rounded-xl py-6 text-xs font-bold tracking-wide transition-colors">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-[280px] p-6 sm:p-12 lg:p-16">
        <div className="max-w-4xl">
          <div className="mb-12">
            <h1 className="text-xl font-medium text-gray-800 mb-2">Account Settings</h1>
            <p className="text-sm text-gray-500">
              Manage your editorial profile, track your studio bookings, and configure your digital presence.
            </p>
          </div>

          {/* Profile Identity Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
            <h2 className="text-sm text-gray-500 mb-8 font-medium">Profile Identity</h2>
            
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="w-[100px] h-[100px] rounded-full border border-gray-100 overflow-hidden relative group cursor-pointer bg-gray-50 flex items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover transition duration-300 group-hover:opacity-80" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-gray-300 transition duration-300 group-hover:opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-white text-xs font-medium">Edit</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] text-[#a88d3b] font-bold tracking-[0.15em] uppercase hover:opacity-80 transition-opacity"
                >
                  Update Photo
                </button>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2 block">
                      Full Name
                    </label>
                    <Input 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-[#f8f9fa] border-0 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-gray-200 text-sm text-gray-700" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2 block">
                      Email Address
                    </label>
                    <Input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#f8f9fa] border-0 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-gray-200 text-sm text-gray-700" 
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="bg-[#555] hover:bg-[#333] text-white rounded-full px-8 py-2 h-10 text-xs font-semibold tracking-wide transition-colors"
                  >
                    {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Password Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-sm text-gray-500 mb-8 font-medium">Security & Password</h2>
            
            <div className="flex flex-col">
              <div className="mb-6">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2 block">
                  Current Password
                </label>
                <Input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="bg-[#f8f9fa] border-0 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-gray-200 text-sm text-gray-700 w-full" 
                  placeholder="••••••••" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2 block">
                    New Password
                  </label>
                  <Input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[#f8f9fa] border-0 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-gray-200 text-sm text-gray-700" 
                    placeholder="••••••••" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2 block">
                    Confirm New Password
                  </label>
                  <Input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#f8f9fa] border-0 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-gray-200 text-sm text-gray-700" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  className="bg-[#555] hover:bg-[#333] text-white rounded-full px-8 py-2 h-10 text-xs font-semibold tracking-wide transition-colors"
                >
                  {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Verify Email Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Verify New Email</h3>
            <p className="text-sm text-gray-500 mb-6">
              We've sent a verification code to <span className="font-semibold text-gray-800">{newEmailToVerify}</span>. 
              Please enter it below to confirm your new email address.
            </p>
            <div className="mb-6">
              <Input 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="bg-[#f8f9fa] border-0 rounded-xl h-12 text-center text-lg tracking-[0.25em] font-medium"
                maxLength={6}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setShowVerifyModal(false)}
                className="rounded-full px-6 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleVerifyEmail}
                disabled={isVerifying}
                className="bg-[#555] hover:bg-[#333] text-white rounded-full px-8 py-2 h-10 text-xs font-semibold tracking-wide transition-colors"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <SessionProvider>
      <SettingsContent />
    </SessionProvider>
  );
}
