import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
     console.log('LOGOUT :: Server endpoint: Initiating server-side logout');
     // Remove the authentication token
     cookies.delete('token', { path: '/', secure: Bun.env.BUILD === 'production' });
     console.log('LOGOUT :: Server endpoint: Token cookie deleted');
     // Redirect the user to the login page
     throw redirect(302, '/login');
};