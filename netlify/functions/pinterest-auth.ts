import { Handler } from '@netlify/functions';

const clientId = '1507772';
const clientSecret = '12e86e7dd050a39888c5e753908e80fae94f7367';
const redirectUri = 'https://adorable-shortbread-ea235b.netlify.app/callback';

// Change to sandbox URL
const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const path = event.path.split('/').pop();
  const { code, refresh_token } = event.queryStringParameters || {};

  try {
    switch (path) {
      case 'url':
        const scope = 'boards:read,pins:read,pins:write,user_accounts:read,boards:write';
        // Change to sandbox OAuth URL
        const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=sandbox`;
        return { statusCode: 200, headers, body: JSON.stringify({ url: authUrl }) };

      case 'token':
        if (!code && !refresh_token) {
          return { 
            statusCode: 400, 
            headers, 
            body: JSON.stringify({ error: 'Code or refresh token required' }) 
          };
        }

        const tokenResponse = await fetch(`${PINTEREST_API_URL}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: refresh_token ? 'refresh_token' : 'authorization_code',
            ...(code ? { code, redirect_uri: redirectUri } : { refresh_token }),
          }),
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          throw new Error(tokenData.error_description || tokenData.error || 'Token exchange failed');
        }

        if (code) {
          const userResponse = await fetch(`${PINTEREST_API_URL}/user_account`, {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
          });

          const userData = await userResponse.json();
          
          if (!userResponse.ok) {
            throw new Error(userData.message || 'Failed to fetch user data');
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ token: tokenData, user: userData }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ token: tokenData }),
        };

      case 'boards':
        const { access_token } = event.headers.authorization?.split(' ')[1] || {};
        if (!access_token) {
          return { 
            statusCode: 401, 
            headers, 
            body: JSON.stringify({ error: 'Unauthorized' }) 
          };
        }

        const boardsResponse = await fetch(`${PINTEREST_API_URL}/boards`, {
          headers: { 'Authorization': `Bearer ${access_token}` },
        });

        const boardsData = await boardsResponse.json();
        
        if (!boardsResponse.ok) {
          throw new Error(boardsData.message || 'Failed to fetch boards');
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(boardsData),
        };

      default:
        return { 
          statusCode: 404, 
          headers, 
          body: JSON.stringify({ error: 'Not found' }) 
        };
    }
  } catch (error) {
    console.error('Pinterest API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
    };
  }
};