<script lang="ts">
	import Tabla from '$lib/components/TablaMarcadas/Tabla.svelte';
	import { logout } from '$lib/apiController/usuarioApi';
	import { fetchDepartamentos } from '$lib/apiController/departamentosApi';
	import { onMount } from 'svelte';
	let { ...resto } = $props();

	let selectedDepartamento = $state(resto.data.usuario?.departamento);
	console.log(resto.data.usuario);
	let departamentosPermitidos: string[] = $state(
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
			<img src="starfish.png" alt="Admin" width="30" height="30" class="estrella" />
		</a>
	{/if}
</div>

<div class="tabla-container">
	<Tabla {selectedDepartamento} departamentos={departamentosPermitidos} />
</div>

<style>
	.header {
		display: inline-flex;
		flex-direction: row;
		padding: 1em;
		gap: 1em;
	}
	.tabla-container {
		margin-bottom: 2em;
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
