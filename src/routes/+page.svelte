<script lang="ts">
	import Tabla from '$lib/components/TablaMarcadas/Tabla.svelte';
	import { logout } from '$lib/apiController/usuarioApi';
	import { fetchDepartamentos } from '$lib/apiController/departamentosApi';
	import { fetchDepartamentoByName } from '$lib/apiController/departamentosApi';
	import { onMount } from 'svelte';
	import type { Departamento } from '$lib/types/gen';
	import { browser } from '$app/environment';
	let { ...resto } = $props();

	let selectedDepartamento = $state<Departamento | null>(null);
	console.log(resto.data.usuario);
	let departamentosPermitidos: Departamento[] = $state(
		Array.isArray(resto.data.usuario.departamentosPermitidos)
			? resto.data.usuario.departamentosPermitidos
			: resto.data.usuario?.departamentosPermitidos
				? [resto.data.usuario.departamentosPermitidos]
				: []
	);

	onMount(async () => {
		if (resto.data.usuario?.role === 'ADMIN') {
			departamentosPermitidos = await fetchDepartamentos();
		}
		else {
			selectedDepartamento = await fetchDepartamentoByName(resto.data.usuario?.departamento)
			console.log('selectedDepartamento', selectedDepartamento);
		}
		if (browser) {
			const body = document.querySelector('body');
			if (body) {
				body.style.overflow = 'auto';
			}
		}
	});
</script>

<h1>Marcadas Web</h1>

<div class="header">
	<button
		class="logout-btn"
		onclick={async () => {
			await logout();
		}}>Cerrar sesión</button
	>

	{#if resto.data.usuario?.role === 'ADMIN'}
		<hr />
		<a href="/admin/usuarios" class="admin-link">
			<img src="personas.png" alt="Admin" width="30" height="30" class="estrella" />
		</a>
		<hr />
		<a href="/admin/departamentos" class="admin-link">
			<img src="departamentos.png" alt="Admin" width="30" height="30" class="estrella" />
		</a>
	{/if}
</div>

<div class="tabla-container">
	<Tabla {selectedDepartamento} departamentos={departamentosPermitidos} usuario={resto.data.usuario} />
</div>

<style>
	.header {
		display: inline-flex;
		flex-direction: row;

		gap: 1em;
	}
	.tabla-container {
		box-sizing: border-box;
	}

	.estrella {
		position: relative;
	}

	.estrella:hover {
		transform: scale(1.1);
		transition: transform 0.3s ease;
	}

	h1 {
		color: #ffffff;
		margin-bottom: 1em;
		font-size: 2em;
		text-align: center;
	}

	.logout-btn {
		position: relative;
		background: #e74c3c;
		color: #fff;
		border: none;
		border-radius: 5px;
		padding: 0.7em 1.5em;
		font-size: 1em;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		transition:
			background 0.2s,
			transform 0.2s;
	}

	.logout-btn:hover {
		background: #c0392b;
		transform: scale(1.05);
	}
</style>
