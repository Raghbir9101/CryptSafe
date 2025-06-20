import { NavLink } from "react-router-dom";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import { configuration } from "@/Utils/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
      { label: "Compliance", href: "/compliance" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
    ],
    resources: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Support", href: "/support" },
      { label: "Status", href: "/status" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "GDPR", href: "/gdpr" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Gradient accent line */}
      {/* <div className="h-[2px] bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div> */}
      <div className="h-[2px] bg-white-500"></div>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Brand Section */}
          <div className="text-center">
            <NavLink
              to="/"
              className="group inline-flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              <div className="relative">
                <Shield className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors duration-300 group-hover:scale-110 transform" />
                <div className="absolute inset-0 h-8 w-8 text-blue-600 opacity-20 group-hover:opacity-40 animate-pulse"></div>
              </div>
              <span className="font-black tracking-tight">
                {configuration.name}
              </span>
            </NavLink>
            <p className="mt-4 text-gray-600 mx-auto max-w-md">
              Secure your organization's data with enterprise-grade encryption
              and access controls. Built for modern businesses.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors duration-300"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Links Sections */}
        {/* <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                    <ul className="space-y-3">
                        {footerLinks.product.map((link) => (
                            <li key={link.label}>
                                <NavLink
                                    to={link.href}
                                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                    <ul className="space-y-3">
                        {footerLinks.company.map((link) => (
                            <li key={link.label}>
                                <NavLink
                                    to={link.href}
                                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
                    <ul className="space-y-3">
                        {footerLinks.resources.map((link) => (
                            <li key={link.label}>
                                <NavLink
                                    to={link.href}
                                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div> */}
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 pt-8 border-t border-gray-100 px-10 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © {currentYear} {configuration.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
