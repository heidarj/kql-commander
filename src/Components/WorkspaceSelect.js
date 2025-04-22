import React, { useState } from "react";
import { Button, Field, Tag, TagPicker, TagPickerControl, TagPickerGroup, TagPickerInput, TagPickerList, TagPickerOption } from '@fluentui/react-components';


export default function WorkspaceSelect({ availableWorkspaces, selectedWorkspaces, setSelectedWorkspaces }) {
	/* const tagPickerOptions = availableWorkspaces.filter(
		(option) => !selectedWorkspaces.some(
			(selected) => selected.name === option.name // Assuming workspaces have an 'id' property
			// Alternative if using name: selected.name === option.name
		)
	); */

	const tagPickerOptions = availableWorkspaces.filter(
		(option) => !selectedWorkspaces.includes(option)
	  );

	const [open, setOpen] = useState(false);

	// Workspace fetching is handled at the App level

	const onOptionSelect = (event, data) => {
		if (data.value === "no-options") {
			return;
		}
		console.log("Selected option:", data.value);
		setSelectedWorkspaces(data.selectedOptions);
	};

	const onOpenChange = (_, data) => {
		if (!data.open && data.type === "blur") {
			setOpen(false);
		} else {
			setOpen(true);
		}
	}

	const handleAllClear = () => {
		if (selectedWorkspaces.length > 0) {
			setSelectedWorkspaces([]);
		}
		else {
			setSelectedWorkspaces(availableWorkspaces);
		}
	};



	return (
		<div>
			<Field label="Select workspaces" >
				<TagPicker
					onOptionSelect={onOptionSelect}
					selectedOptions={selectedWorkspaces}
					onOpenChange={onOpenChange}
					open={open}
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
									key={option.customerId}
									shape="rounded"
									value={option}
								>
									{option.name}
								</Tag>
							))}
						</TagPickerGroup>
						<TagPickerInput aria-label="Select workspaces" />
					</TagPickerControl>
					<TagPickerList positioning={{ position: "below", autoSize: true, pinned: true }} >
						{tagPickerOptions.length > 0 ? (
							tagPickerOptions.map((option) => (
								<TagPickerOption
									value={option}
									key={option.customerId}
								>
									{option.name}
								</TagPickerOption>
							))
						) : "No options available" }
					</TagPickerList>
				</TagPicker>
			</Field>
		</div>
	)
}