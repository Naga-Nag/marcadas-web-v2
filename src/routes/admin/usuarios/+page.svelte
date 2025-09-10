<script lang="ts">
	import { fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } from '$lib/apiController/usuarioApi';
	import { fetchDepartamentos } from '$lib/apiController/departamentosApi';
	import type { Departamento, shortUsuario } from '$lib/types/gen';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import Tag from '$lib/components/Tag.svelte';

	let usuarios: shortUsuario[] = [];
	let departamentos: Departamento[] = [];
	let showRegisterForm = false;
	let error = '';
	let loading = false;

	// Formulario de registro/edición
	type UsuarioForm = Partial<shortUsuario> & { password?: string };
	let form: UsuarioForm = {
		username: '',
		password: '',
		role: 'USER',
		departamento: '',
		departamentosPermitidos: []
	};
	let editingUser: string | null = null;

	async function loadUsuarios() {
		usuarios = await fetchUsuarios();
	}

	async function loadDepartamentos() {
		departamentos = await fetchDepartamentos();
	}

	onMount(async () => {
		await loadUsuarios();
		await loadDepartamentos();
	});

	function openRegisterForm() {
		form = {
			username: '',
			password: '',
			role: 'USER',
			departamento: '',
			departamentosPermitidos: []
		};
		editingUser = null;
		showRegisterForm = true;
	}

	function openEditForm(usuario: shortUsuario) {
		form = {
			...usuario,
			password: '', // No mostrar la contraseña
			departamentosPermitidos: Array.isArray(usuario.departamentosPermitidos)
				? [...usuario.departamentosPermitidos]
				: typeof usuario.departamentosPermitidos === 'string'
					? JSON.parse(usuario.departamentosPermitidos)
					: []
		};
		editingUser = usuario.username;
		showRegisterForm = true;
	}

	function closeForm() {
		showRegisterForm = false;
		form = {
			username: '',
			password: '',
			role: 'USER',
			departamento: '',
			departamentosPermitidos: []
		};
		editingUser = null;
		error = '';
	}

	async function handleSubmit() {
		loading = true;
		error = '';
		try {
			if (!form.username || !form.role || !form.departamento) {
				error = 'Completa todos los campos obligatorios';
				loading = false;
				return;
			}
			if (editingUser) {
				await updateUsuario(form);
			} else {
				await createUsuario(form as any);
			}
			await loadUsuarios();
			closeForm();
		} catch (e: any) {
			error = e.message || 'Error al guardar usuario';
		}
		loading = false;
	}

	async function handleDepartamentoToggle(dep: string) {
		if (!form.departamentosPermitidos) form.departamentosPermitidos = [];
		if (form.departamentosPermitidos.includes(dep)) {
			form.departamentosPermitidos = form.departamentosPermitidos.filter((d) => d !== dep);
		} else {
			form.departamentosPermitidos = [...form.departamentosPermitidos, dep];
		}
		// Si está editando, actualiza en backend
		if (editingUser) {
			try {
				await updateUsuario({
					username: form.username,
					departamentosPermitidos: form.departamentosPermitidos
				});
				await loadUsuarios();
			} catch (e: any) {
				error = e.message || 'Error actualizando departamentos permitidos';
			}
		}
	}
</script>

<header class="admin-header">
	<nav class="breadcrumb">
		<a href="/" class="btn primary-btn breadcrumb-link">
			<span>← Volver al inicio</span>
		</a>
	</nav>
	
	<div class="page-title">
		<h1>Panel de Administrador</h1>
		<p class="page-subtitle">Gestión de usuarios del sistema</p>
	</div>
</header>

