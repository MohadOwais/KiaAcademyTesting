import { PayPopup } from "./PayPopup";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PayPopup>{children}</PayPopup>
}
