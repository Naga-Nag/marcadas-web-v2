<script>
	import { goto } from '$app/navigation';
	import { login } from '$lib/apiController/usuarioApi';

	let username = '';
	let password = '';

	async function handleLogin() {
		console.log('LOGIN :: handleLogin: Starting login process for user', username);
		try {
			const { user, token } = await login(username, password);
			console.log('LOGIN :: handleLogin: Login completed, redirecting to home');
			localStorage.setItem('token', token);
			goto('/');
		} catch (error) {
			console.error('LOGIN :: handleLogin: Error in login process', error);
		}
	}
</script>

<div class="main">
	<div class="login-container">
		<h1>Iniciar Sesión</h1>
		<form on:submit|preventDefault={handleLogin}>
			<div class="form-group">
				<label for="username">Usuario:</label>
				<input type="text" id="username" bind:value={username} required autocomplete="username" />
			</div>
			<div class="form-group">
				<label for="password">Contraseña:</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					autocomplete="current-password"
				/>
			</div>
			<button type="submit" class="login-btn">Iniciar Sesión</button>
		</form>
	</div>
</div>

<style>
    .main {
        display: flex;
        justify-content: center;
    }

	.login-container {
        position: relative;
        flex-direction: column;
        margin-top: 4rem;
		background: rgba(255, 255, 255);
		border-radius: 18px;
		padding: 5rem;
		border: 1.5px solid #60a5fa33;
	}

	h1 {
		color: #1976d2;
		margin-bottom: 2rem;
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-shadow: 0 2px 8px #60a5fa22;
	}

	.form-group {
		margin-bottom: 1.3rem;
	}

	label {
		color: #1976d2;
		font-size: 1.05rem;
		margin-bottom: 0.3rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	input {
		padding: 0.7rem;
		border: 1.5px solid #60a5fa;
		border-radius: 8px;
		background: #f8fbff;
		color: #222;
		font-size: 1.07rem;
		font-weight: 600;
		width: 100%;
		transition:
			border 0.2s,
			box-shadow 0.2s;
		margin-top: 0.1rem;
	}

	input:focus {
		outline: none;
		border-color: #1976d2;
		box-shadow: 0 0 8px #60a5fa55;
		background: #fff;
	}

	.login-btn {
		width: 100%;
		padding: 0.8rem 0;
		background: linear-gradient(90deg, #1976d2 0%, #60a5fa 100%);
		color: #fff;
		font-size: 1.1rem;
		font-weight: 700;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		margin-top: 0.5rem;
		box-shadow: 0 2px 8px #60a5fa33;
		transition:
			background 0.2s,
			box-shadow 0.2s;
		letter-spacing: 0.03em;
	}

	.login-btn:hover,
	.login-btn:focus {
		background: linear-gradient(90deg, #1565c0 0%, #42a5f5 100%);
		box-shadow: 0 4px 16px #60a5fa55;
	}

	@media (max-width: 500px) {
		.login-container {
			max-width: 95vw;
			padding: 1.5rem 0.7rem 1.2rem 0.7rem;
		}
		h1 {
			font-size: 1.3rem;
		}
	}
</style>
