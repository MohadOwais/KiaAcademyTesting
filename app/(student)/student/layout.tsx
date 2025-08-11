// import MiniDrawerMUI from "@/app/components/mui/MiniDrawer";
import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <div className="container-fluid flex-grow-1 px-0 px-lg-3 mb-5">
                {children}
            </div>
            <Footer />
        </div>
    );
}