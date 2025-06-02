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
		gap: 0.5em;
		margin-bottom: 1em;
		overflow-x: auto;
		overflow-y: hidden;
		white-space: nowrap;
		max-width: 100%;
	}
	button {
		padding: 0.7em 1.2em;
		border-radius: 4px;
		border: 1px solid #007bff;
		background: #fff;
		color: #000000;
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}
	button.selected,
	button:hover {
		background: #007bff;
		color: #fff;
	}
</style>
