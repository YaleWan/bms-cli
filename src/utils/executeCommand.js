const chalk = require('chalk')
const execa = require('execa')
const EventEmitter = require('events')
const readline = require('readline')

class InstallProgress extends EventEmitter {
  constructor () {
    super()

    this._progress = -1
  }

  get progress () {
    return this._progress
  }

  set progress (value) {
    this._progress = value
    this.emit('progress', value)
  }

  get enabled () {
    return this._progress !== -1
  }

  set enabled (value) {
    this.progress = value ? 0 : -1
  }

  log (value) {
    this.emit('log', value)
  }
}

function toStartOfLine (stream) {
  if (!chalk.supportsColor) {
    stream.write('\r')
    return
  }
  readline.cursorTo(stream, 0)
}

function renderProgressBar (curr, total) {
  const ratio = Math.min(Math.max(curr / total, 0), 1)
  const bar = ` ${curr}/${total}`
  const availableSpace = Math.max(0, process.stderr.columns - bar.length - 3)
  const width = Math.min(total, availableSpace)
  const completeLength = Math.round(width * ratio)
  const complete = `#`.repeat(completeLength)
  const incomplete = `-`.repeat(width - completeLength)
  toStartOfLine(process.stderr)
  process.stderr.write(`[${complete}${incomplete}]${bar}`)
}

const progress = exports.progress = new InstallProgress()
exports.executeCommand = function executeCommand (command, args, cwd) {
  return new Promise((resolve, reject) => {
    progress.enabled = false

    const child = execa(command, args, {
      cwd,
      stdio: ['inherit', 'inherit', command === 'yarn' ? 'pipe' : 'inherit']
    })

    if (command === 'yarn') {
      child.stderr.on('data', buf => {
        const str = buf.toString()
        if (/warning/.test(str)) {
          return
        }

        const progressBarMatch = str.match(/\[.*\] (\d+)\/(\d+)/)
        if (progressBarMatch) {
          renderProgressBar(progressBarMatch[1], progressBarMatch[2])
          return
        }

        process.stderr.write(buf)
      })
    }

    child.on('close', code => {
      if (code !== 0) {
        reject(`command failed: ${command} ${args.join(' ')}`)
        return
      }
      resolve()
    })
  })
}
