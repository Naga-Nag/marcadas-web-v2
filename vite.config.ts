import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		origin: 'http://marcadas.arpb.mil',
		fs: {
			allow: [
				'/parte-template.xlsx'
			]
		}
	}
});
