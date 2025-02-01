import { List, ListItem } from '@fluentui/react-components';

export default function Sidebar({queryHistory, setQuery, setSelectedWorkspaces}) {

	return (
		<div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
			<h3 className="text-2xl font-bold mb-4">Past queries</h3>
			<List navigationMode="items">
				{queryHistory.length > 0 && queryHistory
					.map((query) => (
						<ListItem
							key={query.name}
							onAction={() => {
								setQuery(query.query);
								setSelectedWorkspaces(query.workspaces);
							}}
							className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
						>
							<span className="p-4 text-lg font-medium text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out max-w-full">
								<div className="text-lg font-semibold">{query.time}</div>
								<div className="text-sm text-gray-500 truncate">{query.query}</div>
								<div className="text-sm text-gray-500">{query.workspaces.length} workspaces</div>
							</span>
						</ListItem>
					))}
			</List>
		</div>
	);
}