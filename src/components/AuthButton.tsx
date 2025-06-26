
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogIn, LogOut, User as UserIcon, Settings, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AccountDeletionDialog from "./AccountDeletionDialog";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Error signing in:', error);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <>
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-orange-500" />
            <span className="text-gray-700">สวัสดี, {user.user_metadata?.full_name || user.email}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบบัญชี
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <AccountDeletionDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          userEmail={user.email || ''}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">เข้าสู่ระบบเพื่อใช้งาน</h3>
        <p className="text-gray-600 text-sm">ต้องเข้าสู่ระบบก่อนเพื่อสร้างอัลบั้มภาพ</p>
      </div>
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
      >
        <LogIn className="w-5 h-5" />
        เข้าสู่ระบบด้วย Google
      </button>
    </div>
  );
}
