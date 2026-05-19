import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Kjøpsvilkår og Betingelser | KRS VR Arena",
  description: "Les våre kjøpsvilkår, avbestillingsregler og betingelser for booking hos KRS VR Arena.",
  openGraph: {
    title: "Kjøpsvilkår og Betingelser | KRS VR Arena",
    description: "Les våre kjøpsvilkår og avbestillingsregler.",
    url: "https://www.krsvr.no/vilkar",
    type: "website",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
