import React,{Component ,lazy, Suspense} from 'react';
import logo from './logo.svg';
import './App.css';

const About = lazy(() => import(/*这边加入的注释webpack会自动更改到chunk的前缀方便确认*/'./About.jsx'))
//  ErroBundary 用于防止组件渲染错误却无法捕捉 在react的生命周期函数componentDidCatch中获取错误状态，在render函数渲染前判断是否错误
class App extends Component {
  state = {
    hasError: false
  } 
  
  componentDidCatch() {
    this.state=({
      hasError:true
    });
  }
  render(){
    if(this.state.hasError){
      return <div>error</div>
    }
     return (
       <div>
         <Suspense 
         fallback={<div> loading </div>}>
           <About> </About>
         </Suspense>
       </div>
     )
   }
 }
   


export default App;
