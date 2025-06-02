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

<main>
	<a href="/" class="btn primary-btn">Volver</a>
	<h1>Panel de Administrador</h1>
	<h2>Usuarios</h2>
	<button on:click={openRegisterForm} class="btn primary-btn"> Registrar Usuario </button>

	{#if showRegisterForm}
		<div class="register-form-overlay" transition:fade>
			<div class="register-form">
				<button on:click={closeForm} class="close-button" aria-label="Cerrar">&times;</button>
				<h3>{editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h3>
				{#if error}
					<div class="error">{error}</div>
				{/if}
				<form on:submit|preventDefault={handleSubmit}>
					<label>
						Usuario:
						<input
							type="text"
							bind:value={form.username}
							required
							readonly={editingUser !== null}
						/>
					</label>
					<label>
						Contraseña:
						<input type="password" bind:value={form.password} required={!editingUser} />
					</label>
					<label>
						Departamento:
						<select bind:value={form.departamento} required>
							<option value="" disabled>Seleccione un departamento</option>
							{#each departamentos as departamento}
								<option value={departamento}>{departamento}</option>
							{/each}
						</select>
					</label>
					<label>
						Rol:
						<select bind:value={form.role} required>
							<option value="USER">USER</option>
							<option value="ADMIN">ADMIN</option>
						</select>
					</label>
					<label>
						Departamentos Permitidos:
						<div class="departamentos-buttons">
							{#each departamentos as dep}
								<button
									type="button"
									class="departamento-btn {form.departamentosPermitidos && form.departamentosPermitidos.includes(dep.DeptName) ? 'active' : ''}"
									on:click={() => handleDepartamentoToggle(dep.DeptName)}
								>
									{dep.DeptName}
								</button>
							{/each}
						</div>
					</label>
					<div class="form-actions">
						<button class="btn primary-btn" type="submit" disabled={loading}>
							{editingUser ? 'Actualizar' : 'Registrar'}
						</button>
						<button type="button" class="btn secondary-btn" on:click={closeForm}>Cancelar</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<ul class="user-list">
		{#each usuarios as usuario (usuario.username)}
			<li class="user-item" transition:slide>
				<details>
					<summary>
						<span>{usuario.username}</span>
						<Tag label={usuario.departamento!} color="blue" />
						<span class="role-badge">{usuario.role}</span>
						<button class="btn secondary-btn" on:click={() => openEditForm(usuario)}>Editar</button>
						<button class="btn danger-btn" on:click={() => deleteUsuario(usuario.username)}>Eliminar</button>
					</summary>
					<div class="user-details">
						<p><strong>Username:</strong> {usuario.username}</p>
						<p><strong>Departamento:</strong> {usuario.departamento}</p>
						<p><strong>Rol:</strong> {usuario.role}</p>
						<p>
							<strong>Departamentos Permitidos:</strong>
							{#each Array.isArray(usuario.departamentosPermitidos)
								? usuario.departamentosPermitidos
								: typeof usuario.departamentosPermitidos === 'string'
									? JSON.parse(usuario.departamentosPermitidos)
									: [] as string[] as dep, i}
								{dep}{i < (usuario.departamentosPermitidos?.length ?? 0) - 1 ? ', ' : ''}
							{/each}
						</p>
					</div>
				</details>
			</li>
		{/each}
	</ul>
</main>

<style>
main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2em 1em;
}

h1, h2 {
    text-align: center;
    color: #1976d2;
    margin-bottom: 0.7em;
}

.btn {
    padding: 0.5em 1.2em;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    margin-right: 0.5em;
}

.primary-btn {
    background: #1976d2;
    color: #fff;
}

.primary-btn:hover {
    background: #125ea6;
}

.secondary-btn {
    background: #e3f0fc;
    color: #1976d2;
}

.secondary-btn:hover {
    background: #b3c6e6;
}

.user-list {
    list-style: none;
    padding: 0;
    max-width: 800px;
    margin: 2em auto 0 auto;
}

.user-item {
    background: #fff;
    border: 1px solid #e0e7ef;
    border-radius: 10px;
    margin-bottom: 12px;
    padding: 15px;
    box-shadow: 0 3px 6px rgba(25, 118, 210, 0.07);
    transition: transform 0.2s;
}

.user-item:hover {
    transform: scale(1.02);
}

.role-badge {
    background: #28a745;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    margin-left: 1em;
}

.register-form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.register-form {
    background: white;
    padding: 2em 1.5em 1.5em 1.5em;
    border-radius: 12px;
    box-shadow: 0 5px 10px rgba(25, 118, 210, 0.13);
    width: 420px;
    text-align: center;
    position: relative;
}

.close-button {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 22px;
    border: none;
    background: none;
    cursor: pointer;
    color: #e53935;
}

.close-button:hover {
    color: #a71d2a;
}

label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: #1976d2;
    text-align: left;
}

input[type="text"],
input[type="password"],
select {
    padding: 0.5em;
    border: 1.5px solid #60a5fa;
    border-radius: 6px;
    font-size: 1em;
    width: 100%;
    margin-top: 0.2em;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.7em;
    margin-top: 1.2em;
}

.user-details {
    margin-top: 10px;
    padding: 15px;
    background-color: #f8fbff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(25, 118, 210, 0.07);
}

.user-details p {
    margin: 5px 0;
    font-size: 15px;
    color: #333;
}

.departamentos-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.departamento-btn {
    padding: 8px 12px;
    border: 1.5px solid #1976d2;
    border-radius: 6px;
    background-color: #fff;
    color: #1976d2;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
}

.departamento-btn.active,
.departamento-btn.active:hover {
    background-color: #1976d2;
    color: #fff;
}

.departamento-btn:hover {
    background-color: #e3f0fc;
}

.error {
    color: #fff;
    background: #e53935;
    padding: 0.7em 1em;
    border-radius: 6px;
    margin-bottom: 1em;
    text-align: left;
}
</style>
