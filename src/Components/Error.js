export default function ErrorView({ error }) {
	if (!error) return null;

	return (
		<div className="ml-2">
			<div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
				<div className="text-sm font-bold">Error: {error.code}</div>
				<div className="text-xs">{error.message}</div>
				{error.innererror && (
					<div className="border-l-2 border-red-400 ml-2 pl-2 mt-1">
						<div className="text-xs italic text-red-500">Caused by:</div>
						<ErrorView error={error.innererror} />
					</div>
				)}
			</div>
		</div>
	);
};