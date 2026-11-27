import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your Snapbook account and join our community of elite photographers.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
