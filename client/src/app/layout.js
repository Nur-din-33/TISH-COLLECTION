import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'TISH COLLECTION — Premium Clothing & Shoes',
  description: 'Discover premium clothing and shoes for every style. Fast delivery across Kenya. Secure M-Pesa payments.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-surface-50 text-surface-900 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#171717',
              color: '#fafafa',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
