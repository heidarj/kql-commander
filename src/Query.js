export async function Query(query, selectedWorkspaces, msalInstance) {
    // Acquire token silently using MSAL
    const tokenRequest = {
      scopes: ["https://api.loganalytics.io/Data.Read"]
    };
    const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
    const accessToken = tokenResponse.accessToken;

    const response = await fetch(
	 `https://api.loganalytics.io/v1/workspaces/${selectedWorkspaces[0].customerId}/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: query,
          workspaces: selectedWorkspaces.map(ws => ws.name)
        })
      }
    );

    if (!response.ok) {
      throw new Error (`Query error`, {cause: response});
    }

    return await response.json();
}

