
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteUserAccount } from '@/lib/accountDeletion';
import { toast } from '@/hooks/use-toast';

interface AccountDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function AccountDeletionDialog({ isOpen, onClose, userEmail }: AccountDeletionDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const confirmationText = 'DELETE MY ACCOUNT';

  const handleDeleteAccount = async () => {
    if (confirmText !== confirmationText) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาพิมพ์คำยืนยันให้ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUserAccount();
      toast({
        title: "ลบบัญชีสำเร็จ",
        description: "บัญชีของคุณถูกลบเรียบร้อยแล้ว",
      });
      // User will be signed out automatically
      onClose();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถลบบัญชีได้",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmValid = confirmText === confirmationText;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            ลบบัญชีถาวร
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="text-gray-700">
              <p className="font-semibold mb-2">คำเตือน: การกระทำนี้ไม่สามารถยกเลิกได้!</p>
              <p>การลบบัญชีจะลบข้อมูลทั้งหมดของคุณ:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>อัลบั้มภาพทั้งหมด</li>
                <li>รูปภาพที่อัปโหลด</li>
                <li>ข้อมูลโปรไฟล์</li>
                <li>บัญชีผู้ใช้</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-sm text-red-700 mb-2">
                บัญชี: <span className="font-mono">{userEmail}</span>
              </p>
              <Label htmlFor="confirm-text" className="text-sm font-medium text-red-700">
                พิมพ์ "{confirmationText}" เพื่อยืนยัน:
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmationText}
                className="mt-1 font-mono"
                disabled={isDeleting}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={!isConfirmValid || isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                กำลังลบ...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                ลบบัญชีถาวร
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
