import { Moon, Sun, Monitor, ChevronDown } from "lucide-react"; // Added ChevronDown icon
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";




export function ModeToggle() {
    const { theme, setTheme } = useTheme(); // Get the current theme
    const [activeTheme, setActiveTheme] = useState("System");
    const isSystemDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const { isMobile, openMobile, open } = useSidebar();
    useEffect(() => {
        // Map the current theme to a displayable name
        if (theme === "light") setActiveTheme("Light");
        else if (theme === "dark") setActiveTheme("Dark");
        else if (theme === "system") setActiveTheme("System");
    }, [theme]);


    const getActiveStyles = (itemTheme: any) => {
        const isActive = activeTheme === itemTheme;
        if (theme === "dark" && isActive) {
            return "bg-[#27272a] text-white"; // Dark mode active styles
        } else if (theme === "light" && isActive) {
            return "bg-gray-200 text-black"; // Light mode active styles
        }
        else if (theme === "system" && isActive) {
            // Default to system styles
            return isSystemDarkMode ? "bg-[#27272a] text-white" : "bg-gray-200 text-black";
        }
        return ""; // Default styles for inactive items
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip={"Dark / Light Mode"} className="flex items-center justify-between gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                        <div className="flex items-center gap-2">
                            {activeTheme === "Light" && <Sun className="h-4 w-4" />}
                            {activeTheme === "Dark" && <Moon className="h-4 w-4" />}
                            {activeTheme === "System" && <Monitor className="h-4 w-4" />}
                            {((isMobile && openMobile) || (!isMobile && open)) && <span>{activeTheme} Mode</span>}
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={getActiveStyles("Light")}
                >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={getActiveStyles("Dark")}
                >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={getActiveStyles("System")}
                >
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
