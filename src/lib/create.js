const inquirer = require('inquirer')
const path = require('path')
const chalk = require('chalk')
const validateProjectName = require('validate-npm-package-name')
const fs = require('fs-extra')
const Creator = require('./Creator')
const { getPromptModules } = require('../utils/createPrompt')

async function create (projectName, options) {
  const cwd = options.cwd || process.cwd()
  const inCurrent = projectName === '.'
  const name = inCurrent ? path.relative('../', cwd) : projectName
  const targetDir = path.resolve(cwd, projectName || '.')

  const result = validateProjectName(projectName)

  // 校验传进的名字是否符合规范
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: ${name}`))
    result.errors &&
      result.errors.forEach(err => {
        console.error(chalk.red.dim(`Err: ${err}`))
      })
    result.warnings &&
      result.warnings.forEach(warn => {
        console.error(chalk.red.dim('Warning: ' + warn))
      })
    process.exit(1)
  }

  // 判断当前目录中是否存在目录
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `Target directory ${chalk.cyan(
            targetDir
          )} already exists. Pick an action:`,
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false }
          ]
        }
      ])
      if (!action) {
        return
      } else if (action === 'overwrite') {
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
        await fs.remove(targetDir)
      }
    }
  }

  // 创建creator
  const creator = new Creator(name, targetDir, getPromptModules())
  await creator.create(options)
}
module.exports = create
