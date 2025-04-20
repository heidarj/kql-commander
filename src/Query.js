export async function Query(query, selectedWorkspaces, msalInstance, timespan = 'P1D') {
    // Acquire token silently using MSAL
    const tokenRequest = {
      scopes: ["https://api.loganalytics.io/Data.Read"]
    };
    const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
    const accessToken = tokenResponse.accessToken;

    // Build request body, include timespan only if provided
    const payload = {
      query: query,
      workspaces: selectedWorkspaces.map(ws => ws.name)
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

