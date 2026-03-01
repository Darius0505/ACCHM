import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AppRail from "@/components/layout/AppRail";
import TabBar from "@/components/layout/TabBar";
import { TabProvider } from "@/components/layout/TabContext";
import AIAssistant from "@/components/ai/AIAssistant";
import { PermissionProvider } from "@/components/auth/PermissionContext";


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TabProvider>
            <PermissionProvider>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    height: '100vh',
                    overflow: 'hidden',
                    backgroundColor: 'var(--background, #F9FAFB)'
                }}>
                    <AppRail />
                    <Sidebar />
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        overflow: 'hidden'
                    }}>
                        <Header />
                        <TabBar />
                        <main style={{
                            flex: 1,
                            overflowY: 'auto',
                            backgroundColor: 'var(--background, #0F172A)'
                        }}>
                            <div style={{
                                margin: '8px',
                                backgroundColor: 'var(--surface, #1E293B)',
                                borderRadius: '8px',
                                minHeight: 'calc(100% - 16px)',
                                boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.3))'
                            }}>
                                {children}
                            </div>
                        </main>
                    </div>
                    <AIAssistant />
                </div>
            </PermissionProvider>
        </TabProvider>
    );
}
