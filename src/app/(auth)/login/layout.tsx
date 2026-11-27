import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your Snapbook account to manage your creative photography bookings.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
