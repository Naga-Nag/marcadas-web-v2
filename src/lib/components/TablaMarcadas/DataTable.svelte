<script lang="ts">
	import { List } from 'svelte-virtual';
	import EditableCell from './EditableCell.svelte';
	import type { shortUsuario } from '$lib/types/gen';

	type columnsType = {
		id: string;
		header: string;
		width?: number;
		type?: 'text' | 'checkbox'; // Optional type for cell content
	};

	let { columns, data, editable, onCellEdit, usuario }: {
		columns: Array<columnsType>;
		data: Array<Record<string, any>>;
		editable: boolean;
		onCellEdit?: (rowIndex: number, colId: string, newValue: string) => void;
		usuario: shortUsuario;
	} = $props();

	let filter = $state('');
	let sortColumn: string | null = $state(null);
	let sortAsc = $state(true);

	const rowHeight = 40;
	const tableHeight = 500;

	// Utility to get nested value by path (e.g. "Personal.Nombre")
	function getValue(obj: any, path: string) {
		return path.split('.').reduce((acc, part) => acc && acc[part], obj);
	}

	const derivedData = $derived.by(() => {
		let result = data;

		if (filter) {
			result = result.filter((row) =>
				columns.some((col) =>
					String(getValue(row, col.id) ?? '')
						.toLowerCase()
						.includes(filter.toLowerCase())
				)
			);
		}

		if (sortColumn) {
			result = [...result].sort((a, b) => {
				const col = sortColumn!;
				const valA = getValue(a, col);
				const valB = getValue(b, col);
				if (valA === valB) return 0;
				if (valA == null) return 1;
				if (valB == null) return -1;
				return (valA > valB ? 1 : -1) * (sortAsc ? 1 : -1);
			});
		}

		return result;
	});

	function setSort(colId: string) {
		if (sortColumn === colId) {
			sortAsc = !sortAsc;
		} else {
			sortColumn = colId;
			sortAsc = true;
		}
	}

	function clearFiltersAndSorts() {
		filter = '';
		sortColumn = null;
		sortAsc = true;
	}
</script>

<div class="table-controls">
	<input type="text" placeholder="Filtrar..." bind:value={filter} class="filter-input" />
	<button type="button" onclick={clearFiltersAndSorts} class="clear-btn">X</button>
	{#if usuario.role === 'ADMIN'}
		<button onclick={() => (editable = !editable)} style="font-size: 1.2em; margin-left: 10px;">
		{editable ? '✅ Guardar' : '✏️ Editar'}
	</button>
	{/if}
	
</div>

<div class="table-wrapper">
	<div class="table-header">
		{#each columns as col}
			<button
				type="button"
				class="cell header"
				style="width: {col.width ? col.width + 'px' : 'auto'}"
				onclick={() => setSort(col.id)}
				aria-pressed={sortColumn === col.id}
				tabindex="0"
			>
				{col.header}
				{#if sortColumn === col.id}
					{sortAsc ? ' ▲' : ' ▼'}
				{/if}
			</button>
		{/each}
	</div>
	<div class="table-body">
		{#key `${derivedData.length}:${sortColumn ?? ''}:${filter}`}
			<List itemCount={derivedData.length} itemSize={rowHeight} height={tableHeight}>
				{#snippet item({ index, style })}
					<div class="row" {style}>
						{#each columns as col}
							<div class="cell" style="width: {col.width ? col.width + 'px' : 'auto'}">
								<EditableCell
									{editable}
									value={getValue(derivedData[index], col.id)}
									type={col.type}
									onEdit={(newValue) => onCellEdit && onCellEdit(index, col.id, newValue)}
								/>
							</div>
						{/each}
					</div>
				{/snippet}
			</List>
		{/key}
	</div>
</div>

<style>
	.table-controls {
		display: flex;
		padding: 0.5em;
		
	}
	.filter-input {
		padding: 0.3em 0.6em;
		font-size: 1em;
		width: 200px;
		border: 1px solid #ccc;
		border-radius: 4px;
		outline: none;
		transition: border-color 0.3s;
	}

	.filter-input:focus {
		border-color: #007bff;
	}

	.clear-btn {
		padding: 0.3em 0.8em;
		font-size: 1em;
		cursor: pointer;
		background: #f44336;
		color: white;
		border: none;
		border-radius: 4px;
		transition: background 0.3s;
	}
	.clear-btn:hover {
		background: #d32f2f;
	}
	.table-wrapper {
		width: 100%;
		max-width: 100vw;
		max-height: 80vh;
		overflow: hidden;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border: 1px solid #ccc;
		margin-top: 1em;
	}
	.table-header {
		display: flex;
		width: 100%;
		background: #f5f5f5;
		border: none;
		outline: none;
		border-bottom: 2px solid #ccc;
		position: sticky;
		top: 0;
		z-index: 1;
	}
	.table-body {
		overflow-y: auto;
		height: 500px;
		width: 100%;
	}
	.row {
		display: flex;
		width: 100%;
		border-bottom: 1px solid #eee;
		background: #fff;
	}
	.cell {
		flex: 1 1 0;
		min-width: 0;
		padding: 6px 10px;
		box-sizing: border-box;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 1.05em;
		letter-spacing: 0.02em;
		border-right: 1px solid #eee;
		background: transparent;
	}
	.cell:last-child {
		border-right: none;
	}
	.row:nth-child(even) .cell {
		background: #f0f0f0;
	}
	.header {
		font-weight: bold;
		cursor: pointer;
		user-select: none;
		background: #f5f5f5;
		border: none;
	}
</style>
