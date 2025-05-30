import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Shield, Mail, ArrowLeft, Lock } from 'lucide-react';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isEmailSent, setIsEmailSent] = React.useState(false);

    const validateEmail = () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateEmail()) {
            return;
        }

        setIsLoading(true);
        try {
            // Mock password reset - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setIsEmailSent(true);
            toast.success("Reset Email Sent", {
                description: "Check your email for password reset instructions.",
            });
        } catch (error) {
            toast.error("Failed to send reset email");
            console.error('Password reset failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isEmailSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                    <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                <Mail className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Check Your Email
                        </h1>
                    </div>

                    <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="space-y-4">
                                <p className="text-lg text-gray-700">
                                    We've sent a password reset link to:
                                </p>
                                <p className="text-xl font-semibold text-blue-600">{email}</p>
                                <p className="text-gray-600">
                                    Click the link in the email to reset your password. If you don't see it, check your spam folder.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => setIsEmailSent(false)}
                                    variant="outline"
                                    className="w-full h-12"
                                >
                                    Try Different Email
                                </Button>

                                <NavLink to="/login">
                                    <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Sign In
                                    </Button>
                                </NavLink>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Header with Logo */}
                <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg border border-white/20">
                    <CardHeader className="space-y-1 pb-8 text-center">
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                            Reset Your Password?
                        </CardTitle>
                        <p className="text-gray-600">No worries, we'll help you reset it</p>
                    </CardHeader>
                    <CardContent className="space-y-6 px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-blue-600" />
                                    New Password
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter new password"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`h-12 text-lg ${emailError ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                                    disabled={isLoading}
                                />
                                {emailError && (
                                    <p className="text-sm text-red-600 animate-fade-in">{emailError}</p>
                                )}
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-blue-600" />
                                    Confirm Password
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter new confirm password"
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
                                        Sending Reset Email...
                                    </div>
                                ) : (
                                    'Send Reset Instructions'
                                )}
                            </Button>
                        </form>

                        <div className="text-center space-y-4">
                            <p className="text-gray-600">
                                Remember your password?{' '}
                                <NavLink
                                    to="/login"
                                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                >
                                    Sign In
                                </NavLink>
                            </p>
                            <div className="flex justify-center items-center gap-6 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Secure Reset Process
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Email Verification
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}