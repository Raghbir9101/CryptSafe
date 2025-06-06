import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { api } from '@/Utils/utils';

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
        if (!newPassword || newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return false;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validatePasswords()) {
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/initial-reset-password', {
                userId,
                newPassword,
                confirmPassword
            });
            toast.success("Password Reset Successful", {
                description: "Your password has been updated successfully.",
            });
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password");
            console.error('Password reset failed:', error);
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
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-blue-600" />
                            New Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`h-12 text-lg pr-12 ${passwordError ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                                disabled={isLoading}
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

                    <div className="space-y-3">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-blue-600" />
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`h-12 text-lg pr-12 ${passwordError ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                                disabled={isLoading}
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
                        {passwordError && (
                            <p className="text-sm text-red-600 animate-fade-in">{passwordError}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Resetting Password...
                            </div>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
} 