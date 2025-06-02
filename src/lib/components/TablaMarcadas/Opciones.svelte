<script lang="ts">
	import { onMount } from 'svelte';
	let open = $state(false);
	let selected = $state('delDia');

	let {
		selectedOpcion = $bindable(),
		ocultarInactivos = $bindable()
	}: { selectedOpcion: string; ocultarInactivos: boolean } = $props();

	const opciones = [
		{ value: 'delDia', label: 'Marcadas del día' },
		{ value: 'estandar', label: 'Marcadas estándar' }
	];

	function selectOpcion(value: string) {
		selected = value;
		open = false;
		selectedOpcion = value;
	}

	function toggleInactivos() {
		ocultarInactivos = !ocultarInactivos;
	}

	onMount(() => {
		if (selectedOpcion) selected = selectedOpcion;
		if (ocultarInactivos !== undefined) ocultarInactivos = ocultarInactivos;
		
		// Si clickea fuera del menú, lo cierra
		document.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.opciones-dropdown')) {
				open = false;
			}
		});
	});
</script>

<div class="opciones-dropdown">
	<button class="opciones-btn" onclick={() => (open = !open)}>
		<img src="cog.png" alt="Opciones" width="30" height="30" />
		<span class="arrow">{open ? '▲' : '▼'}</span>
	</button>
	{#if open}
		<div class="opciones-menu">
			<div class="radio-group">
				{#each opciones as opcion}
					<label class="radio-label">
						<input
							type="radio"
							name="tipo-marcada"
							value={opcion.value}
							checked={selected === opcion.value}
							onchange={() => selectOpcion(opcion.value)}
						/>
						{opcion.label}
					</label>
				{/each}
			</div>
			<hr />
			<div class="checkbox-group">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={ocultarInactivos} />
					Ocultar personal inactivo
				</label>
			</div>
		</div>
	{/if}
</div>

<style>
	.opciones-dropdown {
		position: relative;
		display: inline-block;
		margin-bottom: 1em;
	}
	.opciones-btn {
		border-radius: 6px;
		border: 1.5px solid #1976d2;
		background: #fff;
		color: #1976d2;
		font-weight: 600;
		font-size: 1em;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5em;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.opciones-btn:hover,
	.opciones-btn:focus {
		background: #1976d2;
		color: #fff;
	}
	.arrow {
		font-size: 0.9em;
	}
	.opciones-menu {
		position: absolute;
		top: 110%;
		left: 0;
		background: #fff;
		border: 1.5px solid #1976d2;
		border-radius: 6px;
		box-shadow: 0 2px 12px #1976d233;
		min-width: 220px;
		z-index: 10;
		padding: 0.5em 0.8em;
	}
	.radio-group,
	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
	.radio-label,
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5em;
		font-size: 1em;
		color: #1976d2;
		cursor: pointer;
	}
	hr {
		margin: 0.7em 0;
		border: none;
		border-top: 1px solid #1976d2;
		opacity: 0.2;
	}
</style>
