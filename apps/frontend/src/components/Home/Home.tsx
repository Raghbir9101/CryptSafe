import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Clock, MapPin, Users, FileCheck, Eye, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../Footer/Footer";

const Home = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Shield,
            title: "Secure Data Storage",
            description: "AES-256 encryption at rest and in transit with secure hashing for critical information.",
            badge: "Enterprise Grade"
        },
        {
            icon: Users,
            title: "Advanced Permissions",
            description: "Granular access controls with Read-only, Read & Write, Share Access, and Delete Control roles.",
            badge: "Role-Based"
        },
        {
            icon: MapPin,
            title: "IP & Location Control",
            description: "Restrict access based on IP addresses and geolocation with dynamic threat protection.",
            badge: "Geo-Restricted"
        },
        {
            icon: Clock,
            title: "Time-Based Access",
            description: "Define access windows with specific dates, hours, and timezone-aware scheduling.",
            badge: "Time-Controlled"
        },
        {
            icon: FileCheck,
            title: "Secure Sharing",
            description: "Share encrypted data between users with permission-controlled access and expiration.",
            badge: "Controlled Sharing"
        },
        {
            icon: Eye,
            title: "Audit & Monitoring",
            description: "Complete audit trail with real-time alerts and suspicious behavior detection.",
            badge: "Full Visibility"
        }
    ];

    const useCases = [
        "Enterprises with strict confidential data access rules",
        "Remote teams requiring location/IP-based document access",
        "Organizations with HIPAA, GDPR compliance requirements",
        "Admins needing full control over user sessions"
    ];

    return (
        <div>
            <div className="min-h-screen ">
                <main className="container mx-auto px-6 py-20">
                    {/* Hero Section */}
                    <div className="text-center max-w-5xl mx-auto mb-20">
                        <div className="mb-8">
                            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                                🛡️ Enterprise Security Platform
                            </Badge>
                            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
                                CryptSafe
                            </h1>
                            <p className="text-2xl text-gray-700 mb-4 font-semibold">
                                Secure Data Management System
                            </p>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                                Powerful platform providing granular data protection, permission-level controls,
                                and intelligent access restrictions based on IP, time, and location.
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center flex-wrap mb-12">
                            <Button
                                size="lg"
                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                onClick={() => navigate("/login")}
                            >
                                <Shield className="h-5 w-5 mr-2" />
                                Get Started Securely
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="px-8 py-4 text-blue-700 font-semibold border-2 border-blue-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                                onClick={() => navigate("/about")}
                            >
                                Learn More
                            </Button>
                        </div>


                    </div>

                    {/* Features Grid */}
                    <div className="mb-20">
                        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Core Features</h2>
                        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                            Advanced security features designed for enterprise-grade data protection
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <feature.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {feature.badge}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Use Cases */}
                    <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100 mb-20">
                        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Perfect For</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {useCases.map((useCase, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{useCase}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Admin Capabilities */}
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">Admin Control Center</h2>
                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                            Comprehensive admin tools for complete user and data management
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "User Management", desc: "View and control all users" },
                                { title: "Permission Control", desc: "Modify access rules" },
                                { title: "IP & Location", desc: "Geographic restrictions" },
                                { title: "Activity Logs", desc: "Complete audit trails" }
                            ].map((capability, index) => (
                                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                                    <CardContent className="pt-8 pb-6">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <AlertTriangle className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{capability.title}</h3>
                                        <p className="text-sm text-gray-600">{capability.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white text-center">
                        <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Data?</h2>
                        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                            Join organizations worldwide who trust CryptSafe for their most sensitive information
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-50 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => navigate("/contact")}
                            >
                                Contact Sales
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-full transition-all duration-300"
                                onClick={() => navigate("/login")}
                            >
                                Start Free Trial
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