<main class="admin-content">
	<section class="users-section">
		<div class="section-header">
			<div class="section-title">
				<h2>Usuarios</h2>
				<span class="user-count">{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}</span>
			</div>
			<button on:click={openRegisterForm} class="btn primary-btn action-btn">
				<span>+ Registrar Usuario</span>
			</button>
		</div>

		{#if showRegisterForm}
			<div class="register-form-overlay" transition:fade>
				<div class="register-form">
					<header class="form-header">
						<h3>{editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h3>
						<button on:click={closeForm} class="close-button" aria-label="Cerrar">&times;</button>
					</header>
					
					{#if error}
						<div class="error" role="alert">{error}</div>
					{/if}
					
					<form on:submit|preventDefault={handleSubmit} class="user-form">
						<div class="form-grid">
							<div class="form-group">
								<label for="username">
									Usuario:
									<input
										id="username"
										type="text"
										bind:value={form.username}
										required
										readonly={editingUser !== null}
										autocomplete="username"
									/>
								</label>
							</div>

							<div class="form-group">
								<label for="password">
									Contraseña:
									<input 
										id="password"
										type="password" 
										bind:value={form.password} 
										required={!editingUser}
										autocomplete="new-password"
									/>
								</label>
							</div>

							<div class="form-group">
								<label for="departamento">
									Departamento:
									<select id="departamento" bind:value={form.departamento} required>
										<option value="" disabled>Seleccione un departamento</option>
										{#each departamentos as departamento}
											<option value={departamento.DeptName}>{departamento.DeptName}</option>
										{/each}
									</select>
								</label>
							</div>

							<div class="form-group">
								<label for="role">
									Rol:
									<select id="role" bind:value={form.role} required>
										<option value="USER">Usuario</option>
										<option value="ADMIN">Administrador</option>
									</select>
								</label>
							</div>
						</div>

						<div class="form-group departamentos-section">
							<label>
								Departamentos Permitidos:
								<div class="departamentos-buttons">
									{#each departamentos as dep}
										<button
											type="button"
											class="departamento-btn {form.departamentosPermitidos && form.departamentosPermitidos.includes(dep.DeptName) ? 'active' : ''}"
											on:click={() => handleDepartamentoToggle(dep.DeptName)}
											aria-pressed={form.departamentosPermitidos && form.departamentosPermitidos.includes(dep.DeptName)}
										>
											{dep.DeptName}
										</button>
									{/each}
								</div>
							</label>
						</div>

						<div class="form-actions">
							<button class="btn primary-btn" type="submit" disabled={loading} class:loading>
								{editingUser ? 'Actualizar' : 'Registrar'}
							</button>
							<button type="button" class="btn secondary-btn" on:click={closeForm}>Cancelar</button>
						</div>
					</form>
				</div>
			</div>
		{/if}

		<div class="users-container">
			{#if usuarios.length === 0}
				<div class="empty-state">
					<p>No hay usuarios registrados</p>
				</div>
			{:else}
				<ul class="user-list" role="list">
					{#each usuarios as usuario (usuario.username)}
						<li class="user-item" transition:slide>
							<details class="user-details-toggle">
								<summary class="user-summary">
									<div class="user-info">
										<span class="username">{usuario.username}</span>
										<Tag label={usuario.departamento!} color="blue" />
										<span class="role-badge">{usuario.role}</span>
									</div>
									<div class="user-actions">
										<button 
											class="btn secondary-btn" 
											on:click|stopPropagation={() => openEditForm(usuario)}
											aria-label="Editar usuario {usuario.username}"
										>
											Editar
										</button>
										<button 
											class="btn danger-btn" 
											on:click|stopPropagation={() => deleteUsuario(usuario.username)}
											aria-label="Eliminar usuario {usuario.username}"
										>
											Eliminar
										</button>
									</div>
								</summary>
								<div class="user-details">
									<div class="details-grid">
										<div class="detail-item">
											<strong>Username:</strong> 
											<span>{usuario.username}</span>
										</div>
										<div class="detail-item">
											<strong>Departamento:</strong> 
											<span>{usuario.departamento}</span>
										</div>
										<div class="detail-item">
											<strong>Rol:</strong> 
											<span>{usuario.role}</span>
										</div>
										<div class="detail-item full-width">
											<strong>Departamentos Permitidos:</strong>
											<div class="permitted-departments">
												{#each Array.isArray(usuario.departamentosPermitidos)
													? usuario.departamentosPermitidos
													: typeof usuario.departamentosPermitidos === 'string'
														? JSON.parse(usuario.departamentosPermitidos)
														: [] as string[] as dep}
													<span class="department-tag">{dep}</span>
												{/each}
											</div>
										</div>
									</div>
								</div>
							</details>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</section>
</main>

<style>
/* ===== ADMIN HEADER ===== */
.admin-header {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.5rem 0;
    margin-bottom: 2rem;
}

.breadcrumb {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1rem;
    margin-bottom: 1rem;
}

.breadcrumb-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.page-title {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1rem;
    text-align: center;
}

.page-title h1 {
    color: #ffffff;
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
}

.page-subtitle {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 1rem;
}

/* ===== MAIN CONTENT ===== */
.admin-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1rem;
}

.users-section {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
    gap: 1rem;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.section-title h2 {
    color: #ffffff;
    margin: 0;
    font-size: 1.5rem;
}

.user-count {
    background: rgba(25, 118, 210, 0.2);
    color: #ffffff;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.action-btn {
    white-space: nowrap;
}

/* ===== FORM IMPROVEMENTS ===== */
.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(25, 118, 210, 0.1);
}

.form-header h3 {
    margin: 0;
    color: #1976d2;
    font-size: 1.3em;
}

.user-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.departamentos-section {
    grid-column: 1 / -1;
}

/* ===== USER LIST IMPROVEMENTS ===== */
.users-container {
    position: relative;
    min-height: 200px;
}

.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
}

.user-details-toggle {
    width: 100%;
}

.user-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    list-style: none;
}

.user-summary:hover {
    background: rgba(25, 118, 210, 0.05);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.username {
    font-weight: 600;
    color: #1976d2;
    font-size: 1.1rem;
}

.user-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-item.full-width {
    grid-column: 1 / -1;
}

.detail-item strong {
    color: #1976d2;
    font-size: 0.9rem;
    font-weight: 600;
}

.detail-item span {
    color: #333;
    font-size: 0.95rem;
}

.permitted-departments {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.department-tag {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    color: #1976d2;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid rgba(25, 118, 210, 0.2);
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
    }

    .section-title {
        justify-content: center;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .user-summary {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .user-info {
        justify-content: center;
        flex-wrap: wrap;
    }

    .user-actions {
        justify-content: center;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .users-section {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    .user-actions {
        flex-direction: column;
        gap: 0.25rem;
    }

    .user-actions .btn {
        width: 100%;
        margin-right: 0;
    }

    .permitted-departments {
        justify-content: center;
    }
}

/* ===== ACCESSIBILITY IMPROVEMENTS ===== */
.user-summary:focus {
    outline: 2px solid #1976d2;
    outline-offset: 2px;
}

.user-summary::marker {
    color: #1976d2;
}

[aria-pressed="true"] {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
    color: #fff !important;
}
</style>
