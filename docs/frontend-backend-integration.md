# Frontend-Backend API Integration Guide

## Overview

This document describes the integration between the OmnisecAI frontend React application and the Node.js/Express backend API. The integration provides comprehensive authentication, real-time notifications, security analytics, and model management functionality.

## API Configuration

### Environment Variables

Create a `.env` file in the frontend root with:

```bash
# Backend API Configuration
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws

# Environment
VITE_APP_ENV=development

# Features
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MFA=true

# Security
VITE_JWT_REFRESH_THRESHOLD=5 # minutes before expiry to refresh token
```

### API Client Configuration

The API client (`/src/lib/api.ts`) provides:

- **Automatic JWT token management** with refresh token rotation
- **Request/response interceptors** for logging and error handling
- **Automatic retry** on 401 errors with token refresh
- **TypeScript interfaces** for all API responses
- **File upload support** with progress tracking
- **WebSocket client** for real-time updates

## Authentication Integration

### Auth Store (`/src/stores/authStore.ts`)

The Zustand-based auth store manages:

- User authentication state
- JWT token storage (cookies + localStorage)
- Automatic token refresh
- User profile management
- Persistent auth state

### Authentication Flow

1. **Login**: `POST /api/v1/auth/login`
   - Returns JWT access token and refresh token
   - Stores user profile and tokens
   - Redirects to dashboard

2. **Token Refresh**: `POST /api/v1/auth/refresh`
   - Automatically triggered on 401 responses
   - Seamless token rotation
   - Fallback to login if refresh fails

3. **Logout**: `POST /api/v1/auth/logout`
   - Clears server-side session
   - Removes client-side tokens
   - Redirects to login

### User Roles

The system supports four user roles with hierarchical permissions:

- **viewer** (level 0): Read-only access
- **user** (level 1): Basic user permissions
- **analyst** (level 2): Security analysis capabilities
- **admin** (level 3): Full system access

## API Endpoints Integration

### Authentication APIs (`authApi`)

```typescript
// User login
await authApi.login({ email, password });

// Get current user profile
await authApi.getCurrentUser();

// Password reset
await authApi.forgotPassword(email);
await authApi.resetPassword(token, newPassword);

// Email verification
await authApi.verifyEmail(token);
```

### Models API (`modelsApi`)

```typescript
// Get models with pagination
await modelsApi.getModels({ page: 1, limit: 20, search: 'query' });

// Upload model file
await modelsApi.uploadModel(formData, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

// Get model details
await modelsApi.getModel(modelId);

// Download model
await modelsApi.downloadModel(modelId);
```

### Scanning API (`scanningApi`)

```typescript
// Get scan history
await scanningApi.getScans({ status: 'completed' });

// Create new scan
await scanningApi.createScan({ modelId, scanType: 'comprehensive' });

// Get scan details
await scanningApi.getScan(scanId);

// Retry failed scan
await scanningApi.retryScan(scanId);
```

### Threats API (`threatsApi`)

```typescript
// Get threats dashboard
await threatsApi.getDashboard();

// Search threats
await threatsApi.getThreats({
  q: 'search query',
  severity: 'high',
  status: 'active'
});

// Report new threat
await threatsApi.reportThreat({
  threatType: 'malware',
  description: 'Suspicious behavior detected',
  indicators: { ... }
});

// Update threat status
await threatsApi.updateThreatStatus(threatId, {
  status: 'resolved',
  resolutionNotes: 'Issue resolved'
});
```

### Analytics API (`analyticsApi`)

```typescript
// Get security metrics
await analyticsApi.getMetrics({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Get threat trends
await analyticsApi.getTrends({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  granularity: 'day'
});

// Generate security report
await analyticsApi.generateReport({
  reportType: 'weekly',
  startDate: '2024-01-01',
  endDate: '2024-01-07'
});

// Get dashboard analytics
await analyticsApi.getDashboard('7d');
```

### API Keys Management (`apiKeysApi`)

```typescript
// Get API keys
await apiKeysApi.getKeys();

// Create new API key
await apiKeysApi.createKey({
  name: 'Production API',
  permissions: ['read', 'write'],
  expiresAt: '2024-12-31'
});

// Rotate API key
await apiKeysApi.rotateKey(keyId);

// Revoke API key
await apiKeysApi.revokeKey(keyId);
```

### MFA API (`mfaApi`)

