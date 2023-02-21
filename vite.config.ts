import type { ManifestV3Export } from '@crxjs/vite-plugin';
import { crx } from '@crxjs/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, PluginOption } from 'vite';
import manifest from './manifest.json';
import { version } from './package.json';

const ENABLES_VISUALIZER = getEnv<boolean>('ENABLES_VISUALIZER') ?? false;

manifest.version = version;

export default defineConfig({
  plugins: [
    crx({ manifest: manifest as ManifestV3Export }),
    ...(ENABLES_VISUALIZER ? [visualizer() as PluginOption] : []),
  ],
});

// utils

function getEnv<T>(name: string): T | undefined {
  const val = process.env[name];
  return val === undefined ? val : JSON.parse(val);
}
