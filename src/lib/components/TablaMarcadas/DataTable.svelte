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

	let {
		columns,
		data,
		editable,
		onCellEdit,
		usuario
	}: {
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
	<div class="search-bar">
		<input type="text" placeholder="Filtrar..." bind:value={filter} class="filter-input" />
		<button type="button" onclick={clearFiltersAndSorts} class="clear-btn">X</button>
	</div>

	{#if usuario.role === 'ADMIN'}
		<button class="editar-button" onclick={() => (editable = !editable)}>
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
	.editar-button {
		outline: none;
		border-radius: 6px;

	}
	.search-bar {
		display: flex;
		flex-wrap: nowrap;
	}
	.table-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		border-radius: 16px 16px 0 0;
		border-bottom: 1px solid rgba(226, 232, 240);
		flex-wrap: wrap;
	}

	.filter-input {
		padding: 0.75rem 1rem;
		font-size: 0.95rem;
		min-width: 240px;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.9);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 500;
		color: #374151;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.filter-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow:
			0 0 0 4px rgba(102, 126, 234, 0.1),
			0 4px 6px -1px rgba(0, 0, 0, 0.1);
		background: rgba(255, 255, 255, 1);
	}

	.filter-input::placeholder {
		color: #9ca3af;
		font-weight: 400;
	}

	.clear-btn {
		padding: 0.75rem 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		background: red;
		color: white;
		border: none;
		border-radius: 12px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.table-wrapper {
		position: relative;
		width: 100%;
		max-width: 100%;
		max-height: 80vh;
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04),
			0 0 0 1px rgba(102, 126, 234, 0.05);
		border: 1px solid rgba(226, 232, 240, 0.8);
		background: rgba(255, 255, 255, 0.95);
	}

	.table-header {
		display: flex;
		position: relative;
		width: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		outline: none;
	}

	.table-body {
		overflow-y: auto;
		width: 100%;
		background: rgba(255, 255, 255, 0.95);
	}

	.row {
		display: flex;
		position: relative;
		width: 100%;
		border-bottom: 1px solid rgba(226, 232, 240, 0.5);
		background: rgba(255, 255, 255, 0.8);
		transition: all 0.2s ease;
	}

	.row:hover {
		background: rgba(102, 126, 234, 0.05);
		transform: scale(1.001);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.cell {
		flex: 1 1 0;
		min-width: 0;
		padding: 0.875rem 1rem;
		box-sizing: border-box;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 0.95rem;
		font-weight: 500;
		letter-spacing: 0.025em;
		border-right: 1px solid rgba(226, 232, 240, 0.5);
		background: transparent;
		color: #374151;
		transition: all 0.2s ease;
	}

	.cell:last-child {
		border-right: none;
	}

	.row:nth-child(even) .cell {
		background: rgba(248, 250, 252, 0.8);
	}

	.row:nth-child(even):hover .cell {
		background: rgba(102, 126, 234, 0.08);
	}

	.header {
		font-weight: 700;
		cursor: pointer;
		user-select: none;
		background: transparent;
		border: none;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.875rem;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.header::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transition: left 0.6s;
	}

	.header:hover::before {
		left: 100%;
	}

	.header:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
	}

	.header:active {
		transform: translateY(0);
	}

	.header[aria-pressed='true'] {
		background: rgba(255, 255, 255, 0.15);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	/* Scrollbar personalizada */
	.table-body::-webkit-scrollbar {
		width: 8px;
	}

	.table-body::-webkit-scrollbar-track {
		background: rgba(226, 232, 240, 0.3);
		border-radius: 4px;
	}

	.table-body::-webkit-scrollbar-thumb {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 4px;
	}

	.table-body::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
	}

	/* Botón de edición mejorado */
	button[onclick*='editable'] {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		color: white;
		border: none;
		border-radius: 12px;
		padding: 0.75rem 1.25rem;
		font-weight: 600;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
		position: relative;
		overflow: hidden;
		min-height: 44px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	button[onclick*='editable']::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s;
	}

	button[onclick*='editable']:hover::before {
		left: 100%;
	}

	button[onclick*='editable']:hover {
		background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
	}

	button[onclick*='editable']:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.table-controls {
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
			padding: 1rem;
		}

		.filter-input {
			min-width: 100%;
		}

		.cell {
			padding: 0.625rem 0.75rem;
			font-size: 0.9rem;
		}

		.header {
			font-size: 0.8rem;
		}

		.table-body {
			height: 400px;
		}
	}

	@media (max-width: 480px) {
		.table-controls {
			padding: 0.75rem;
		}

		.cell {
			padding: 0.5rem;
			font-size: 0.85rem;
		}

		.table-body {
			height: 350px;
		}
	}
</style>
