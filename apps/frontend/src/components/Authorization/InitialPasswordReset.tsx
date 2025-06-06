import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { initialPasswordReset } from '../Services/AuthService';

interface InitialPasswordResetProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function InitialPasswordReset({ isOpen, onClose, userId }: InitialPasswordResetProps) {
    console.log('InitialPasswordReset rendered with isOpen:', isOpen);
    console.log('InitialPasswordReset userId:', userId);

    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [passwordError, setPasswordError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    // Add effect to monitor isOpen prop
    React.useEffect(() => {
        console.log('Modal isOpen prop changed:', isOpen);
    }, [isOpen]);

    const validatePasswords = () => {
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return false;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePasswords()) return;

        setIsLoading(true);
        try {
            await initialPasswordReset(userId, newPassword, confirmPassword);
            toast.success('Password reset successful');
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Set Your Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {passwordError && (
                        <p className="text-sm text-red-600">{passwordError}</p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
} 