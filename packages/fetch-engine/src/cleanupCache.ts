import fs from 'fs'
import path from 'path'
import { getRootCacheDir } from './util'
import rimraf from 'rimraf'
import { promisify } from 'util'
import pMap from 'p-map'
import Debug from 'debug'
const debug = Debug('cleanupCache')
const del = promisify(rimraf)
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

export async function cleanupCache() {
  try {
    const rootCacheDir = await getRootCacheDir()
    const channels = ['master', 'alpha']

    for (const channel of channels) {
      const cacheDir = path.join(rootCacheDir, channel)
      const dirs = await readdir(cacheDir)
      const dirsWithMeta = await Promise.all(
        dirs.map(async dirName => {
          const dir = path.join(cacheDir, dirName)
          const statResult = await stat(dir)

          return {
            dir,
            created: statResult.birthtime,
          }
        }),
      )
      dirsWithMeta.sort((a, b) => (a.created < b.created ? 1 : -1))
      const dirsToRemove = dirsWithMeta.slice(5)
      await pMap(dirsToRemove, dir => del(dir.dir), { concurrency: 20 })
    }
  } catch (e) {
    debug(e)
  }
}
