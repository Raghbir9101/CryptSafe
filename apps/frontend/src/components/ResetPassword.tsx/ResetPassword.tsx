import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Mail, Lock, KeyRound } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { api } from '@/Utils/utils';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [otpError, setOtpError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOtpSent, setIsOtpSent] = React.useState(false);
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);

    const validateEmail = () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validateOtp = () => {
        if (!otp || otp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP');
            return false;
        }
        setOtpError('');
        return true;
    };

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

    const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateEmail()) {
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/send-otp', { email });
            setIsOtpSent(true);
            toast.success("OTP Sent", {
                description: "Please check your email for the OTP.",
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
            console.error('OTP sending failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateOtp()) {
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, otp });
            setShowPasswordModal(true);
            toast.success("OTP Verified", {
                description: "Please set your new password.",
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid OTP");
            console.error('OTP verification failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validatePasswords()) {
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword,
                confirmPassword
            });
            toast.success("Password Reset Successful", {
                description: "You can now login with your new password.",
            });
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password");
            console.error('Password reset failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg border border-white/20">
                    <CardHeader className="space-y-1 pb-8 text-center">
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                            Reset Your Password
                        </CardTitle>
                        <p className="text-gray-600">Enter your email to receive a reset code</p>
                    </CardHeader>
                    <CardContent className="space-y-6 px-8 pb-8">
                        {!isOtpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`h-12 text-lg ${emailError ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                                        disabled={isLoading}
                                    />
                                    {emailError && (
                                        <p className="text-sm text-red-600 animate-fade-in">{emailError}</p>
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
                                            Sending OTP...
                                        </div>
                                    ) : (
                                        'Send Reset Code'
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="otp" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <KeyRound className="w-4 h-4 text-blue-600" />
                                        Enter OTP
                                    </Label>
                                    <Input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className={`h-12 text-lg ${otpError ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                                        disabled={isLoading}
                                    />
                                    {otpError && (
                                        <p className="text-sm text-red-600 animate-fade-in">{otpError}</p>
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
                                            Verifying OTP...
                                        </div>
                                    ) : (
                                        'Verify OTP'
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Set New Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-blue-600" />
                                New Password
                            </Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`h-12 text-lg ${passwordError ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-blue-600" />
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`h-12 text-lg ${passwordError ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                                disabled={isLoading}
                            />
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
        </div>
    );
}