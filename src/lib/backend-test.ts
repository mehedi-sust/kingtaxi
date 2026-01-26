// Backend connection test utility
export async function testBackendConnection(baseUrl: string = 'https://kingtaxi-webapp-backend.onrender.com') {
  const endpoints = [
    '/',
    '/docs',
    '/fares/',
    '/offers/',
    '/vehicles/',
    '/users/',
    '/drivers/',
    '/stats/'
  ];

  console.log(`🔍 Testing backend connection to: ${baseUrl}`);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      results.push({
        endpoint,
        status: response.status,
        statusText: response.statusText,
        contentType,
        isJson,
        success: response.ok && isJson
      });
      
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText} (${contentType})`);
      
    } catch (error) {
      results.push({
        endpoint,
        status: 'ERROR',
        statusText: error instanceof Error ? error.message : 'Unknown error',
        contentType: null,
        isJson: false,
        success: false
      });
      
      console.log(`❌ ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return results;
}

// Test function to be called from browser console
if (typeof window !== 'undefined') {
  (window as any).testBackend = testBackendConnection;
}