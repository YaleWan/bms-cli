exports.getPromptModules = () => {
  return [
    'vue',
    'react'
  ].map(p => require(`../promptModules/${p}`))
}
