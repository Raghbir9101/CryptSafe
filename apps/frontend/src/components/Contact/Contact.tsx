import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Shield, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../Footer/Footer";
import { configuration } from "@/Utils/utils";

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        message: "",
        inquiryType: "general"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log("Form submitted:", formData);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const inquiryTypes = [
        { value: "general", label: "General Inquiry" },
        { value: "sales", label: "Sales & Pricing" },
        { value: "technical", label: "Technical Support" },
        { value: "partnership", label: "Partnership" },
        { value: "security", label: "Security Audit" },
        { value: "compliance", label: "Compliance Questions" }
    ];

    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

                <main className="container mx-auto px-6 py-20">
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                            Get in Touch
                        </Badge>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
                            Contact {configuration.name}
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Ready to secure your organization's data? Our security experts are here to help you
                            implement the perfect solution for your needs.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto px-4">
                        <div className="flex flex-col space-y-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    Fill out the form below and we'll get back to you within 24 hours.
                                </p>
                            </div>
                            <Card className="shadow-xl border-0">
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="john@company.com"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company/Organization</Label>
                                            <Input
                                                id="company"
                                                placeholder="Acme Corporation"
                                                value={formData.company}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="inquiry-type">Inquiry Type</Label>
                                            <select
                                                id="inquiry-type"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.inquiryType}
                                                onChange={(e) => handleInputChange("inquiryType", e.target.value)}
                                            >
                                                {inquiryTypes.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message *</Label>
                                            <Textarea
                                                id="message"
                                                placeholder={`Tell us about your security needs, current challenges, or any questions you have about ${configuration.name}...`}
                                                rows={6}
                                                value={formData.message}
                                                onChange={(e) => handleInputChange("message", e.target.value)}
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Message
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Frequently Asked Questions</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                {
                                    question: `How quickly can ${configuration.name} be deployed?`,
                                    answer: `Most organizations can have ${configuration.name} fully deployed within 1-2 weeks, including user training and security configuration.`
                                },
                                {
                                    question: `Is ${configuration.name} compliant with industry standards?`,
                                    answer: `Yes, ${configuration.name} meets HIPAA, GDPR, and SOC 2 Type II standards with comprehensive audit trails and access controls.`
                                },
                                {
                                    question: `Can ${configuration.name} integrate with existing systems?`,
                                    answer: `${configuration.name} offers APIs and integrations with major enterprise systems, SSO providers, and workflow tools.`
                                },
                                {
                                    question: "What kind of support do you provide?",
                                    answer: "We offer 24/7 technical support, dedicated account management, and comprehensive training for all users."
                                }
                            ].map((faq, index) => (
                                <div key={index} className="space-y-3">
                                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Contact;