```typescript
// Generate MFA secret
await mfaApi.generateSecret();

// Enable MFA
await mfaApi.enableMFA({ secret, token });

// Verify MFA token
await mfaApi.verifyMFA({ token });

// Get backup codes
await mfaApi.getBackupCodes();
```

## Real-time Integration

### WebSocket Connection

The WebSocket client provides real-time updates:

```typescript
import { WebSocketClient } from '@/lib/api';

const wsClient = new WebSocketClient();

// Connect with authentication
wsClient.connect();

// Listen for events
wsClient.on('threat_detected', (data) => {
  console.log('New threat detected:', data);
});

wsClient.on('scan_completed', (data) => {
  console.log('Scan completed:', data);
});

// Send messages
wsClient.send({ type: 'subscribe', channel: 'threats' });
```

### WebSocket Events

The system broadcasts the following real-time events:

- **threat_detected**: New security threat identified
- **scan_completed**: Model scan finished
- **scan_started**: Model scan initiated
- **threat_status_update**: Threat status changed
- **system_alert**: System-wide notifications
- **user_activity**: User login/logout events

## Dashboard Integration

### Dashboard Store (`/src/stores/dashboardStore.ts`)

The dashboard store manages:

- Security metrics fetching
- System health monitoring
- Real-time data updates
- Error state management
- Auto-refresh functionality

### Data Flow

1. **Initial Load**: Fetches security and system metrics
2. **Real-time Updates**: WebSocket events update store state
3. **Periodic Refresh**: Fallback refresh when WebSocket disconnected
4. **Error Handling**: Graceful degradation on API failures

## Error Handling

### API Error Responses

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  message?: string;
}
```

### Error Handling Strategy

1. **Network Errors**: Display connection error toast
2. **Authentication Errors**: Automatic token refresh or redirect to login
3. **Permission Errors**: Show access denied message
4. **Rate Limiting**: Display retry message with delay
5. **Server Errors**: Show generic error with retry option

## Testing Integration

### API Integration Tests

Use the provided test utility:

```typescript
import { runApiIntegrationTest } from '@/utils/apiTest';

// Test basic connectivity
const results = await runApiIntegrationTest();

// Test with authentication
const token = getAuthToken();
const results = await runApiIntegrationTest(token);
```

### Manual Testing Checklist

- [ ] User authentication (login/logout)
- [ ] Token refresh on expiry
- [ ] Dashboard data loading
- [ ] Real-time WebSocket connection
- [ ] File upload functionality
- [ ] API error handling
- [ ] Role-based access control
- [ ] MFA setup and verification

## Security Considerations

### Token Management

- Tokens stored in httpOnly cookies when possible
- Fallback to localStorage for development
- Automatic token rotation on refresh
- Secure token transmission over HTTPS

### Request Security

- All requests include CSRF protection
- Request ID tracking for audit trails
- Rate limiting on sensitive endpoints
- Input validation on all forms

### WebSocket Security

- JWT-based WebSocket authentication
- Message validation and sanitization
- Connection rate limiting
- Automatic reconnection with backoff

## Performance Optimization

### API Client Optimizations

- Request deduplication
- Response caching for static data
- Automatic retry with exponential backoff
- Connection pooling for multiple requests

### Dashboard Optimizations

- Lazy loading of non-critical data
- Optimistic updates for better UX
- Background refresh without blocking UI
- Error boundary for graceful failures

## Development Workflow

### Backend API Development

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Test Integration**: Use browser dev tools to monitor API calls
4. **Debug Issues**: Check both frontend and backend logs

### Production Deployment

1. **Build Frontend**: `npm run build`
2. **Configure Environment**: Set production API URLs
3. **Deploy Backend**: Ensure API is accessible
4. **Verify Integration**: Run integration tests

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **401 Unauthorized**: Verify JWT token validity
3. **WebSocket Connection Failed**: Check WebSocket URL and firewall
4. **API Timeout**: Increase timeout or check backend performance

### Debug Tools

- Browser DevTools Network tab
- Frontend console logs
- Backend server logs
- WebSocket connection status in UI

## Next Steps

The frontend-backend integration is now complete with:

✅ Complete API client with all backend endpoints
✅ Authentication with JWT and refresh tokens
✅ Real-time WebSocket communication
✅ Dashboard with live data updates
✅ Error handling and retry logic
✅ Role-based access control
✅ File upload with progress tracking
✅ Comprehensive type safety

The system is ready for:
- Production deployment
- Real-time threat monitoring
- Comprehensive security analytics
- Multi-user collaboration