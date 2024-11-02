import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { router } from './routes.jsx';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx'; // Import the AuthProvider

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);