#!/usr/bin/env node

/**
 * Script to generate TypeScript types from Supabase schema
 * while preserving manual type definitions
 * 
 * This script:
 * 1. Generates types from Supabase database schema
 * 2. Preserves manual type definitions marked with "MANUAL TYPE DEFINITIONS"
 * 3. Combines both sections into the final database.ts file
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { unlinkSync } from 'fs';

const DATABASE_TYPES_FILE = join(process.cwd(), 'types', 'database.ts');
const TEMP_FILE = join(process.cwd(), 'types', 'database.tmp.ts');

// Marker to identify where manual definitions start
const MANUAL_SECTION_MARKER = '// MANUAL TYPE DEFINITIONS';

try {
  // Check if database.ts exists and extract manual section
  let manualSection = '';
  
  if (existsSync(DATABASE_TYPES_FILE)) {
    const currentContent = readFileSync(DATABASE_TYPES_FILE, 'utf-8');
    const manualIndex = currentContent.indexOf(MANUAL_SECTION_MARKER);
    
    if (manualIndex !== -1) {
      manualSection = currentContent.substring(manualIndex);
      console.log('✓ Found manual type definitions, will preserve them');
    }
  }

  // Generate types from Supabase to temporary file
  console.log('Generating types from Supabase schema...');
  
  // Check if .env file exists
  const envFile = join(process.cwd(), '.env');
  if (!existsSync(envFile)) {
    console.warn('⚠ Warning: .env not found. Make sure SUPABASE_PROJECT_ID is set.');
  }

  try {
    // Use dotenv-cli to load .env and run supabase gen types
    // This ensures SUPABASE_PROJECT_ID is available
    execSync(
      `dotenv -e .env npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > "${TEMP_FILE}"`,
      { stdio: 'inherit', shell: true }
    );
  } catch (error) {
    console.error('Error generating types. Make sure:');
    console.error('  1. SUPABASE_PROJECT_ID is set in .env');
    console.error('  2. You have access to your Supabase project');
    console.error('  3. dotenv-cli is installed (npm install -D dotenv-cli)');
    process.exit(1);
  }

  // Read generated content
  const generatedContent = readFileSync(TEMP_FILE, 'utf-8');

  // Combine generated content with manual section
  const finalContent = manualSection
    ? `${generatedContent.trim()}\n\n${manualSection}`
    : generatedContent;

  // Write final content
  writeFileSync(DATABASE_TYPES_FILE, finalContent, 'utf-8');

  // Clean up temporary file
  if (existsSync(TEMP_FILE)) {
    unlinkSync(TEMP_FILE);
  }

  console.log('✓ Types generated successfully');
  if (manualSection) {
    console.log('✓ Manual type definitions preserved');
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

