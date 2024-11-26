import { Handler } from '@netlify/functions';

const clientId = '1507772';
const clientSecret = '12e86e7dd050a39888c5e753908e80fae94f7367';
const redirectUri = 'https://adorable-shortbread-ea235b.netlify.app/callback';

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  const path = event.queryStringParameters?.path;

  if (path === '/oauth/url') {
    const scope = 'boards:read,pins:read,pins:write,user_accounts:read,boards:write';
    const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: authUrl })
    };
  }

  if (event.queryStringParameters?.code) {
    const code = event.queryStringParameters.code;
    
    try {
      const tokenResponse = await fetch('https://api.pinterest.com/v5/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Token error:', tokenData);
        return {
          statusCode: tokenResponse.status,
          headers,
          body: JSON.stringify({
            error: tokenData.error_description || tokenData.error || 'Failed to exchange token',
          }),
        };
      }

      const userResponse = await fetch('https://api.pinterest.com/v5/user_account', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        console.error('User info error:', userData);
        return {
          statusCode: userResponse.status,
          headers,
          body: JSON.stringify({
            error: userData.message || 'Failed to fetch user information',
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token: tokenData,
          user: userData,
        }),
      };
    } catch (error) {
      console.error('Auth error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Authentication failed',
        }),
      };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found' }),
  };
};