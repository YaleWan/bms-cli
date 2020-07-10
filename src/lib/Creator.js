const EventEmitter = require('events')
const inquirer = require('inquirer')
const run = require('../utils/run')
const cloneDeep = require('lodash.clonedeep')

const PromptModuleAPI = require('../utils/PromptModuleApi')
const path = require('path')

const { logWithSpinner, stopSpinner, failSpinner } = require('../utils/spinner')
const { log, error } = require('../utils/logger')

const { executeCommand } = require('../utils/executeCommand')
const chalk = require('chalk')
const shell = require('shelljs')
module.exports = class Creator extends EventEmitter {
  constructor (name, context, promptModules) {
    super()
    this.name = name
    this.context = context
    const { frameworkPrompt } = this.resolveFrameworks()
    this.promptModules = promptModules
    this.frameworkPrompt = frameworkPrompt
    this.injectedFeatures = []
    this.promptCompleteCbs = []
    // 拿到所有的promptApi，并且把当前的上下文传进去
    const promptApi = new PromptModuleAPI(this)
    promptModules.forEach((p) => p(promptApi))
  }

  async create (cliOptions = {}, preset = null) {
    // TODO 增加保存默认preset功能 和 默认参数
    // 通过交互命令来获取 preset
    preset = await this.promptAndResolvePreset()

    preset = cloneDeep(preset)
    try {
      logWithSpinner('📦  Downloading template....')
      await run(`git clone ${preset.git} ${this.name}`)
      stopSpinner()
      const projectDir = path.resolve(process.cwd(), this.name)
      log(`📦  Installing additional dependencies...`)

      // TODO 判断当前是使用npm 还是 yarn  安装

      await executeCommand('yarn', ['install'], projectDir)
      console.log(`\n\n\n\n\n\n ${chalk.cyan(`✨ cd ./${this.name}`)}`)
      console.log(`\n ${chalk.cyan('✨ yarn serve')}`)
    } catch (err) {
      failSpinner()
      error(err.message)
    }
  }
  // 通过命令获取所有的preset
  async promptAndResolvePreset () {
    const answers = await inquirer.prompt(this.resolveFinalPrompts())
    this.promptCompleteCbs.forEach((cb) => cb(answers))
    return answers
  }
  // 获取所有的inquirer的提示信息
  resolveFinalPrompts () {
    this.injectedFeatures.forEach((prompt) => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = (answers) => {
        return originalWhen(answers)
      }
    })
    const prompts = [this.frameworkPrompt, ...this.injectedFeatures]
    return prompts
  }
  // 获取所有的
  resolveFrameworks () {
    const frameworkPrompt = {
      name: 'framework',
      type: 'list',
      message: 'Check the framework needed for your project:',
      choices: [],
      pageSize: 10
    }
    return {
      frameworkPrompt
    }
  }
}
