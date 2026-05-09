import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('ux copy and deploy readiness', () => {
  it('shows footer copyright and legal links in bottom navigation', () => {
    const source = read('src/components/BottomNav.tsx');

    expect(source).toContain("t('footer.copyright')");
    expect(source).toContain("to=\"/terms\"");
    expect(source).toContain("to=\"/ka/privacy\"");
  });

  it('uses npm-based Vercel build defaults compatible with this repository', () => {
    const vercel = read('vercel.json');

    expect(vercel).toContain('"installCommand": "npm ci"');
    expect(vercel).toContain('"buildCommand": "npm run build"');
    expect(vercel).toContain('"outputDirectory": "dist"');
  });

  it('documents required environment variables for Vercel deploy', () => {
    const readme = read('README.md');

    expect(readme).toContain('VITE_SUPABASE_URL');
    expect(readme).toContain('VITE_SUPABASE_ANON_KEY');
    expect(readme).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(readme).toContain('ADMIN_SESSION_SECRET');
  });
});
