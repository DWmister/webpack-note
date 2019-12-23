'use strict';

// 服务端打包的入口文件
const React = require('react')
const pride = require('../img/pride.jpg')
const sAddNumber = require('s-add-number')
require('../css/search.less')

class Search extends React.Component {
  constructor() {
    super(...arguments)
    this.state = {
      Text: null
    }
  }
  onloadComponent() {
    // 动态import
    require('./text.js').then((info) => {
      this.setState({
        Text: info.default
      })
    })
  }
  render () {
    const { Text } = this.state
    const num = sAddNumber('999999', '1')
    return(
      <div className="box">
        {
          Text ? <Text /> : null
        }
        { num }
        <span className="text">Hello SSR</span>
        <img src={ pride.default } onClick = { this.onloadComponent.bind(this) }/>
      </div>
    )
  }
}
module.exports = <Search />
