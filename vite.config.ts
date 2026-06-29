import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	base: '/toolbox/',
	plugins: [
		tailwindcss(),
		svelte({
			compilerOptions: {
				runes: ({ filename }) => (filename.includes('node_modules') ? undefined : true)
			}
		})
	]
});
