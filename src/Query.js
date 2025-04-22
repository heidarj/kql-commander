import { logAnalyticsRequest, acquireTokenWithFallback } from './AuthHelper';

export async function Query(query, selectedWorkspaces, msalInstance, timespan = 'P1D') {
    // Acquire token for Log Analytics with silent first and interactive fallback
    const tokenResponse = await acquireTokenWithFallback(msalInstance, logAnalyticsRequest);
    const accessToken = tokenResponse.accessToken;

    // Build request body, include timespan only if provided
    const payload = {
      query: query,
      workspaces: selectedWorkspaces.map(ws => ws.name),
      maxRows: 1001
    };
    if (timespan) payload.timespan = timespan;
    const response = await fetch(
        `https://api.loganalytics.io/v1/workspaces/${selectedWorkspaces[0].customerId}/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error (`Query error`, {cause: response});
    }

    return await response.json();
}

