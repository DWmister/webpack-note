import React from 'react'
import ReactDom from 'react-dom'
import '../css/search.less'
import pride from '../img/pride.jpg'
import bg from '../img/bg.jpg'
import sAddNumber from 's-add-number'
import { hi } from '../common/common'
// import 'babel-polyfill'

class Search extends React.Component {
  constructor() {
    super(...arguments)
    this.state = {
      Text: null
    }
  }
  onloadComponent () {
    // 动态import
    import('./text.js').then((info) => {
      this.setState({
        Text: info.default
      })
    })
  }
  render () {
    const char = hi('')
    const { Text } = this.state
    const num = sAddNumber('999999', '1')
    return(
      <div className="box">
        {
          Text ? <Text /> : null
        }
        { num }
        <span className="text">{ char } {this.props.text}!</span>
        <img src= { bg }/>
        <img src={ pride } onClick = { this.onloadComponent.bind(this) }/>
      </div>
    )
  }
}

ReactDom.render(
  <Search text="React!" />,
  document.getElementById('root')
)
