# React新特性

## 1.context

#### 定义

提供了一种方式，能让数据在组件树中传递而不必一级一级手动传递

#### contextType

能够代替Consumer 但前提是组件就一个context

```jsx
const BatteryContext = createContext();
class Leaf extends  Component{
  render(){
    return (
      <BatteryContext.Consumer>
        {
          battery => <h1>Battery:{battery}</h1>
        }
        </BatteryContext.Consumer>
      )
  }
}
class Middle extends Component {
  render(){
    return <Leaf/>;
  }
}
class App extends Component {
 state = {
   battery : 60
 }
  render() {
    const {battery} = this.state;
    return (
      <BatteryContext.Provider value={battery}>
        <button type="button" onClick={()=> this.setState({battery: battery - 1}) }>
          press
        </button>
        <Middle/>
      </BatteryContext.Provider>
    );
  }
}
```

##  2.lazy函数使用

  通常配合Suspense使用

```jsx
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
```

## 3.Memo渲染

#### PureComponent的几个坑

1.子组件更新父组件不用更新可以用purecomponent react内部逻辑进行对比sholudComponentUpdate拒绝更新，但是如果子组件更新的只是对象的属性（对象指针没有发生改变）还是一样拒绝更新，

2.当子组件的某个元素带有内联回调函数，当每次渲染时即便有PureComponent还是无法阻止父组件渲染

但我们可以把这个内敛回调函数拿出来：const fallback = () => { xxxxxxx }//这样写可以引用时就不用bind(this)

#### Memo怎么用？

用于无状态组件(看作是函数所以无法继承PureComponent了)

```jsx
const Foo = memo(function Foo(props) {
    console.log('我被渲染了');
	return <div>{props.person.age}</div>
 });
class App extends Component {
    state = { person: {age:1} };
	callback = () => {xxxxxx};
	render() {
        return(
        	<Foo person={person} cb={this.callback}/>
        )
    }
}
```



```jsx
class Foo extends PureComponent {
  render(){
    return (
    <div>{this.props.person.age}</div>
    )
  }
}
class App extends Component {
  state = {
    count:0,
    person:{
      age:1,
      name:'hh'
    }
  }
  render() {
    const person = this.state.person;
    return(
      <div>
        <button type="button" onClick={() => {
          person.age++;
          this.setState({person}) 
          }}>
          add
        </button>
        <Foo person="mike"/>
      </div>
    )
  }
}

```

# React Hooks

## 一、概念与意义

Hooks let you use state and other React features without writing a class

这个版本就不谈无状态组件 只谈类组件和函数组件

### 1.类组件的不足

#### 状态逻辑复用难

​	a.缺少复用机制

​	b.渲染属性和高阶组件导致层级冗余

#### 趋向复杂难以维护

​	a.生命周期函数混杂不相干逻辑

​	b.相干逻辑分散在不同生命周期

#### this指向的困扰

​	a.内联函数过度创建新句柄

​	b.类成员函数不能保证this

### 2.Hooks优势

​	a.函数组件无this问题

​	b.自定义Hook方便复用状态逻辑

​	C.副作用的关注点分离

## 二、使用State Hooks

## 1.useState

#### 安装

因为useState 必须按照固定顺序加载书写 容易出错所以

npm i eslint-plugin-react-hooks -D

安装插件帮助我们语法规范

经典案例:

```jsx
import { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}
```

此例子中, `useState(0)` 是最新的 hooks api;

#### **语法**

```jsx
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
```

其中 state 是他的值, setState 是用来设置值的函数, initialState 是初始值

**useState-initialState**

该初始值可以接受任何参数,但是记得当他接受为一个函数时,就变成了`Lazy initialization` (延迟初始化)
该函数返回值即为initialState

```jsx
const [count, setCount] = useState(0);

const defaultCount = props.defaultCount || 0;
const [count, setCount] = useState(defaultCount);

const [count, setCount] = useState(()=>0);
// 这3种初始化方式 是相等的,但是在函数为初始值时会被执行一次会有性能损耗 虽然我们只是想在第一次加载时使用初始值
//所以要用到下面的方式
const [count, setCount] = useState(()=>{
    console.log('这里只会在初始化的时候执行')
    // class 中的 constructor 的操作都可以移植到这里
    return 0
});
// 当第一次执行完毕后 就和另一句的代码是相同的效果了
```

**useState-setState**

也许很多人 在使用 class 的 setState 时候,会经常使用他的回调函数,
但是这里很遗憾,他只接受新的值,如果想要对应的回调,可以使用useEffect,这个问题等会会提供一个跳转链接

## 2.useEffect

#### 语法

```
function useEffect(effect: EffectCallback, deps?: DependencyList): void;
```

第二个参数决定了useEffect是否执行  第二个参数是一个数组 通过比较数组的每一项来判断：这个数组是否改变了 

1.如果不给这个数组 默认是每次都执行，

2.如果给[ ]空数组 则只执行一次

3.如果给了自定义数组 那么则这个数组改变时才会发生变动

经典案例:

```jsx
useEffect(() => {
  console.log('在 dep 改变时触发,若无 dep 则,每次更新组件都会触发')
  return () => {
    console.log('在组件 unmount 时触发')
  };
});
```

deps 必须是一个数组,但是如果是一个空数组时:

```jsx
  useEffect(() => {
    console.log('效果的等于 componentDidMount')
  }, [])
```

#### 回调函数的情况

```jsx
useEffect(() => {
  document.querySelector('#size').addEventListener('click',false);
    return () => {      document.querySelector('#size').removeEventListener('click',false);
    };
})//通过回调函数来保证生命周期的统一
```

## 三、Context Hooks的使用

```jsx
const CountContext = createContext();
function Counter(){
  const count = useContext(CountContext);
  retrun (
    <div>{count}</div>
  )
}
class Foo extends Component {
  render(){
    return (
      <CountContext.Consumer>
        {
          count => <h1>{count}</h1>
        }
      </CountContext.Consumer>
    )
  }
}
class Bar extends Component {
  static contextType = CountContext;
    render() {
      const count = this.context;
      return(
        <h1>{count}</h1>
      );
    }
  }
}
function App (props){
  const [count, setCount] = useState(0);
  return (
   <div>
     <button
    type="button"
    onClick = {() => {setCount( count + 1)}}>
      click({count})
    </button>
    <CountContext.Provider value={count}>
      <Foo/>
      <Bar/>
      <Counter/>
   </CountContext.Provider>
   </div>
    
  )
}
```

