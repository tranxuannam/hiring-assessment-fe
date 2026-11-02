import "./globals.css";

export const metadata = {
  title: "Clarity Assessments",
  description: "Candidate assessments and hiring review workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
