import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request Activation',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RequestActivationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
