'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  type?: 'admin' | 'user'; // Specify which route type to protect
}

export default function ProtectedRoute({ children, type = 'admin' }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAdmin = pathname?.startsWith('/admin');
      const isUser = pathname?.startsWith('/user');

      // Check admin authentication
      if (isAdmin) {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          router.push('/admin/login');
          return;
        }
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      // Check user authentication
      if (isUser) {
        const userToken = localStorage.getItem('userToken');
        if (!userToken) {
          router.push('/login');
          return;
        }
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      // Default fallback
      setIsAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-950 to-sapphire-900/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 border-4 border-sapphire-500/30 border-t-sapphire-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg">
            {pathname?.startsWith('/admin') ? 'Loading admin panel...' : 'Loading account...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
