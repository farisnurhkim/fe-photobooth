import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photography Packages',
  description: 'Explore our handcrafted photography packages. From solo essential sessions to group editorial shoots, choose the perfect studio experience for your needs.',
  openGraph: {
    title: 'Photography Packages - Snapbook',
    description: 'Explore our handcrafted photography packages. Choose the perfect studio experience for your needs.',
    url: '/packages',
  },
};

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
