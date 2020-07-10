#! /usr/bin/env node
const program = require('commander')
const didYouMean = require('didyoumean')
const chalk = require('chalk')
const minimist = require('minimist')
didYouMean.threshold = 0.6

// 定义版本和使用用法
program
  .version(`bms ${require('../package.json').version}`)
  .usage('<command> [options]')

// create 配置
program
  .command('create <app-name>')
  .description('create a new project')
  .option('-d, --default', 'Skip prompts and use default preset')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('-d, --default', 'Skip prompts and use default preset')

  .action((name, cmd) => {
    const options = cleanArgs(cmd)
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(
        chalk.yellow(
          '\n Info: 你提供了多个项目名称，第一个将作为项目名称，其余的会被忽略。'
        )
      )
    }
    require('../src/lib/create')(name, options)
  })
// 参数输入的不全直接提示
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.arguments('<command>').action((cmd) => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
  suggestCommands(cmd)
})

// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(
    `  Run ${chalk.cyan(
      `bms <command> --help`
    )} for detailed usage of given command.`
  )
  console.log()
})
program.commands.forEach((c) => c.on('--help', () => console.log()))

program.parse(process.argv)

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

// 拿出所有的options
function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach((o) => {
    const key = camelize(o.long.replace(/^--/, ''))
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

// 提示
function suggestCommands (unknownCommand) {
  const availableCommands = program.commands.map((cmd) => cmd._name)
  const suggestion = didYouMean(unknownCommand, availableCommands)
  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}
