'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout } from '@/lib/features/auth/authSlice';
import {
  LayoutDashboard, Receipt, ChefHat, ShoppingBag, UtensilsCrossed, Package,
  Users, UserCheck, CalendarClock, Truck, BarChart3, Bot, Tag, Settings,
  LogOut, Bell, Search, Menu, X, ChevronLeft, ChevronRight, UserCircle,
  Star, CalendarDays, CalendarCheck, Wallet, GitBranch, Award, ShoppingCart, TrendingUp
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pos', label: 'POS System', icon: Receipt },
  { href: '/admin/kds', label: 'Kitchen Display', icon: ChefHat },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/menu', label: 'Menu & Categories', icon: UtensilsCrossed },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/customers', label: 'Customers', icon: UserCheck },
  { href: '/admin/tables', label: 'Tables', icon: CalendarClock },
  { href: '/admin/reservations', label: 'Reservations', icon: CalendarDays },
  { href: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/ai-assistant', label: 'AI Assistant', icon: Bot },
  { href: '/admin/promotions', label: 'Promotions', icon: Tag },
  { href: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/admin/payroll', label: 'Payroll', icon: Wallet },
  { href: '/admin/branches', label: 'Branches', icon: GitBranch },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { href: '/admin/loyalty', label: 'Loyalty Program', icon: Award },
  { href: '/admin/financial', label: 'Financial', icon: TrendingUp },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!user) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 border-b border-gray-800 flex-shrink-0 relative">
          <div className="flex items-center gap-3 w-full">
            <div className="p-1.5 bg-blue-600 rounded-lg flex-shrink-0">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            {isSidebarOpen && <span className="font-bold text-lg whitespace-nowrap overflow-hidden transition-all duration-300">SmartServe AI</span>}
          </div>
          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full p-1 border border-gray-700 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive ? 'bg-blue-600/20 text-white border-l-2 border-blue-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                `}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'group-hover:text-gray-300'}`} />
                {isSidebarOpen && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 p-2 rounded-full flex-shrink-0">
              <UserCircle className="h-5 w-5 text-gray-300" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.role}</p>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 border focus:border-blue-500 rounded-xl text-sm focus:outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
            </button>
            <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center text-white font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </main>

    </div>
  );
}
