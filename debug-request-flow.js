// Detailed debug script to trace the exact request flow
console.log('=== Detailed TRPC Request Flow Debug ===');

// Let's check if there are any other potential redirect sources

async function checkFileForRedirects(filePath) {
  try {
    const content = await Bun.file(filePath).text();
    const lines = content.split('\n');
    
    console.log(`\\n--- Checking ${filePath} ---`);
    
    // Look for patterns that might cause redirects
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('redirect') || line.includes('goto') || line.includes('Location:')) {
        console.log(`  Line ${i + 1}: ${line.trim()}`);
      }
    }
    
    // Look for any HTML response patterns
    if (content.includes('text/html') || content.includes('<!doctype') || content.includes('<html')) {
      console.log(`  WARNING: HTML content patterns found in ${filePath}`);
    }
    
    return content;
 } catch (error) {
    console.log(`  ERROR reading ${filePath}: ${error.message}`);
    return null;
  }
}

async function main() {
  // Check key files that might cause redirects
 const files = [
    'src/hooks.server.ts',
    'src/routes/+layout.server.ts',
    'src/routes/+layout.ts',
    'src/routes/+page.server.ts', // if it exists
    'src/routes/login/+page.server.ts', // if it exists
    'src/routes/api/trpc/[...trpc]/+server.ts'
  ];
  
  for (const file of files) {
    await checkFileForRedirects(file);
  }
  
  // Check for any middleware or other potential sources
  console.log('\\n--- Checking package.json for middleware ---');
  try {
    const packageJsonText = await Bun.file('package.json').text();
    const packageJson = JSON.parse(packageJsonText);
    if (packageJson.dependencies && packageJson.dependencies['@sveltejs/kit']) {
      console.log('  SvelteKit detected');
    }
    if (packageJson.type) {
      console.log(`  Package type: ${packageJson.type}`);
    }
  } catch (error) {
    console.log(`  Could not read package.json: ${error.message}`);
  }
  
  // Check for other potential SvelteKit hooks
  const potentialHookFiles = [
    'hooks.ts',
    'hooks.client.ts',
    'hooks.server.ts',
    'src/hooks.ts',
    'src/hooks.client.ts'
  ];
  
  for (const hookFile of potentialHookFiles) {
    try {
      const file = Bun.file(hookFile);
      await file.size; // This will throw if file doesn't exist
      console.log(`\\n  Found potential hook file: ${hookFile}`);
      await checkFileForRedirects(hookFile);
    } catch {
      // File doesn't exist, which is fine
    }
  }
  
  console.log('\\n=== End Detailed Debug ===');
}

main().catch(console.error);