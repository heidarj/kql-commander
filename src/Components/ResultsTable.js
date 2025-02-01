import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from './Card';
import { Checkbox } from '@fluentui/react-components';


export default function ResultsTable({ columns, rows }) {
	// Track expanded rows by group.
	const [expandedRowsByGroup, setExpandedRowsByGroup] = useState({});
	const [groupByTenant, setGroupByTenant] = useState(false);


	// Index of TenantId column if present.
	const tenantIdIndex = columns.findIndex((col) => col.name === 'TenantId');

	// Group rows if requested.
	function getDisplayRows() {
		if (tenantIdIndex < 0 || !groupByTenant) {
			return [{ tenantId: null, rowSet: rows }];
		}
		const groups = {};
		rows.forEach((row) => {
			const tId = row[tenantIdIndex];
			if (!groups[tId]) {
				groups[tId] = [];
			}
			groups[tId].push(row);
		});
		return Object.keys(groups).map((tid) => ({ tenantId: tid, rowSet: groups[tid] }));
	}

	// Toggle expand/collapse of a specific row.
	function toggleRow(groupIndex, rowIndex) {
		setExpandedRowsByGroup((prev) => {
			const expanded = new Set(prev[groupIndex] || []);
			if (expanded.has(rowIndex)) {
				expanded.delete(rowIndex);
			} else {
				expanded.add(rowIndex);
			}
			return {
				...prev,
				[groupIndex]: Array.from(expanded),
			};
		});
	}

	const displayRows = getDisplayRows();

	return (
		<div>
		{tenantIdIndex >= 0 && (
			<div className="flex items-center mb-4">
				<Checkbox
					checked={groupByTenant}
					onChange={(ev, data) => setGroupByTenant(data.checked)}
					label="Group by TenantId"
					/>
			</div>
		)}

		<Card className="shadow p-2">
			<CardContent>
				{columns.length > 0 ? (
					displayRows.map((group, gIndex) => (
						<div key={gIndex} className="mb-4">
							{groupByTenant && group.tenantId && (
								<div className="font-semibold mb-2">Tenant: {group.tenantId}</div>
							)}
							<div className="overflow-auto w-full">
								<table className="min-w-full border-collapse border border-gray-300 text-sm">
									<thead>
										<tr>
											<th className="w-8 border border-gray-200 px-2 py-1 bg-gray-100" />
											{columns.map((col) => (
												<th
													key={col.name}
													className="border border-gray-200 px-2 py-1 bg-gray-100 text-left"
												>
													{col.name}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{group.rowSet.map((row, rowIndex) => {
											const rowExpanded =
												expandedRowsByGroup[gIndex]?.includes(rowIndex) || false;
											return (
												<React.Fragment key={rowIndex}>
													<tr className="hover:bg-gray-50">
														{/* Expand icon cell */}
														<td
															onClick={() => toggleRow(gIndex, rowIndex)}
															className="border border-gray-200 px-2 py-1 cursor-pointer text-center"
														>
															{rowExpanded ? (
																<ChevronDown className="w-4 h-4 inline" />
															) : (
																<ChevronRight className="w-4 h-4 inline" />
															)}
														</td>
														{/* Row cells */}
														{row.map((cell, colIndex) => (
															<td key={colIndex} className="border border-gray-200 px-2 py-1">
																{String(cell)}
															</td>
														))}
													</tr>
													{rowExpanded && (
														<tr>
															<td colSpan={columns.length + 1} className="border border-gray-200 p-3 bg-gray-50">
																<ul className="list-disc pl-4">
																	{columns.map((col, i) => (
																		<li key={i} className="mb-1">
																			<strong>{col.name}: </strong>{String(row[i])}
																		</li>
																	))}
																</ul>
															</td>
														</tr>
													)}
												</React.Fragment>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					))
				) : (
					<div>Run a query to get started</div>
				)}
			</CardContent>
		</Card>
		</div>
	)
}