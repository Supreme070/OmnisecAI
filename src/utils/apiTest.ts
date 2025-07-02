/**
 * API Integration Test Utility
 * This file contains utility functions to test the API integration
 */
import { authApi, threatsApi, analyticsApi, modelsApi, apiKeysApi } from '@/lib/api';

export interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  responseTime?: number;
}

/**
 * Test authentication endpoints
 */
export async function testAuthEndpoints(): Promise<ApiTestResult[]> {
  const results: ApiTestResult[] = [];
  
  // Test health endpoint (should be accessible without auth)
  try {
    const start = Date.now();
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/../health`);
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      const data = await response.json();
      results.push({
        endpoint: 'GET /health',
        status: 'success',
        message: 'Health check passed',
        data,
        responseTime
      });
    } else {
      results.push({
        endpoint: 'GET /health',
        status: 'error',
        message: `Health check failed with status ${response.status}`,
        responseTime
      });
    }
  } catch (error) {
    results.push({
      endpoint: 'GET /health',
      status: 'error',
      message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  return results;
}

/**
 * Test API endpoints that require authentication
 */
export async function testAuthenticatedEndpoints(token: string): Promise<ApiTestResult[]> {
  const results: ApiTestResult[] = [];
  
  const endpoints = [
    {
      name: 'GET /auth/me',
      test: () => authApi.getCurrentUser()
    },
    {
      name: 'GET /threats/dashboard',
      test: () => threatsApi.getDashboard()
    },
    {
      name: 'GET /analytics/dashboard',
      test: () => analyticsApi.getDashboard()
    },
    {
      name: 'GET /models',
      test: () => modelsApi.getModels()
    },
    {
      name: 'GET /keys',
      test: () => apiKeysApi.getKeys()
    }
  ];

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await endpoint.test();
      const responseTime = Date.now() - start;
      
      if (response.success) {
        results.push({
          endpoint: endpoint.name,
          status: 'success',
          message: 'Endpoint accessible',
          data: response.data,
          responseTime
        });
      } else {
        results.push({
          endpoint: endpoint.name,
          status: 'error',
          message: response.error || 'Unknown API error',
          responseTime
        });
      }
    } catch (error: any) {
      results.push({
        endpoint: endpoint.name,
        status: 'error',
        message: error.response?.data?.error || error.message || 'Network error'
      });
    }
  }

  return results;
}

/**
 * Test WebSocket connection
 */
export async function testWebSocketConnection(): Promise<ApiTestResult> {
  return new Promise((resolve) => {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
      const ws = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          endpoint: 'WebSocket Connection',
          status: 'error',
          message: 'Connection timeout (5s)'
        });
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({
          endpoint: 'WebSocket Connection',
          status: 'success',
          message: 'WebSocket connection successful'
        });
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        resolve({
          endpoint: 'WebSocket Connection',
          status: 'error',
          message: 'WebSocket connection failed'
        });
      };
    } catch (error) {
      resolve({
        endpoint: 'WebSocket Connection',
        status: 'error',
        message: `WebSocket test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
}

/**
 * Run comprehensive API integration test
 */
export async function runApiIntegrationTest(token?: string): Promise<{
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  results: ApiTestResult[];
}> {
  console.log('🔍 Running API Integration Tests...');
  
  const allResults: ApiTestResult[] = [];
  
  // Test basic connectivity
  const basicTests = await testAuthEndpoints();
  allResults.push(...basicTests);
  
  // Test WebSocket
  const wsTest = await testWebSocketConnection();
  allResults.push(wsTest);
  
  // Test authenticated endpoints if token provided
  if (token) {
    const authTests = await testAuthenticatedEndpoints(token);
    allResults.push(...authTests);
  }
  
  // Calculate summary
  const summary = {
    total: allResults.length,
    passed: allResults.filter(r => r.status === 'success').length,
    failed: allResults.filter(r => r.status === 'error').length,
    warnings: allResults.filter(r => r.status === 'warning').length
  };
  
  console.log('📊 Test Summary:', summary);
  console.log('📋 Detailed Results:', allResults);
  
  return { summary, results: allResults };
}

/**
 * Display test results in console with formatting
 */
export function displayTestResults(results: ApiTestResult[]): void {
  console.log('\n🧪 API Integration Test Results');
  console.log('=====================================');
  
  results.forEach((result, index) => {
    const status = result.status === 'success' ? '✅' : 
                   result.status === 'warning' ? '⚠️' : '❌';
    const time = result.responseTime ? ` (${result.responseTime}ms)` : '';
    
    console.log(`${index + 1}. ${status} ${result.endpoint}${time}`);
    console.log(`   ${result.message}`);
    
    if (result.data && result.status === 'success') {
      console.log(`   Data: ${JSON.stringify(result.data, null, 2).substring(0, 100)}...`);
    }
    console.log('');
  });
}