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
		} else {
			selectedDepartamento = await fetchDepartamentoByName(resto.data.usuario?.departamento);
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

<header class="app-header">
	<div class="header-content">
		<h1>Marcadas Web</h1>

		<nav class="header-nav">
			<div class="user-actions">
				<button
					class="logout-btn"
					onclick={async () => {
						await logout();
					}}
					aria-label="Cerrar sesión"
				>
					Cerrar sesión
				</button>
			</div>

			{#if resto.data.usuario?.role === 'ADMIN'}
				<div class="admin-nav">
					<span class="nav-separator"></span>
					<a href="/admin/usuarios" class="admin-link" title="Gestionar Usuarios">
						<img
							src="personas.png"
							alt="Gestionar Usuarios"
							width="30"
							height="30"
							class="admin-icon"
						/>
						<span class="admin-label">Usuarios</span>
					</a>
					<span class="nav-separator"></span>
					<a href="/admin/departamentos" class="admin-link" title="Gestionar Departamentos">
						<img
							src="departamentos.png"
							alt="Gestionar Departamentos"
							width="30"
							height="30"
							class="admin-icon"
						/>
						<span class="admin-label">Departamentos</span>
					</a>
				</div>
			{/if}
		</nav>
	</div>
</header>

<main class="main-content">
	<div class="tabla-container">
		<Tabla
			usuario={resto.data.usuario}
		/>
	</div>
</main>

<style>
	/* ===== HEADER STYLES ===== */
	.app-header {
		background: rgba(255, 255, 255, 0.05);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding: 0.5rem;
		width: 100%;
	}

	.header-content {
		max-width: 95vw;
		padding: 0 1rem;
		width: 100%;
		box-sizing: border-box;
	}

	.app-header h1 {
		font-size: 2.5em;
		margin: 0 0 1rem 0;
		text-align: center;
		background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-weight: 700;
		width: 100%;
	}

	.header-nav {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		width: 100%;
	}

	.user-actions {
		display: flex;
		align-items: center;
	}

	.admin-nav {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.nav-separator {
		width: 2px;
		height: 40px;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
		border-radius: 1px;
	}

	.admin-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: 12px;
		transition: all 0.3s ease;
		background: rgba(255, 255, 255, 0.1);
		text-decoration: none;
		color: #ffffff;
		min-width: 80px;
		text-align: center;
	}

	.admin-link:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
	}

	.admin-icon {
		transition: transform 0.3s ease;
		filter: brightness(1.2);
		display: block;
	}

	.admin-link:hover .admin-icon {
		transform: scale(1.1);
	}

	.admin-label {
		font-size: 0.8rem;
		font-weight: 600;
		text-align: center;
		opacity: 0.9;
		display: block;
		width: 100%;
	}

	/* ===== MAIN CONTENT ===== */
	.main-content {
		max-width: 95vw;
		margin: 0 auto;
		padding: 0 1rem;
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	.tabla-container {
		position: relative;
		min-height: 400px;
		width: 100%;
		overflow-x: visible;
		overflow-y: visible;
	}
</style>
