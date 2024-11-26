import { Handler, schedule } from '@netlify/functions';
import { format } from 'date-fns';

const PINTEREST_API_URL = 'https://api.pinterest.com/v5';

interface ScheduledPin {
  id: string;
  title: string;
  description: string;
  link?: string;
  imageUrl: string;
  boardId: string;
  scheduledTime: string;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
}

// Run every 5 minutes
const handler: Handler = schedule('*/5 * * * *', async (event) => {
  console.log('Checking for pins to publish...');

  try {
    // Get all scheduled pins from database/storage
    const scheduledPins = JSON.parse(process.env.SCHEDULED_PINS || '[]') as ScheduledPin[];
    const now = new Date();

    // Filter pins that need to be published
    const pinsToPublish = scheduledPins.filter(pin => {
      const scheduledTime = new Date(pin.scheduledTime);
      return (
        pin.status === 'scheduled' &&
        scheduledTime <= now
      );
    });

    if (pinsToPublish.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No pins to publish at this time' })
      };
    }

    // Publish each pin
    const results = await Promise.allSettled(
      pinsToPublish.map(async (pin) => {
        try {
          const pinData = {
            title: pin.title,
            description: pin.description,
            board_id: pin.boardId,
            media_source: {
              source_type: 'image_url',
              url: pin.imageUrl
            },
            ...(pin.link && { link: pin.link })
          };

          const response = await fetch(`${PINTEREST_API_URL}/pins`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(pinData)
          });

          if (!response.ok) {
            throw new Error(`Failed to publish pin: ${response.statusText}`);
          }

          const data = await response.json();
          return { pin, success: true, pinterestId: data.id };
        } catch (error) {
          return { 
            pin, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      })
    );

    // Update pin statuses
    const updatedPins = scheduledPins.map(pin => {
      const result = results.find(r => {
        const p = (r.value || r.reason)?.pin;
        return p?.id === pin.id;
      });

      if (!result) return pin;

      if (result.status === 'fulfilled' && result.value.success) {
        return {
          ...pin,
          status: 'published',
          pinterestId: result.value.pinterestId,
          publishedAt: new Date().toISOString()
        };
      } else {
        return {
          ...pin,
          status: 'failed',
          error: result.status === 'rejected' ? 
            result.reason?.message : 
            (result.value as any)?.error
        };
      }
    });

    // Save updated pins
    process.env.SCHEDULED_PINS = JSON.stringify(updatedPins);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Published ${results.filter(r => r.status === 'fulfilled').length} pins`,
        results
      })
    };
  } catch (error) {
    console.error('Scheduler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    };
  }
});

export { handler };