import MiniDrawerMUI from "@/app/components/mui/MiniDrawer";
import './Main.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MiniDrawerMUI>
            {children}
        </MiniDrawerMUI>
    );
}
