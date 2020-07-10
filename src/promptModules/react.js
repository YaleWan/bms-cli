module.exports = (cli) => {
  cli.injectFramework({
    name: 'React',
    value: 'react',
    short: 'React',
    description: 'React Template'
  })

  cli.injectFeature({
    name: 'react',
    when: (answers) => answers.framework === 'react',
    type: 'list',
    message: `Choose the React Template project`,
    description: `Choose the React Template project`,
    choices: [
      {
        name: 'react-template',
        value: 'reactTemplate'
      }
    ]
  })
  cli.onPromptComplete(answers => {
    if (answers.feature === 'reactTemplate') {
      answers.git = ''
    }
  })
}
