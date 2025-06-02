<script lang="ts">
	let {
		departamentos = [],
		selected = null,
		onSelect = () => {}
	}: {
		departamentos: string[];
		selected: string | null;
		onSelect: (depa: string) => void;
	} = $props();

	if (departamentos && departamentos.length > 0) {
		const idx = departamentos.indexOf('ARPB');
		if (idx > 0) {
			departamentos = ['ARPB', ...departamentos.slice(0, idx), ...departamentos.slice(idx + 1)];
		}
	}
</script>

<div class="selector-departamento">
	{#if departamentos.length === 0}
		<p>No hay departamentos disponibles</p>

    {:else}
		{#each departamentos as depa}
			<button class:selected={selected === depa} onclick={() => onSelect(depa)}>
				{depa}
			</button>
		{/each}
	{/if}
</div>

<style>
	.selector-departamento {
		display: flex;
		gap: 0.5em;
		margin-bottom: 1em;
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
