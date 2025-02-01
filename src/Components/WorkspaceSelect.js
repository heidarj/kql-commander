import React, { useState, useEffect } from "react";
import { Button, Field, Tag, TagPicker, TagPickerControl, TagPickerGroup, TagPickerInput, TagPickerList, TagPickerOption } from '@fluentui/react-components';


export default function WorkspaceSelect({ availableWorkspaces, setAvailableWorkspaces, selectedWorkspaces, setSelectedWorkspaces, msalInstance }) {
	const tagPickerOptions = availableWorkspaces.filter(
		(option) => !selectedWorkspaces.some(
			(selected) => selected.name === option.name // Assuming workspaces have an 'id' property
			// Alternative if using name: selected.name === option.name
		)
	);

	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchWorkspaces = async () => {
			try {
				// Acquire token silently using MSAL
				const tokenRequest = {
					scopes: ["https://management.azure.com/user_impersonation"]
				};
				const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
				const accessToken = tokenResponse.accessToken;

				// Build the query payload.
				// If you don't have any subscription IDs, you can omit the subscriptions field.
				const payload = {
					query: "Resources | where type =~ 'microsoft.operationalinsights/workspaces' | project name, customerId = properties.customerId"
				};

				const response = await fetch(
					"https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2022-10-01",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${accessToken}`
						},
						body: JSON.stringify(payload)
					}
				);

				if (!response.ok) {
					throw new Error(`API error: ${response.statusText}`);
				}
				const data = await response.json();
				// The results are returned in the "value" array.
				setAvailableWorkspaces(data.data);
				setSelectedWorkspaces(data.data);
			} catch (err) {
				console.error("Error querying Resource Graph:", err);
				setError(err.message);
			}
		};

		fetchWorkspaces();
	}, []);

	const onOptionSelect = (event, data) => {
		if (data.value === "no-options") {
			return;
		}
		setSelectedWorkspaces(data.selectedOptions);
	};

	const handleAllClear = () => {
		if (selectedWorkspaces.length > 0) {
			setSelectedWorkspaces([]);
		}
		else {
			setSelectedWorkspaces(availableWorkspaces);
		}
	};

	return (
		<Field label="Select workspaces" >
			<TagPicker
				onOptionSelect={onOptionSelect}
				selectedOptions={selectedWorkspaces}
			>
				<TagPickerControl
					secondaryAction={
						<Button
							appearance="transparent"
							size="small"
							shape="rounded"
							onClick={handleAllClear}
						>
							{selectedWorkspaces.length > 0 ? "Clear All" : "Select All"}
						</Button>
					}
				>
					<TagPickerGroup aria-label="Selected workspaces">
						{selectedWorkspaces.map((option) => (
							<Tag
								key={option}
								shape="rounded"
								value={option}
							>
								{option.name}
							</Tag>
						))}
					</TagPickerGroup>
					<TagPickerInput aria-label="Select workspaces" />
				</TagPickerControl>
				<TagPickerList>
					{tagPickerOptions.length > 0 ? (
						tagPickerOptions.map((option) => (
							<TagPickerOption
								secondaryContent={option.id}
								value={option}
								key={option}
							>
								{option.name}
							</TagPickerOption>
						))
					) : (
						<TagPickerOption value="no-options">
							No options available
						</TagPickerOption>
					)}
				</TagPickerList>
			</TagPicker>
		</Field>
	)
}