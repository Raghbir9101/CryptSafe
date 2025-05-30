// import * as React from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { register } from '../../Services/AuthService';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { SitemarkIcon } from '../../Icons/Icons';

// export default function Register() {
//   const nav = useNavigate();
//   const [emailError, setEmailError] = React.useState(false);
//   const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
//   const [passwordError, setPasswordError] = React.useState(false);
//   const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
//   const [nameError, setNameError] = React.useState(false);
//   const [nameErrorMessage, setNameErrorMessage] = React.useState('');

//   const validateInputs = () => {
//     const email: any = document.getElementById('email');
//     const password: any = document.getElementById('password');
//     const name: any = document.getElementById('name');

//     let isValid = true;

//     if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
//       setEmailError(true);
//       setEmailErrorMessage('Please enter a valid email address.');
//       isValid = false;
//     } else {
//       setEmailError(false);
//       setEmailErrorMessage('');
//     }

//     if (!password.value || password.value.length < 6) {
//       setPasswordError(true);
//       setPasswordErrorMessage('Password must be at least 6 characters long.');
//       isValid = false;
//     } else {
//       setPasswordError(false);
//       setPasswordErrorMessage('');
//     }

//     if (!name.value || name.value.length < 1) {
//       setNameError(true);
//       setNameErrorMessage('Name is required.');
//       isValid = false;
//     } else {
//       setNameError(false);
//       setNameErrorMessage('');
//     }

//     return isValid;
//   };

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (nameError || emailError || passwordError) {
//       return;
//     }
//     const data = new FormData(event.currentTarget);

//     const response = await register(data.get('email') as string, data.get('password') as string, data.get('name') as string);
//     if (response.error) {
//       return alert(response.error);
//     }
//     nav("/login")
//   };


//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-background">
//       <Card className="w-full max-w-[450px]">
//         <CardHeader className="space-y-1">
//           <div className="flex justify-center mb-4">

//           </div>
//           <CardTitle className="text-2xl text-center">Create an account</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">Full name</Label>
//               <Input
//                 id="name"
//                 name="name"
//                 type="text"
//                 placeholder="Jon Snow"
//                 className={nameError ? "border-destructive" : ""}
//               />
//               {nameError && (
//                 <p className="text-sm text-destructive">{nameErrorMessage}</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="your@email.com"
//                 className={emailError ? "border-destructive" : ""}
//               />
//               {emailError && (
//                 <p className="text-sm text-destructive">{emailErrorMessage}</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 placeholder="••••••"
//                 className={passwordError ? "border-destructive" : ""}
//               />
//               {passwordError && (
//                 <p className="text-sm text-destructive">{passwordErrorMessage}</p>
//               )}
//             </div>
//             <Button
//               type="submit"
//               className="w-full cursor-pointer"
//               onClick={validateInputs}
//             >
//               Create account
//             </Button>
//           </form>
//           <div className="relative my-6">
//             <div className="absolute inset-0 flex items-center">
//               <Separator className="w-full" />
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-background px-2 text-muted-foreground">
//                 Or continue with
//               </span>
//             </div>
//           </div>
//           <div className="space-y-4">
//             <Button
//               variant="outline"
//               className="w-full"
//               onClick={() => alert('Sign up with Google')}
//             >
//               <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
//                 <path
//                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                   fill="#4285F4"
//                 />
//                 <path
//                   d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                   fill="#34A853"
//                 />
//                 <path
//                   d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                   fill="#FBBC05"
//                 />
//                 <path
//                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                   fill="#EA4335"
//                 />
//               </svg>
//               Sign up with Google
//             </Button>
//             <p className="text-center text-sm text-muted-foreground">
//               Already have an account?{' '}
//               <NavLink to="/login" className="text-primary hover:underline">
//                 Sign in
//               </NavLink>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Shield, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock registration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Account Created Successfully", {
        description: "Welcome to CryptSafe! Please sign in with your new account.",
      });

      navigate('/login');
    } catch (error) {
      toast.error("Registration failed");
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
        {/* Header with Logo */}


        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg border border-white/20">
          <CardHeader className="space-y-1 pb-8 text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Join CryptSafe
            </CardTitle>
            <p className="text-gray-600 text-lg">Start protecting your data today</p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`h-12 text-lg ${errors.name ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 animate-fade-in">{errors.name}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`h-12 text-lg ${errors.email ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 animate-fade-in">{errors.email}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`h-12 text-lg pr-12 ${errors.password ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
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
                {errors.password && (
                  <p className="text-sm text-red-600 animate-fade-in">{errors.password}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`h-12 text-lg pr-12 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
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
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 animate-fade-in">{errors.confirmPassword}</p>
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
                    Creating Account...
                  </div>
                ) : (
                  'Create Secure Account'
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Already have an account?{' '}
                <NavLink
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign In
                </NavLink>
              </p>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
