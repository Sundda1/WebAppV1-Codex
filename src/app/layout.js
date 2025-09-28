import "./globals.css";

export const metadata = {
  title: "Biometric Insights Dashboard",
  description:
    "Real-time biometric monitoring and AI-driven insights for classroom wellness.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
