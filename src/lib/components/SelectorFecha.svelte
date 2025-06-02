<script lang="ts">
	/** Stores*/
	import { globalStore } from '$lib/stores/global';
	import { onMount } from 'svelte';

	/** Props */
	let { fecha = $bindable() }: { fecha: string } = $props();

	/** Variables */
	let hoy = fecha || new Date().toISOString().split('T')[0];
	let isLoading = $state(false);

	globalStore.subscribe((state) => {
		isLoading = state.loading;
	});
	
	/** Funciones */
	function handleDateChange(e: any) {
		console.log('DatePicker fecha definida:', e.target.value);
	}
	function setDateAyer() {
		const hoy = new Date(fecha);

		hoy.setDate(hoy.getDate() - 1);
		fecha = hoy.toISOString().split('T')[0];
		handleDateChange({ target: { value: fecha } });
		console.log('Fecha de ayer:', fecha);
	}
	function setDateMañana() {
		const hoy = new Date(fecha);

		hoy.setDate(hoy.getDate() + 1);
		fecha = hoy.toISOString().split('T')[0];
		handleDateChange({ target: { value: fecha } });
		console.log('Fecha de mañana:', fecha);
	}

</script>

<div class="selector-fecha">
	<button class="boton-anterior" onclick={setDateAyer} disabled={isLoading}>◄</button>
	<input
		class="b:1|solid|#ccc p:5 mr:10 ml:10 w:99% r:15 w:fit-content"
		type="date"
		bind:value={fecha}
		onchange={handleDateChange}
	/>

	<button class="boton-siguiente |disabled" onclick={setDateMañana} disabled={isLoading || fecha === hoy}>►</button>
</div>

<style>
	.selector-fecha {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.boton-anterior,
	.boton-siguiente {
		background-color: #18c5a0;
		color: white;
		border: none;
		padding: 1em;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
		margin-left: 0.1em;
		margin-right: 0.1em;
	}

	.boton-siguiente:disabled,
	.boton-siguiente:disabled:hover {
		background-color: #ccc;
		cursor: not-allowed;
	}

	.boton-anterior:hover,
	.boton-siguiente:hover {
		background-color: #137a58;
	}

	input[type='date'] {
		font-size: 16px;
		padding: 1em;
		border-radius: 5px;
		border: 1px solid #ccc;
	}
</style>
