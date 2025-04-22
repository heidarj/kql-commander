import React, { useState, useRef, useMemo } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { Card, CardContent } from './Card';
import { CardHeader, Checkbox } from '@fluentui/react-components';


export default function ResultsTable({ columns, rows, availableWorkspaces }) {
	// Track expanded rows by group.
	const [expandedRowsByGroup, setExpandedRowsByGroup] = useState({});
	const [groupByTenant, setGroupByTenant] = useState(false);
	// Track collapsed groups
	const [collapsedGroups, setCollapsedGroups] = useState({});
    // Track sorting state
    const [sortColumn, setSortColumn] = useState('TimeGenerated');
    const [sortOrder, setSortOrder] = useState('desc');

	// Index of TenantId column if present.
	const tenantIdIndex = columns.findIndex((col) => col.name === 'TenantId');

	// Helper to find workspace name by customerId
	function getWorkspaceName(id) {
		const ws = availableWorkspaces.find(w => w.customerId === id);
		return ws ? ws.name : id;
	}

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
	// Toggle collapse of entire group
	function toggleGroup(groupIndex) {
		setCollapsedGroups(prev => ({
			...prev,
			[groupIndex]: !prev[groupIndex]
		}));
	}

    // Handle column sorting
    function handleSort(columnName) {
      if (sortColumn === columnName) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(columnName);
        setSortOrder('asc');
      }
    }

    // State for column widths
    const [colWidths, setColWidths] = useState(() =>
        columns.reduce((obj, col) => { obj[col.name] = 300; return obj; }, {})
    );
    const resizingCol = useRef(null);
    const startX = useRef(0);
    const startWidth = useRef(0);
    function onMouseDown(e, colName) {
        e.preventDefault();
		console.log("onMouseDown", colName);
        resizingCol.current = colName;
        startX.current = e.clientX;
        startWidth.current = colWidths[colName];
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
    function onMouseMove(e) {
        if (!resizingCol.current) return;
		console.log("onMouseMove", resizingCol.current);
        const delta = e.clientX - startX.current;
        const newWidth = Math.max(50, startWidth.current + delta);
        setColWidths(prev => ({ ...prev, [resizingCol.current]: newWidth }));
    }
    function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        resizingCol.current = null;
    }

    // Calculate total table width: first column + all data columns
    const totalTableWidth = useMemo(() => {
        return 32 + columns.reduce((sum, col) => sum + colWidths[col.name], 0);
    }, [colWidths, columns]);

	const displayRows = getDisplayRows();

	return (
		<div>
			{/* Total rows count when not grouping */}
			{
				<div className="mb-2 font-medium">Total rows: {rows.length}</div>
			}
			{tenantIdIndex >= 0 && (
				<div className="flex items-center mb-4">
					<Checkbox
						checked={groupByTenant}
						onChange={(ev, data) => setGroupByTenant(data.checked)}
						label="Group by TenantId"
					/>
				</div>
			)}

			
					{columns.length > 0 ? (
						displayRows.map((group, gIndex) => (
							<div key={gIndex} className="mb-4">
								<Card className="shadow p-2">
									<CardHeader>
									</CardHeader>
									<CardContent>
										{/* Group header for collapse and name */}
										{groupByTenant && group.tenantId && (
														<div
															className="flex items-center justify-between font-semibold mb-2 cursor-pointer"
															onClick={() => toggleGroup(gIndex)}
														>
															<div className="flex items-center">
																{collapsedGroups[gIndex] ? (
																	<ChevronRight className="w-4 h-4 mr-1" />
																) : (
																	<ChevronDown className="w-4 h-4 mr-1" />
																)}
																Workspace: {getWorkspaceName(group.tenantId)} ({group.rowSet.length} rows)
															</div>
														</div>
													)}
								{/* Skip rendering table if collapsed */}
								{!(groupByTenant && group.tenantId && collapsedGroups[gIndex]) && (
									<div className="overflow-auto">
										<table
											className="border-collapse border border-gray-300 text-sm"
											style={{ width: totalTableWidth, tableLayout: 'fixed' }}
										>
											<colgroup key={totalTableWidth}>
												{/* first narrow column for expand icon */}
												<col style={{ width: '32px' }} />
												{columns.map(col => (
													<col key={col.name} style={{ width: colWidths[col.name] + 'px' }} />
												))}
											</colgroup>
											<thead>
												<tr>
													<th className="border border-gray-200 px-2 py-1 bg-gray-100" />
													{columns.map((col) => (
														<th
															key={col.name}
															className="border border-gray-200 px-0 py-1 bg-gray-100"
														>
															<div className="relative flex items-center h-full">
																<div
																	className="truncate flex-grow px-2 cursor-pointer"
																	onClick={() => handleSort(col.name)}
																>
																	{col.name}
																	{sortColumn === col.name && (
																		sortOrder === 'asc'
																			? <ChevronUp className="w-4 h-4 inline ml-1" />
																			: <ChevronDown className="w-4 h-4 inline ml-1" />
																	)}
																</div>
																<div
																	className="absolute top-0 bottom-0 right-0 w-2 -ml-1 cursor-ew-resize z-10 select-none hover:bg-gray-300"
																	onMouseDown={(e) => onMouseDown(e, col.name)}
																/>
															</div>
														</th>
													))}
												</tr>
											</thead>
											<tbody>
												{[...group.rowSet]
												  .sort((a, b) => {
													const cIdx = columns.findIndex(c => c.name === sortColumn);
													const aVal = a[cIdx];
													const bVal = b[cIdx];
													const aDate = new Date(aVal);
													if (!isNaN(aDate)) {
														const diff = aDate - new Date(bVal);
														return sortOrder === 'asc' ? diff : -diff;
													}
													return sortOrder === 'asc'
														? String(aVal).localeCompare(String(bVal))
														: String(bVal).localeCompare(String(aVal));
												 })
												 .map((row, rowIndex) => {
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
																		<td
																			key={colIndex}
																			className="border border-gray-200 px-2 py-1 truncate"
																		>
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
								)}
								</CardContent>
								</Card>
							</div>
						))
					) : (
						<div>Run a query to get started</div>
					)}

		</div>
	)
}