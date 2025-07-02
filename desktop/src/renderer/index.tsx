/**
 * Renderer entry point for OmnisecAI Desktop
 * This file serves as the main entry point for the Electron renderer process
 */
import React from 'react';
import { createRoot } from 'react-dom/client';

// Desktop-specific renderer app
const DesktopApp: React.FC = () => {
  const [isElectronReady, setIsElectronReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsElectronReady(true);
      
      // Set up event listeners for Electron-specific events
      const handlePowerEvent = (event: any, data: any) => {
        console.log('Power event received:', data);
        // Handle power management events
      };

      const handleNotificationClick = (event: any, data: any) => {
        console.log('Notification clicked:', data);
        // Handle notification interactions
      };

      window.electronAPI.on('power-event', handlePowerEvent);
      window.electronAPI.on('notification-clicked', handleNotificationClick);

      // Cleanup listeners
      return () => {
        window.electronAPI.off('power-event', handlePowerEvent);
        window.electronAPI.off('notification-clicked', handleNotificationClick);
      };
    } else {
      setError('Electron API not available. Please run this application through Electron.');
    }
  }, []);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Application Error</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Reload Application
        </button>
      </div>
    );
  }

  if (!isElectronReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ marginTop: '16px', color: '#64748b' }}>
          Initializing Desktop Application...
        </p>
      </div>
    );
  }

  // In development, we'll show a redirect message to the web app
  // In production, this would be replaced with the actual desktop-optimized UI
  if (process.env.NODE_ENV === 'development') {
    return <DevelopmentRedirect />;
  }

  // Production would have the full desktop UI here
  return <ProductionDesktopUI />;
};

const DevelopmentRedirect: React.FC = () => {
  const [redirecting, setRedirecting] = React.useState(false);

  const handleRedirectToWeb = () => {
    setRedirecting(true);
    // In development, load the web app directly
    window.location.href = 'http://localhost:3000';
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      padding: '40px',
      textAlign: 'center',
      backgroundColor: '#f8fafc',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px',
        }}>
          OmnisecAI Desktop
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '32px',
          lineHeight: '1.6',
        }}>
          Desktop application is running in development mode. 
          Click below to access the web interface.
        </p>

        <button
          onClick={handleRedirectToWeb}
          disabled={redirecting}
          style={{
            padding: '12px 32px',
            backgroundColor: redirecting ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: redirecting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
        >
          {redirecting ? 'Redirecting...' : 'Open Web Interface'}
        </button>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#4b5563',
        }}>
          <strong>Development Info:</strong><br />
          Desktop features like system tray, native notifications, 
          and power management are fully functional in this Electron environment.
        </div>
      </div>
    </div>
  );
};

const ProductionDesktopUI: React.FC = () => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Desktop-specific header/title bar would go here */}
      <div style={{
        height: '40px',
        backgroundColor: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '16px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
      }}>
        OmnisecAI Desktop
      </div>

      {/* Main content area - would embed the web app or custom desktop UI */}
      <div style={{ flex: 1, display: 'flex' }}>
        <iframe
          src={process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : './web-app/index.html'}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="OmnisecAI Web Interface"
        />
      </div>
    </div>
  );
};

// Initialize the React application
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(<DesktopApp />);