const { build } = require('esbuild')

build({
  entryPoints: ['server/index.js'],
  outfile: 'resource/server/index.js',
  bundle: true,
  loader: {
    '.ts': 'ts',
    '.js': 'js',
  },
  write: true,
  platform: 'node',
  target: 'node16',
})
  .then(() => {
    console.log('Server built successfully')
  })
  .catch(() => process.exit(1))
