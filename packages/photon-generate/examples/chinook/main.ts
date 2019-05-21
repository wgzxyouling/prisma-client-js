import { Photon, Artist } from './@generated/photon'

async function main() {
  const prisma = new Photon({ debug: true })
  console.clear()
  const result = await prisma.artists.findMany({
    first: 20,
    select: {},
  })
  console.dir(result, { depth: null })
  prisma.close()
}

main().catch(console.error)