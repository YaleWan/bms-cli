const figlet = require('figlet')
module.exports = function () {
  figlet.text('BMS!!', {
    font: 'Ghost',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  }, function (err, data) {
    if (err) {
      console.log('Something went wrong...')
      console.dir(err)
      return
    }
    console.log(data)
  })
}
