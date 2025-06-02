<script lang="ts">
	/** Svelte */
	import { onMount } from 'svelte';

	/** API */
	import { fetchMarcadas } from '$lib/apiController/marcadasApi';
	import { fetchDepartamentos } from '$lib/apiController/departamentosApi';
	import { generateExcelFromTemplate } from '$lib/utils/genParteClientSide';
	import { filtrarPersonalActivo } from '$lib/utils';
	import { updatePersonal } from '$lib/apiController/personal';

	/** Stores*/
	import { globalStore, isLoading } from '$lib/stores/global';

	/** Componentes */
	import Loading from '$lib/components/Loading.svelte';
	import DataTable from './DataTable.svelte';
	import SelectorFecha from '../SelectorFecha.svelte';
	import SelectorDepartamento from './SelectorDepartamento.svelte';
	import Opciones from './Opciones.svelte';

	/** Tipos */
	import type { Marcada } from '$lib/types/gen';
	import { isAdmin } from '$lib/stores/usuario';

	let { selectedDepartamento = $bindable(), departamentos = [] }: { selectedDepartamento: string, departamentos: string[] } = $props();

	/** Variables */
	let selectedOpcion = $state('estandar');
	let fecha = $state('');
	let marcadas: Marcada[] = $state([]);
	let loading = $state(true);
	let ocultarInactivos = $state(true);
	let editable = $state(false); // o true si quieres que sea editable por defecto

	globalStore.subscribe((state) => {
		marcadas = state.marcadas;
		loading = state.loading;
	});

	type Column = {
		id: string;
		width: number;
		header: string;
		footer: string;
		type?: 'text' | 'checkbox'; // <-- Añade esto
	};

	let columns: Column[] = $state([]);

	$effect(() => {
		if (selectedOpcion === 'estandar') {
			columns = [
				{ id: 'Personal.MR', width: 80, header: 'MR', footer: 'MR', type: 'text' },
				{ id: 'Personal.CUIL', width: 100, header: 'CUIL', footer: 'CUIL', type: 'text' },
				{ id: 'Personal.Nombre', width: 180, header: 'Nombre', footer: 'Nombre', type: 'text' },
				{ id: 'Personal.Departamento', width: 140, header: 'Departamento', footer: 'Departamento', type: 'text' },
				{ id: 'Salida', width: 120, header: 'Salida', footer: 'Salida', type: 'text' },
				{ id: 'Entrada', width: 120, header: 'Entrada', footer: 'Entrada', type: 'text' },
				{ id: 'Estado', width: 120, header: 'Estado', footer: 'Estado', type: 'text' },
				{ id: 'Personal.Activo', width: 80, header: 'Activo', footer: 'Activo', type: 'checkbox' } // <-- Aquí
			];
		} else {
			columns = [
				{ id: 'Personal.MR', width: 80, header: 'MR', footer: 'MR', type: 'text' },
				{ id: 'Personal.CUIL', width: 100, header: 'CUIL', footer: 'CUIL', type: 'text' },
				{ id: 'Personal.Nombre', width: 180, header: 'Nombre', footer: 'Nombre', type: 'text' },
				{ id: 'Marcada', width: 120, header: 'Marcada', footer: 'Marcada', type: 'text' },
				{ id: 'Personal.Departamento', width: 140, header: 'Departamento', footer: 'Departamento', type: 'text' },
				{ id: 'Personal.Activo', width: 80, header: 'Activo', footer: 'Activo', type: 'checkbox' }
			];
		}
	});

	async function syncMarcadas() {
		try {
			marcadas = await fetchMarcadas(selectedDepartamento, fecha, selectedOpcion);
		} catch (error) {
			console.error('Error al sincronizar marcadas:', error);
		}
	}

	$effect(() => {
		if (selectedDepartamento && fecha) {
			syncMarcadas();
		}

	});

	onMount(async () => {
		// Ajuste de fecha para sábado o domingo
		let hoy = new Date();
		const dia = hoy.getDay();
		if (dia === 6) {
			hoy.setDate(hoy.getDate() - 1);
			fecha = hoy.toISOString().split('T')[0];
		} else if (dia === 0) {
			hoy.setDate(hoy.getDate() - 2);
			fecha = hoy.toISOString().split('T')[0];
		}
		if (selectedDepartamento && marcadas.length === 0) {
			await syncMarcadas();
		}
	});

	function handleCellEdit(uid: number, colId: string, newValue: string) {
		const row = marcadas.find(m => m.Personal.UID === uid);
		if (!row) return;

		// Actualiza el dato localmente (soporta campos anidados tipo "Personal.CUIL")
		const path = colId.split('.');
		let obj: any = row;
		for (let i = 0; i < path.length - 1; i++) {
			obj = obj[path[i]];
		}
		obj[path[path.length - 1]] = newValue;

		console.log(`Editando columna ${colId}, nuevo valor: ${newValue}`);
		if (colId === 'Personal.Activo') {
			// Actualiza el estado del usuario si es el campo "Activo"
			updatePersonal({ UID: row.Personal.UID, Activo: newValue });
		}
		// Lógica condicional según la columna editada
		else if (colId.startsWith("Personal.")) {
			console.log(`Actualizando ${colId} de ${row.Personal.Nombre} (${row.Personal.MR}) a ${newValue}`);
			updatePersonal({ UID: row.Personal.UID, [colId]: newValue });
		}
		else {
			console.log(`No Actualizando ${colId} de ${row.Personal.Nombre} (${row.Personal.MR}) a ${newValue}`);
			// Aquí podrías agregar lógica para otras columnas si es necesario
		}

	}
