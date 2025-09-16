import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
     // Remove the authentication token
     cookies.delete('token', { path: '/', secure: Bun.env.BUILD === 'production' });
     // Redirect the user to the login page
     throw redirect(302, '/login');
};