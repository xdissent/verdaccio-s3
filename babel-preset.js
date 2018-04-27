module.exports = {
  presets: [
    [
      'env',
      {
        targets: {node: 6},
        modules: process.env.BABEL_ENV === 'es' ? false : 'commonjs'
      }
    ],
    'stage-2',
    'react'
  ]
}
