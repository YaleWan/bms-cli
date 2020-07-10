module.exports = cli => {
  cli.injectFramework({
    name: 'Vue',
    value: 'vue',
    short: 'Vue',
    description: 'Vue Template'
  })

  cli.injectFeature({
    name: 'feature',
    when: answers => answers.framework === 'vue',
    type: 'list',
    message: `Choose the Vue Template project`,
    description: `Choose the Vue Template project`,
    choices: [
      {
        name: 'c3-bettle',
        value: 'c3Bettle'
      }
    ]
  })
  cli.onPromptComplete(answers => {
    if (answers.feature === 'c3Bettle') {
      answers.git = 'git@182.254.153.226:fe/fe-nodejs/c3-beetle.git'
    }
  })
}
