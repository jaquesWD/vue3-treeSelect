import vue from '@vitejs/plugin-vue'

import createAutoImport from './auto-import'


export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue()]
  vitePlugins.push(createAutoImport())
  return vitePlugins
}