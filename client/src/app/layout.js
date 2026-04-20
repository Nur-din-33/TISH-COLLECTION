import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'TISH COLLECTION — Kenya\'s Online Shopping Destination',
  description: 'Shop electronics, fashion, home goods and more. Fast delivery across Kenya. Pay with M-Pesa.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}
