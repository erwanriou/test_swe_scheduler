// REQUIRES FONCTION
const requires = paths => Object.entries(paths)?.map(folder => folder?.[1]?.map(path => require(`../listeners/${folder?.[0]}/${path}/${path}`) ?? []))

const paths = {}

const listeners = requires(paths).flat()
module.exports = listeners
