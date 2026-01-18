const requires = paths => Object.entries(paths)?.map(folder => folder?.[1]?.map(path => require(`./${folder?.[0]}/${path}/${path}`) ?? []))

const paths = {
  document: [
    // BATCHS
    "documentProcess"
  ]
}

// APPLY REQUIRES
requires(paths)
