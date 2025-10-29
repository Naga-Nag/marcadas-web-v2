// Debug script to trace TRPC request flow
console.log('=== TRPC Request Flow Debug ===');

// Check all relevant files for potential issues
const filesToCheck = [
  'src/hooks.server.ts',
  'src/routes/api/trpc/[...trpc]/+server.ts',
  'src/lib/server/trpc/routers/usuarios.ts',
  'src/lib/trpc/client.ts'
];

for (const file of filesToCheck) {
  try {
    const content = await Bun.file(file).text();
    console.log(`\\n--- Contents of ${file} ---`);
    
    // Look for common patterns that might cause issues
    if (content.includes('redirect(')) {
      console.log(`  FOUND REDIRECT in ${file}`);
    }
    if (content.includes('throw redirect')) {
      console.log(`  FOUND THROW REDIRECT in ${file}`);
    }
    if (content.includes('html') || content.includes('<!doctype') || content.includes('<html')) {
      console.log(`  FOUND HTML CONTENT REFERENCE in ${file}`);
    }
    if (file === 'src/hooks.server.ts' && content.includes('rutasPublicas')) {
      const publicRoutesMatch = content.match(/rutasPublicas\s*=\s*\[([^\]]+)\]/);
      if (publicRoutesMatch) {
        console.log(`  PUBLIC ROUTES: ${publicRoutesMatch[1]}`);
      }
    }
  } catch (error) {
    console.log(`\\n--- File does not exist or error reading: ${file} - ${error.message} ---`);
  }
}

// Check environment variables
console.log('\\n--- Environment Check ---');
if (Bun.env.JWT_SECRET) {
  console.log('JWT_SECRET is defined');
} else {
  console.log('WARNING: JWT_SECRET is NOT defined');
}

// Additional checks for potential conflicting routes
const routeFiles = [
  'src/routes/+layout.server.ts',
  'src/routes/+layout.ts',
  'src/app.html'
];

for (const file of routeFiles) {
  try {
    const content = await Bun.file(file).text();
    console.log(`\\n--- Checking for redirects in ${file} ---`);
    if (content.includes('redirect') || content.includes('goto')) {
      console.log(`  FOUND redirect/goto in ${file}`);
    }
  } catch (error) {
    console.log(`\\n--- File does not exist or error reading: ${file} - ${error.message} ---`);
  }
}

console.log('\\n=== End Debug Output ===');