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
			{selectedDepartamento}
			departamentos={departamentosPermitidos}
			usuario={resto.data.usuario}
		/>
	</div>
</main>

<style>
	/* ===== HEADER STYLES ===== */
	.app-header {
		background: rgba(255, 255, 255, 0.05);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1.5rem 0;
		margin-bottom: 2rem;
		width: 100%;
	}

	.header-content {
		max-width: 95vw;
		margin: 0 auto;
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
		padding: 0.8rem;
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
		margin: 0 auto;
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
		overflow-x: auto;
		overflow-y: visible;
	}

	/* ===== RESPONSIVE DESIGN ===== */
	@media (max-width: 768px) {
		.app-header {
			padding: 1rem 0;
		}

		.header-content {
			padding: 0 0.5rem;
		}

		.app-header h1 {
			font-size: 2rem;
		}

		.header-nav {
			flex-direction: column;
			gap: 1.5rem;
		}

		.admin-nav {
			justify-content: center;
		}

		.nav-separator {
			display: none;
		}

		.main-content {
			padding: 0 0.5rem;
		}

		.tabla-section {
			padding: 0.5rem;
			margin: 0;
			border-radius: 8px;
		}

		.admin-link {
			min-width: 70px;
			padding: 0.6rem;
		}

		.admin-label {
			font-size: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.app-header h1 {
			font-size: 1.5rem;
		}

		.header-content {
			padding: 0 0.25rem;
		}

		.main-content {
			padding: 0 0.25rem;
		}

		.tabla-section {
			padding: 0.25rem;
			border-radius: 4px;
		}

		.admin-nav {
			gap: 0.5rem;
			flex-wrap: wrap;
			justify-content: center;
		}

		.admin-link {
			min-width: 60px;
			padding: 0.5rem;
		}

		.admin-icon {
			width: 24px !important;
			height: 24px !important;
		}

		.admin-label {
			font-size: 0.7rem;
		}
	}

	/* ===== CORRECCIÓN DE CENTRADO ===== */
	@media (min-width: 1200px) {
		.header-content {
			max-width: 95vw;
		}

		.main-content {
			max-width: 95vw;
		}

		.tabla-section {
			padding: 2.5rem;
		}
	}

	/* ===== OPTIMIZACIÓN PARA MONITORES GRANDES ===== */
	@media (min-width: 1920px) {
		.header-content {
			max-width: 92vw;
			padding: 0 2rem;
		}

		.main-content {
			max-width: 92vw;
			padding: 0 2rem;
		}

		.tabla-section {
			padding: 3rem;
		}

		.app-header h1 {
			font-size: 3rem;
		}

		.section-header h2 {
			font-size: 2.2rem;
		}
	}

	/* ===== OPTIMIZACIÓN PARA 4K Y MONITORES ULTRAWIDE ===== */
	@media (min-width: 2560px) {
		.header-content {
			max-width: 90vw;
			padding: 0 3rem;
		}

		.main-content {
			max-width: 90vw;
			padding: 0 3rem;
		}

		.tabla-section {
			padding: 4rem;
		}

		.app-header h1 {
			font-size: 3.5rem;
		}

		.section-header h2 {
			font-size: 2.5rem;
		}

		.department-info,
		.admin-info {
			font-size: 1.2rem;
		}
	}
</style>
