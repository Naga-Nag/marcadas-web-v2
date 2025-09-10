<script lang="ts">
	import type { Departamento } from "$lib/types/gen";

	let {
		departamentos = [],
		selected = null,
		onSelect = () => {}
	}: {
		departamentos: Departamento[];
		selected: Departamento | null;
		onSelect: (depa: string) => void;
	} = $props();

	if (departamentos && departamentos.length > 0) {
		const idx = departamentos.findIndex(d => d.DeptName === 'ARPB');
		if (idx > 0) {
			const arpb = departamentos[idx];
			departamentos = [arpb, ...departamentos.slice(0, idx), ...departamentos.slice(idx + 1)];
		}
	}
</script>

<div class="selector-departamento">
	{#if departamentos.length === 0}
		<p>No hay departamentos disponibles</p>

	{:else}
		{#each departamentos as depa}
			<button class:selected={selected === depa} onclick={() => onSelect(depa.DeptName)}>
				{depa.DeptName}
			</button>
		{/each}
	{/if}
</div>

<style>
	.selector-departamento {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		overflow-x: auto;
		overflow-y: hidden;
		white-space: nowrap;
		max-width: 100%;
		padding: 1rem;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		border-radius: 16px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(226, 232, 240, 0.8);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		justify-content: center;
		flex-wrap: wrap;
	}

	.selector-departamento::-webkit-scrollbar {
		height: 6px;
	}

	.selector-departamento::-webkit-scrollbar-track {
		background: rgba(226, 232, 240, 0.3);
		border-radius: 3px;
	}

	.selector-departamento::-webkit-scrollbar-thumb {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 3px;
	}

	button {
		padding: 0.875rem 1.5rem;
		border-radius: 12px;
		border: 2px solid transparent;
		background: rgba(255, 255, 255, 0.8);
		color: #374151;
		cursor: pointer;
		font-weight: 600;
		font-size: 0.95rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
		min-height: 48px;
		white-space: nowrap;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		backdrop-filter: blur(10px);
	}

	button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
		transition: left 0.6s;
	}

	button:hover::before {
		left: 100%;
	}

	button:hover {
		background: rgba(102, 126, 234, 0.1);
		color: #4c51bf;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
		border-color: rgba(102, 126, 234, 0.2);
	}

	button:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	button.selected {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.25);
		transform: translateY(-1px);
	}

	button.selected::before {
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	}

	button.selected:hover {
		background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.35);
	}

	button:focus {
		outline: none;
		box-shadow: 
			0 6px 20px rgba(102, 126, 234, 0.15),
			0 0 0 3px rgba(102, 126, 234, 0.2);
	}

	button.selected:focus {
		box-shadow: 
			0 6px 20px rgba(102, 126, 234, 0.25),
			0 0 0 3px rgba(102, 126, 234, 0.3);
	}

	/* Mensaje de no departamentos */
	p {
		color: #6b7280;
		font-style: italic;
		text-align: center;
		margin: 0;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 12px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(226, 232, 240, 0.8);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.selector-departamento {
			gap: 0.5rem;
			padding: 0.75rem;
			justify-content: flex-start;
			flex-wrap: nowrap;
			overflow-x: auto;
		}

		button {
			padding: 0.75rem 1.25rem;
			font-size: 0.9rem;
			min-width: 120px;
			flex-shrink: 0;
		}
	}

	@media (max-width: 480px) {
		.selector-departamento {
			padding: 0.5rem;
			gap: 0.375rem;
		}

		button {
			padding: 0.625rem 1rem;
			font-size: 0.85rem;
			min-width: 100px;
		}
	}
</style>
