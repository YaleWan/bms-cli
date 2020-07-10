module.exports = class PromptModuleAPI {
  constructor (creator) {
    this.creator = creator
  }
  injectFramework (framework) {
    this.creator.frameworkPrompt.choices.push(framework)
  }
  injectFeature (feature) {
    this.creator.injectedFeatures.push(feature)
  }

  injectPrompt (prompt) {
    this.creator.injectedPrompts.push(prompt)
  }

  onPromptComplete (cb) {
    this.creator.promptCompleteCbs.push(cb)
  }
}
