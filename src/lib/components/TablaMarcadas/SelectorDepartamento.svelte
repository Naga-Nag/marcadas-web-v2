<script lang="ts">
	import type { Departamento, shortUsuario } from '$lib/types/gen';
	import { globalStore, setSelectedDepartamento } from '$lib/stores/global';
	import { usuarioStore } from '$lib/stores/usuario';
	import { onDestroy } from 'svelte';

	let allDepartamentos = $state<Departamento[]>([]);
	let selected = $state<Departamento | null>(null);
	let currentUser = $state<shortUsuario | null>(null);

	let unsubscribeGlobal = globalStore.subscribe((state) => {
		allDepartamentos = state.departamentos;
		selected = state.selectedDepartamento;
	});

	let unsubscribeUsuario = usuarioStore.subscribe((user) => {
		currentUser = user;
	});

	onDestroy(() => {
		unsubscribeGlobal();
		unsubscribeUsuario();
	});

	// Compute filtered departments based on user role and permissions
	let departamentos = $derived(() => {
	let filteredDepartamentos;
		
		// If user data is available and user has USER role with permissions, filter departments
		if (currentUser && currentUser.role === 'USER' && currentUser.departamentosPermitidos) {
		  // Filter departments to only show allowed ones for USER role (case-insensitive comparison with trimming)
		  filteredDepartamentos = allDepartamentos.filter((depa) => {
		    return currentUser?.departamentosPermitidos && currentUser.departamentosPermitidos.some(
		      (permiso) => permiso.trim().toLowerCase() === depa.DeptName.trim().toLowerCase()
		    );
		  });
		} else {
		  // For non-USER roles or when user data is not yet available, show all departments
		  filteredDepartamentos = allDepartamentos;
		}
		
		// Move ARPB department to the beginning when it exists
		if (filteredDepartamentos && filteredDepartamentos.length > 0) {
			const idx = filteredDepartamentos.findIndex((d) => d.DeptName.trim().toLowerCase() === 'arpb');
			if (idx > 0) {
				const arpb = filteredDepartamentos[idx];
				return [
					arpb,
					...filteredDepartamentos.slice(0, idx),
					...filteredDepartamentos.slice(idx + 1)
				];
			}
		}
		
		return filteredDepartamentos;
	});
</script>

<div class="selector-departamento">
	{#if departamentos().length === 0}
		<p>No hay departamentos disponibles</p>
	{:else}
		{#each departamentos() as depa}
			<button class:selected={selected?.Deptid === depa.Deptid} onclick={() => setSelectedDepartamento(depa)}>
				{depa.DeptName}
			</button>
		{/each}
	{/if}
</div>

<style>
	.selector-departamento {
		display: flex;
		overflow-x: scroll;
		padding: 0.5rem;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		border-radius: 6px;
		border: 1px solid rgba(226, 232, 240, 0.8);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		width: 100%;
		scrollbar-width: thin;
		scrollbar-color: #667eea #e2e8f0;
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
		border-radius: 6px;
		border: 2px solid transparent;
		background: rgba(255, 255, 255, 0.8);
		color: #374151;
		cursor: pointer;
		font-weight: 600;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		min-width: fit-content;
		padding: 0.5rem;
		margin-right: 1rem;
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
		padding: 1rem;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 12px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(226, 232, 240, 0.8);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.selector-departamento {
			padding: 0.75rem;
		}

		button {
			padding: 0.75rem 1.25rem;
			font-size: 0.9rem;
			min-width: 120px;
		}
	}

	@media (max-width: 480px) {
		.selector-departamento {
			padding: 0.5rem;
		}

		button {
			padding: 0.625rem 1rem;
			font-size: 0.85rem;
			min-width: 100px;
		}
	}
</style>
