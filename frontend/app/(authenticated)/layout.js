'use client';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import MobileBottomNav from '../../components/MobileBottomNav';

export default function AuthenticatedLayout({ children }) {
    return (
        <div className="min-h-screen bg-canvas font-sans antialiased flex text-ink">
            {/* Desktop Sidebar (hidden on mobile) */}
            <Sidebar />
            
            <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
                <Topbar />
                {children}
            </div>

            {/* Mobile Bottom Navigation (hidden on desktop) */}
            <MobileBottomNav />
        </div>
    );
}
