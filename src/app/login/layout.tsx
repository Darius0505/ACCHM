import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Đăng nhập - ACCHM",
    description: "Đăng nhập vào hệ thống kế toán ACCHM",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout excludes the sidebar by not including it
    return <>{children}</>;
}
