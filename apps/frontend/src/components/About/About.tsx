import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Zap, Globe, Lock, Eye, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../Footer/Footer";

const About = () => {
    const navigate = useNavigate();

    const technologies = [
        { name: "Frontend", tech: "React / Next.js + Tailwind / ShadCN UI" },
        { name: "Backend", tech: "Node.js (Express) / NestJS (Optional)" },
        { name: "Authentication", tech: "JWT, Refresh Tokens, Optional 2FA" },
        { name: "Database", tech: "MongoDB / PostgreSQL (multi-tenant optional)" },
        { name: "Encryption", tech: "AES-256, bcrypt (for passwords)" },
        { name: "Hosting", tech: "Dockerized, deployed on secure VPS" },
        { name: "Monitoring", tech: "Integrated logging & alerting tools" }
    ];

    const roadmapItems = [
        "End-to-end encrypted file storage",
        "Admin insights dashboard with charts/analytics",
        // "External SSO support (Google/Microsoft)",
        // "Mobile app with biometric authentication"
    ];

    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

                <main className="container mx-auto px-6 py-20">
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                            About CryptSafe
                        </Badge>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
                            Redefining Data Security
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            CryptSafe represents the next generation of secure data management, combining
                            enterprise-grade encryption with intelligent access controls and real-time monitoring.
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                In an era where data breaches and unauthorized access threaten organizations daily,
                                CryptSafe provides a comprehensive solution that doesn't compromise on security or usability.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                We believe that robust security should be accessible to organizations of all sizes,
                                which is why we've built CryptSafe with an admin-first architecture that puts control
                                back in the hands of those who need it most.
                            </p>
                            <Button
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                                onClick={() => navigate("/contact")}
                            >
                                Get in Touch
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="text-center p-6">
                                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                                <p className="text-sm text-gray-600">Military-grade encryption standards</p>
                            </Card>
                            <Card className="text-center p-6">
                                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                                <h3 className="font-semibold text-gray-900 mb-2">User Control</h3>
                                <p className="text-sm text-gray-600">Granular permission management</p>
                            </Card>
                            <Card className="text-center p-6">
                                <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
                                <p className="text-sm text-gray-600">Lightning-fast access controls</p>
                            </Card>
                            <Card className="text-center p-6">
                                <Globe className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                                <h3 className="font-semibold text-gray-900 mb-2">Global Reach</h3>
                                <p className="text-sm text-gray-600">Location-aware security</p>
                            </Card>
                        </div>
                    </div>

                    {/* Key Differentiators */}
                    <div className="mb-20">
                        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">What Sets Us Apart</h2>
                        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                            CryptSafe combines multiple layers of security with intuitive management tools
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: Lock,
                                    title: "Multi-Layer Encryption",
                                    description: "AES-256 encryption with secure key management and rotation"
                                },
                                {
                                    icon: MapPin,
                                    title: "Geo-Intelligence",
                                    description: "Location and IP-based access controls with real-time validation"
                                },
                                {
                                    icon: Clock,
                                    title: "Temporal Controls",
                                    description: "Time-based access windows with timezone awareness"
                                },
                                {
                                    icon: Eye,
                                    title: "Complete Visibility",
                                    description: "Comprehensive audit trails and real-time monitoring"
                                }
                            ].map((item, index) => (
                                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 group">
                                    <CardHeader>
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <item.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <CardTitle className="text-lg text-gray-900">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-gray-600">
                                            {item.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Technical Architecture */}
                    {/* <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100 mb-20">
                        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Technical Architecture</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {technologies.map((tech, index) => (
                                <div key={index} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                                    <h3 className="font-semibold text-gray-900 mb-2">{tech.name}</h3>
                                    <p className="text-sm text-gray-600">{tech.tech}</p>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    {/* Compliance & Standards */}
                    {/* <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">Compliance & Standards</h2>
                        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                            CryptSafe is designed to meet the most stringent security and compliance requirements
                        </p>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "HIPAA Compliant",
                                    description: "Healthcare data protection standards with audit trails and access controls"
                                },
                                {
                                    title: "GDPR Ready",
                                    description: "European data protection regulations with right to deletion and data portability"
                                },
                                {
                                    title: "SOC 2 Type II",
                                    description: "Security, availability, and confidentiality controls audited by third parties"
                                }
                            ].map((compliance, index) => (
                                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Shield className="w-8 h-8 text-white" />
                                        </div>
                                        <CardTitle className="text-xl text-gray-900">{compliance.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-gray-600">
                                            {compliance.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div> */}

                    {/* Future Roadmap */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white mb-20">
                        <h2 className="text-3xl font-bold text-center mb-8">Future Roadmap</h2>
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {roadmapItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <p className="text-lg opacity-90">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Get Started?</h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Experience the power of next-generation data security with CryptSafe
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button
                                size="lg"
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => navigate("/contact")}
                            >
                                Contact Us
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="px-8 py-4 text-blue-600 border-blue-600 hover:bg-blue-50 font-semibold rounded-full transition-all duration-300"
                                onClick={() => navigate("/")}
                            >
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default About;