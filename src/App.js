import React, { useState, useEffect } from 'react';
import { Button, Textarea, Spinner } from '@fluentui/react-components';
import ResultsTable from './Components/ResultsTable';
import WorkspaceSelect from './Components/WorkspaceSelect';
import { AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { loginRequest, acquireTokenWithFallback, graphRequest, logAnalyticsRequest } from './AuthHelper';
import { Query } from './Query';
import Sidebar from './Components/Sidebar';
import ErrorView from './Components/Error';


function LogAnalyticsDashboard() {
	const [columns, setColumns] = useState([]);
	const [rows, setRows] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	// Workspace data and loading
	const [availableWorkspaces, setAvailableWorkspaces] = useState([]);
	const [workspacesLoading, setWorkspacesLoading] = useState(true);
	// Persist selectedWorkspaces in localStorage
	const [selectedWorkspaces, setSelectedWorkspaces] = useState(() => {
		const stored = localStorage.getItem('selectedWorkspaces');
		return stored ? JSON.parse(stored) : [];
	});

	// Store selections on change
	useEffect(() => {
		localStorage.setItem('selectedWorkspaces', JSON.stringify(selectedWorkspaces));
	}, [selectedWorkspaces]);

	// Query string and grouping.
	const [query, setQuery] = useState("");

	const { instance } = useMsal();

	// We'll store the history of queries as an array of objects.
	// Each object: { time: string, query: string, workspaces: string[] }
	const [queryHistory, setQueryHistory] = useState([]);
	// add timespan selection state with default of last 24 hours
	const [timespan, setTimespan] = useState('P1D');

	// Fetch availableWorkspaces on mount
	useEffect(() => {
		(async () => {
			try {
				const tokenResponse = await acquireTokenWithFallback(instance, graphRequest);
				const accessToken = tokenResponse.accessToken;

				const payload = { query: "Resources | where type =~ 'microsoft.operationalinsights/workspaces' | project name, customerId = properties.customerId" };
				const response = await fetch(
					"https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2022-10-01",
					{
						method: "POST",
						headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
						body: JSON.stringify(payload)
					}
				);
				if (!response.ok) throw new Error(`API error: ${response.statusText}`);
				const data = await response.json();
				setAvailableWorkspaces(data.data);
				// Update selectedWorkspaces: keep only existing, default to all if none
				const stored = JSON.parse(localStorage.getItem('selectedWorkspaces'));
				if (stored && stored.length) {
					const valid = stored.filter(sw => data.data.some(ws => ws.customerId === sw.customerId));
					setSelectedWorkspaces(valid.length ? valid : data.data);
				} else {
					setSelectedWorkspaces(data.data);
				}
			} catch (err) {
				setError(err);
			} finally {
				setWorkspacesLoading(false);
			}
		})();
	}, [instance]);

	// Show loading screen while fetching workspaces
	if (workspacesLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Spinner labelPosition="below" label="Loading workspaces..." />
			</div>
		);
	}

	// Placeholder for actually running the query.
	async function runQuery() {
		setLoading(true);
		// include timespan in the query call
		Query(query, selectedWorkspaces, instance, timespan).then((res) => {
			setColumns(res.tables[0].columns);
			setRows(res.tables[0].rows);
			// Create new query entry with the current time.
			const newEntry = {
				time: new Date().toLocaleTimeString("en-GB"),
				query,
				workspaces: selectedWorkspaces,
                timespan,
			};
			// Update queryHistory: remove duplicate and add newEntry at the beginning.
			setQueryHistory((prev) => {
				const withoutDuplicate = prev.filter((item) => item.query !== query);
				return [newEntry, ...withoutDuplicate];
			});
			setError(null);
		}).catch(async (error) => {
			if (error.cause.status === 400) {
				const errorBody = await error.cause.json()
				if (errorBody.error) {
					setError(errorBody.error);
				}
				else {
					setError("Error querying Log Analytics");
				}
			}
		}).finally(() => {
			setLoading(false);
		});
	}

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<Sidebar queryHistory={queryHistory} setQuery={setQuery} setSelectedWorkspaces={setSelectedWorkspaces} setTimespan={setTimespan} />
			<div className="flex-1 w-64 p-4 overflow-y-auto">
				<h1 className="text-2xl font-bold mb-4">Log Analytics Query Results</h1>

				<div className="flex flex-col gap-4 mb-4">
					<WorkspaceSelect availableWorkspaces={availableWorkspaces} setAvailableWorkspaces={setAvailableWorkspaces} selectedWorkspaces={selectedWorkspaces} setSelectedWorkspaces={setSelectedWorkspaces} msalInstance={instance} />
					{/* Time range selector */}
					<div>
						<div className="mb-2">Time Range:</div>
						<select value={timespan} onChange={(e) => setTimespan(e.target.value)} className="px-2 py-1 border w-full">
							<option value="">Set in query</option>
							<option value="PT1H">Last 1 hour</option>
							<option value="PT4H">Last 4 hours</option>
							<option value="PT12H">Last 12 hours</option>
							<option value="P1D">Last 24 hours</option>
							<option value="P2D">Last 2 days</option>
							<option value="P3D">Last 3 days</option>
							<option value="P7D">Last 7 days</option>
							<option value="P30D">Last 30 days</option>
						</select>
					</div>
					{/* Multiline query text area */}
					<div>
						<div className="mb-2">Query:</div>
						<Textarea
							resize="vertical"
							placeholder="Enter your query..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							rows={4}
							className="px-2 py-1 w-full"
						/>
					</div>

					{/* Button */}
					<div>
						<Button onClick={runQuery} disabled={loading}>Run Query</Button>
					</div>
				</div>
				{loading ? (
					<Spinner size="huge" labelPosition="below" label="Executing..." />
				) : error ? (
					<ErrorView error={error} />
				) : (
					<ResultsTable columns={columns} rows={rows} availableWorkspaces={availableWorkspaces} />
				)}
			</div>
		</div>
	);
}

export default function App() {
	const { instance } = useMsal();

	// After login, request resource permissions (incremental consent)
	useEffect(() => {
		const accounts = instance.getAllAccounts();
		if (accounts.length > 0) {
			// Request graph permissions
			acquireTokenWithFallback(instance, graphRequest);
			// Request log analytics permissions
			acquireTokenWithFallback(instance, logAnalyticsRequest);
		}
	}, [instance]);

	const handleRedirect = () => {
		instance
			.loginRedirect({
				...loginRequest,
			})
			.catch((error) => console.log(error));
	};

	return (
		<div className="App">
			<AuthenticatedTemplate>
				<LogAnalyticsDashboard />
			</AuthenticatedTemplate>
			<UnauthenticatedTemplate>
				<div className="min-h-screen flex items-center justify-center bg-gray-100">
					{/* Card container */}
					<div className="bg-white rounded-2xl shadow p-6 w-full max-w-sm">
						<h1 className="text-2xl font-bold mb-4">Sign In</h1>
						<p className="mb-6 text-gray-600">Sign in securely with Microsoft.</p>
						<Button className="signInButton" onClick={handleRedirect} variant="primary">
							Login
						</Button>
					</div>
				</div>
			</UnauthenticatedTemplate>
		</div>
	);
}