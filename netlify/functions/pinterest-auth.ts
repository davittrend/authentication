import { Handler } from '@netlify/functions';

const clientId = '1507772';
const clientSecret = '12e86e7dd050a39888c5e753908e80fae94f7367';
const redirectUri = process.env.REDIRECT_URI || 'http://localhost:8888/.netlify/functions/pinterest-auth';

export const handler: Handler = async (event) => {
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

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
      }

      const tokenData = await tokenResponse.json();

      const userResponse = await fetch('https://api.pinterest.com/v5/user_account', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error(`User info failed: ${await userResponse.text()}`);
      }

      const userData = await userResponse.json();

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Successful</title>
              <script>
                window.opener.postMessage({ type: 'PINTEREST_AUTH_SUCCESS', data: ${JSON.stringify({
                  token: tokenData,
                  user: userData,
                })} }, '*');
                window.close();
              </script>
            </head>
            <body>
              <h1>Authentication successful! You can close this window.</h1>
            </body>
          </html>
        `,
      };
    } catch (error) {
      console.error('Auth error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Authentication failed' }),
      };
    }
  }

  if (event.path.endsWith('/oauth/url')) {
    const scope = 'boards:read,pins:read,pins:write,user_accounts:read,boards:write';
    const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ url: authUrl }),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not found' }),
  };
};