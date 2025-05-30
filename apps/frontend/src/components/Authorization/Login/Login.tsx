// import * as React from 'react';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { getUserAfterRefresh, login, loginWithGoogle } from '@/components/Services/AuthService';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { Button } from "@/components/ui/button"
// import { api } from '@/Utils/utils';
// import { toast } from 'sonner';

// export default function SignIn() {
//   const navigate = useNavigate();
//   const [emailError, setEmailError] = React.useState(false);
//   const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
//   const [passwordError, setPasswordError] = React.useState(false);
//   const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
//   const [isLoading, setIsLoading] = React.useState(false);

//   const validateInputs = () => {
//     const email: any = document.getElementById('email');
//     const password: any = document.getElementById('password');

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

//     return isValid;
//   };

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (emailError || passwordError) {
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const data = new FormData(event.currentTarget);
//       const response = await login(data.get('email') as string, data.get('password') as string);
//       console.log(response)
//       toast.success("Login Successful", {
//         description: "You have successfully logged in.",
//       });
//       if (response.success) {
//         navigate('/dashboard');
//       }
//     } catch (error) {
//       toast.error("Login failed")
//       console.error('Login failed:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     setIsLoading(true);
//     try {
//       const response = await api.get('/auth/google/url');
//       const { authUrl } = response.data;

//       // Open Google OAuth popup
//       const popup = window.open(
//         authUrl,
//         'Google Login',
//         'width=600,height=700,scrollbars=yes'
//       );

//       if (!popup) {
//         throw new Error('Popup blocked by browser');
//       }

//       // Listen for the OAuth callback
//       const checkPopup = setInterval(async () => {
//         try {
//           if (!popup || popup.closed) {
//             clearInterval(checkPopup);
//             setIsLoading(false);
//             return;
//           }

//           const currentUrl = popup.location.href;

//           // Only process if we're at the callback URL
//           if (currentUrl && currentUrl.includes('/auth/google/callback')) {
//             const urlParams = new URLSearchParams(new URL(currentUrl).search);
//             const code = urlParams.get('code');
//             const error = urlParams.get('error');

//             if (error) {
//               console.error('Google OAuth error:', error);
//               popup.close();
//               clearInterval(checkPopup);
//               setIsLoading(false);
//               return;
//             }

//             if (code) {
//               // Close popup before making the API call to avoid cross-origin issues
//               popup.close();
//               clearInterval(checkPopup);

//               // Handle the code
//               const response = await api.post('/auth/google/callback', { code });
//               if (response.data.success) {
//                 localStorage.setItem('token', response.data.token);
//                 localStorage.setItem('user', JSON.stringify(response.data.user));
//                 getUserAfterRefresh()
//                 navigate('/tables');
//               }
//             }
//           }
//         } catch (error) {
//           // Ignore cross-origin errors while checking popup URL
//           if (!error.toString().includes('cross-origin')) {
//             console.error('Error checking popup:', error);
//           }
//         }
//       }, 500);
//     } catch (error) {
//       console.error('Google login failed:', error);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-background">
//       <Card className="w-full max-w-[450px]">
//         <CardHeader className="space-y-1">
//           <div className="flex justify-center mb-4">

//           </div>
//           <CardTitle className="text-2xl text-center cursor-pointer">Sign In</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="your@email.com"
//                 className={emailError ? "border-destructive" : ""}
//                 disabled={isLoading}
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
//                 disabled={isLoading}
//               />
//               {passwordError && (
//                 <p className="text-sm text-destructive">{passwordErrorMessage}</p>
//               )}
//             </div>
//             <Button
//               type="submit"
//               className="w-full"
//               onClick={validateInputs}
//               disabled={isLoading}
//             >
//               {isLoading ? 'Signing in...' : 'Sign In'}
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
//               onClick={handleGoogleLogin}
//               disabled={isLoading}
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
//               {isLoading ? 'Signing in...' : 'Sign in with Google'}
//             </Button>
//             <p className="text-center text-sm text-muted-foreground">
//               Don't have an account?{' '}
//               <NavLink to="/register" className="text-primary hover:underline">
//                 Sign Up
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
import { getUserAfterRefresh, login } from '@/components/Services/AuthService';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { api } from '@/Utils/utils';
import { toast } from 'sonner';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const validateInputs = () => {
    const email: any = document.getElementById('email');
    const password: any = document.getElementById('password');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailError || passwordError) {
      return;
    }
    setIsLoading(true);
    try {
      const data = new FormData(event.currentTarget);
      const response = await login(data.get('email') as string, data.get('password') as string);
      console.log(response)
      toast.success("Login Successful", {
        description: "You have successfully logged in.",
      });
      if (response.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error("Login failed")
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/google/url');
      const { authUrl } = response.data;

      const popup = window.open(
        authUrl,
        'Google Login',
        'width=600,height=700,scrollbars=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked by browser');
      }

      const checkPopup = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            setIsLoading(false);
            return;
          }

          const currentUrl = popup.location.href;

          if (currentUrl && currentUrl.includes('/auth/google/callback')) {
            const urlParams = new URLSearchParams(new URL(currentUrl).search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');

            if (error) {
              console.error('Google OAuth error:', error);
              popup.close();
              clearInterval(checkPopup);
              setIsLoading(false);
              return;
            }

            if (code) {
              popup.close();
              clearInterval(checkPopup);

              const response = await api.post('/auth/google/callback', { code });
              if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                getUserAfterRefresh()
                navigate('/tables');
              }
            }
          }
        } catch (error) {
          if (!error.toString().includes('cross-origin')) {
            console.error('Error checking popup:', error);
          }
        }
      }, 500);
    } catch (error) {
      console.error('Google login failed:', error);
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
        {/* Enhanced Header with Logo */}


        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg border border-white/20">
          <CardHeader className="space-y-1 pb-8 text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 text-lg font-medium">Secure Data Management System</p>
          </CardHeader>
          <CardContent className=" px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`h-12 text-lg ${emailError ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 bg-white"} transition-all duration-300 focus:shadow-lg`}
                  disabled={isLoading}
                />
                {emailError && (
                  <p className="text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                    {emailErrorMessage}
                  </p>
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
                    placeholder="Enter your password"
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
                {passwordError && (
                  <p className="text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                    {passwordErrorMessage}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <NavLink
                  to="/forgot/password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot password?
                </NavLink>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                onClick={validateInputs}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>



            <div className="space-y-4 mt-4">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <NavLink
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Create Account
                </NavLink>
              </p>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}