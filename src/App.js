import React, { useState } from 'react';
import { Button, Textarea, Spinner } from '@fluentui/react-components';
import ResultsTable from './Components/ResultsTable';
import WorkspaceSelect from './Components/WorkspaceSelect';
import { AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { loginRequest } from './AuthHelper';
import { Query } from './Query';
import Sidebar from './Components/Sidebar';
import ErrorView from './Components/Error';


function LogAnalyticsDashboard() {
	const [columns, setColumns] = useState([]);
	const [rows, setRows] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	// Query string and grouping.
	const [query, setQuery] = useState("");

	const { instance } = useMsal();

	const [availableWorkspaces, setAvailableWorkspaces] = useState([]);
	// We'll store an array of selected workspace IDs.
	const [selectedWorkspaces, setSelectedWorkspaces] = useState([]);


	// We'll store the history of queries as an array of objects.
	// Each object: { time: string, query: string, workspaces: string[] }
	const [queryHistory, setQueryHistory] = useState([]);


	// Placeholder for actually running the query.
	async function runQuery() {
		setLoading(true);
		Query(query, selectedWorkspaces, instance).then((res) => {
			setColumns(res.tables[0].columns);
			setRows(res.tables[0].rows);
			// Create new query entry with the current time.
			const newEntry = {
				time: new Date().toLocaleTimeString("en-GB"),
				query,
				workspaces: selectedWorkspaces,
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
			<Sidebar queryHistory={queryHistory} setQuery={setQuery} setSelectedWorkspaces={setSelectedWorkspaces} />
			<div className="flex-1 w-64 p-4 overflow-y-auto">
				<h1 className="text-2xl font-bold mb-4">Log Analytics Query Results</h1>

				<div className="flex flex-col gap-4 mb-4">
					<WorkspaceSelect availableWorkspaces={availableWorkspaces} setAvailableWorkspaces={setAvailableWorkspaces} selectedWorkspaces={selectedWorkspaces} setSelectedWorkspaces={setSelectedWorkspaces} msalInstance={instance} />

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
					<ResultsTable columns={columns} rows={rows} />
				)}
			</div>
		</div>
	);
}

export default function App() {
	const { instance } = useMsal();

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