</script>

<div class="tabla-marcadas animate-fadein">
	<SelectorDepartamento
		{departamentos}
		selected={selectedDepartamento}
		onSelect={(depa) => {
			selectedDepartamento = depa;
			syncMarcadas();
		}}
	/>

	{#if selectedDepartamento}
		<div class="botonera">
			<Opciones bind:selectedOpcion bind:ocultarInactivos />
			<SelectorFecha bind:fecha />
			{#if fecha}
				<button
					class="excel-btn animate-pop"
					onclick={() => generateExcelFromTemplate(selectedDepartamento!, fecha)}
				>
					<svg width="20" height="20" fill="none" viewBox="0 0 24 24"
						><path
							fill="#fff"
							d="M16.5 2A1.5 1.5 0 0 1 18 3.5V6h2.5A1.5 1.5 0 0 1 22 7.5v13A1.5 1.5 0 0 1 20.5 22h-17A1.5 1.5 0 0 1 2 20.5v-17A1.5 1.5 0 0 1 3.5 2h13Zm1.5 4V3.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5v17a.5.5 0 0 0 .5.5h17a.5.5 0 0 0 .5-.5V7.5a.5.5 0 0 0-.5-.5H18ZM8.21 10.21a1 1 0 0 1 1.42 0L12 12.59l2.37-2.38a1 1 0 1 1 1.42 1.42L13.41 14l2.38 2.37a1 1 0 0 1-1.42 1.42L12 15.41l-2.37 2.38a1 1 0 0 1-1.42-1.42L10.59 14l-2.38-2.37a1 1 0 0 1 0-1.42Z"
						/></svg
					>
					Generar Parte Diario
				</button>
			{/if}
		</div>

		<div class="grid-container animate-fadein">
			{#if loading}
				<Loading />
			{:else if marcadas.length > 0}
				<div class="grid animate-fadein">
					<DataTable
						{editable}
						data={ocultarInactivos ? filtrarPersonalActivo(marcadas) : marcadas}
						{columns}
						onCellEdit={handleCellEdit}
					/>
				</div>
			{:else}
				<p class="no-marcadas animate-pop">
					No hay marcadas para el departamento <b>{selectedDepartamento}</b> en la fecha
					<b>{fecha}</b>.
				</p>
			{/if}
		</div>
	{:else}
		<p class="no-marcadas animate-pop">Por favor, selecciona un departamento.</p>
	{/if}
</div>

<style>
	:global(body) {
		background: linear-gradient(135deg, #1a6fc9 0%, #0d47a1 50%, #002171 100%);
		font-family: 'Comfortaa', Arial, sans-serif;
	}

	.tabla-marcadas {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 32px 12px 24px 12px;

		width: 100vw;
		box-sizing: border-box;
	}

	.botonera {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 12px;
		width: 100%;
		max-width: 98vw;
	}

	.grid-container {
		display: flex;
		justify-content: center;
		width: 100%;
		margin-top: 18px;
	}

	.grid {
		width: 100%;
		max-width: 98vw;
		background: rgba(255, 255, 255, 0.97);
		border-radius: 16px;
		box-shadow: 0 6px 32px 0 #1a6fc933;
		padding: 0 0 12px 0;
		animation: fadein 0.7s;
	}

	.excel-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		background: linear-gradient(90deg, #1976d2 60%, #60a5fa 100%);
		color: #fff;
		border: none;
		border-radius: 8px;
		padding: 10px 22px;
		font-size: 1.1em;
		font-weight: 600;
		box-shadow: 0 2px 8px #1976d233;
		margin: 0 0 18px 0;
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.2s;
	}
	.excel-btn:hover {
		background: linear-gradient(90deg, #125ea6 60%, #60a5fa 100%);
		transform: scale(1.04);
	}

	.no-marcadas {
		color: #e53935;
		background: #fff;
		padding: 1em 2em;
		border-radius: 8px;
		margin-top: 2em;
		font-size: 1.1em;
		box-shadow: 0 2px 8px #1a6fc933;
	}

	/* Animaciones */
	@keyframes fadein {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes pop {
		0% {
			transform: scale(0.9);
			opacity: 0;
		}
		80% {
			transform: scale(1.04);
			opacity: 1;
		}
		100% {
			transform: scale(1);
		}
	}
	.animate-fadein {
		animation: fadein 0.7s;
	}
	.animate-pop {
		animation: pop 0.5s;
	}
	@keyframes slidein {
		from {
			opacity: 0;
			transform: translateX(-40px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Responsive */
	@media (max-width: 900px) {
		.grid,
		.tabla-marcadas {
			max-width: 100vw;
			padding: 0;
		}
	}
</style>
