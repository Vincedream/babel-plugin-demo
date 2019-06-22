## 前言

说到 babel 你肯定会先想到 babel 可以将还未被浏览器实现的 ES6 规范转换成能够运行 ES5 规范，或者可以将 JSX 转换为浏览器能识别的  HTML 结构，那么 babel 是如何进行这个转换的步骤呢，下面我将通过开发一个简单的 babel 插件来解释这整个过程，希望你对 Babel 插件原理与 AST 有新的认知。

### Babel 运行阶段

从上面的分析，我们大概能猜出 Babel 的运行过程是：原始代码 -> 修改代码，那么在这个转换的过程中，我们需要知道以下三个重要的步骤。

#### 解析

首先需要将 JavaScript 字符串经过词法分析、语法分析后，转换为计算机更易处理的表现形式，称之为“抽象语法树(AST)”，这个步骤我们使用了 [Babylon](https://github.com/babel/babylon) 解析器。

#### 转换

当 JavaScript 从字符串转换为 AST 后，我们就能更方便地对其进行浏览、分析和有规律的修改，根据我们的需求，将其转换为新的 AST，[babel-traverse](https://www.npmjs.com/package/babel-traverse) 是一个很好的转换工具，使得我们能够很便利的操作 AST 。

#### 生成

最后，我们将修改完的 AST 进行反向处理，生成 JavaScript 字符串，整个转换过程也就完成了，这一步当中，我们使用到了 [babel-generator](https://www.npmjs.com/package/babel-generator) 模块。

### 什么是 AST

之前听过一句话：“如果你能熟练地操作 AST ，那么你真的可以为所欲为。”，当时并不理解其含义，直到真正了解 AST 后，才发现 AST 对编程语言的重要性是不可估量的。

在计算机科学中，抽象语法树（abstract syntax tree 或者缩写为 AST），或者语法树（syntax tree），是源代码的抽象语法结构的树状表现形式，这里特指编程语言的源代码。树上的每个节点都表示源代码中的一种结构。

> 之所以说语法是「抽象」的，是因为这里的语法并不会表示出真实语法中出现的每个细节。

JavaScript 程序一般是由一系列字符组成的，我们可以使用匹配的字符（[], {}, ()），成对的字符（'', ""）和缩进让程序解析起来更加简单，但是对计算机来说，这些字符在内存中仅仅是个数值，并不能处理这些高级问题，所以我们需要找到一种方式，将其转换成计算机能理解的结构。

我们简单看下面的代码：


```
let a = 2;
a * 8
```

将其转换为 AST 会是怎样的呢，我们使用 [astexplorer](https://astexplorer.net/) 在线 AST 转换工具，可以得到以下树结构：

![image](http://static1.vince.xin/4031A1B3-7A16-4152-8A8F-B829CA4E3386.png?imageView2/2/w/500)

为了更形象表述，我们将其转换为更直观的结构图形：

![image](http://static1.vince.xin/859D6AA9-4876-4073-887D-29A7D2C20ACF.png?imageView2/2/w/500)

AST 的根节点都是 Program ，这个例子中包含了两部分：

1. 一个变量申明(VariableDeclarator)，将标识符(Identifier) a 赋值为数值(NumericLiteral) 3。

2. 一个二元表达式语句(BinaryExpression)，描述为标志符(Identifier)为 a，操作符(operator) + 和数值(NumericLiteral) 5。

这只是一个简单的例子，在实际开发中，AST 将会是一个巨型节点树，将字符串形式的源代码转换成树状的结构，计算机便能更方便地处理，我们使用的 Babel 插件，也就是对 AST 进行插入/移动/替换/删除节点，创建成新的 AST ，再将 AST 转换为字符串源代码，这便是 Babel 插件的原理，之所以能够“为所欲为”，其原因就是可以将原始代码按照指定逻辑转换为你想要的代码。

### 开发 Babel 插件 Demo

#### 基础概念

一个典型的 Babel 插件结构，如下代码所示：


```
export default function(babel) {
  var t = babel.types;
  return {
    visitor: {
      ArrayExpression(path, state) {
          path.replaceWith(
            t.callExpression(
              t.memberExpression(t.identifier('mori'), t.identifier('vector')),
              path.node.elements
            )
          );
      },
      ASTNodeTypeHere(path, state) {}
    }
  };
};
```

我们要关注的几个点为：

- `babel.types`: 用来操作 AST 节点，如创建、转换、校验等。
- `vistor`: Babel 采用递归的方式访问 AST 的每个节点，之所以叫做visitor，只是因为有个类似的设计模式叫做访问者模式，如上述代码中的 `ArrayExpression` ，当遍历到 `ArrayExpression` 节点时，即触发对应函数。
- `path`: path 是指 AST 节点的对象，可以用来获取节点的属性、节点之间的关联。
- `state`: 指插件的状态，可以用过 state 来获取插件中的配置项。
- `ArrayExpression、ASTNodeTypeHere`: 指 AST 中的节点类型。


#### 需求分析

因为是 Demo ，我们需求很简单，我们开发的 Bable 插件名称叫 `vincePlugin`，在使用的时候，能配置插件的参数，使得插件能按照我们配置的参数进行转换。

```
// babel 参数配置

plugins: [
    [vincePlugin, {
        name: 'vince'
    }]
]
```

转换效果：

```
var fool = [1,2,3];
// translate to =>
var fool = vince.init(1,2,3)
```

#### 初始化项目

为了大家更方便的阅读代码，源码已经上传到GitHub： [babel-plugin-demo](https://github.com/Vincedream/babel-plugin-demo)

了解了以上概念与需求后，我们就可以开始进行 Babel 插件开发，开始之前先创建一个项目目录，初始化 npm ，并安装 babel-core ：

```
mkdir babel-plugin-demo && cd babel-plugin-demo
npm init -y
npm install --save-dev babel-core
```

创建 `plugin.js` babel 插件文件，我们将会在这里写转换的逻辑代码：

```
// plugin.js
module.exports = function(babel) {
    var t = babel.types;
    return {
      visitor: {
        // ...
      }
    };
};
```

创建原始代码 `index.js`

```
var fool = [1,2,3];
```

创建 `test.js` 测试函数，这里我们进行对插件的测试：

```
// test.js
var fs = require('fs');
var babel = require('babel-core');
var vincePlugin = require('./plugin');

// read the code from this file
fs.readFile('index.js', function(err, data) {
  if(err) throw err;

  // convert from a buffer to a string
  var src = data.toString();

  // use our plugin to transform the source
  var out = babel.transform(src, {
    plugins: [
        [vincePlugin, {
            name: 'vince'
        }]
    ]
  });

  // print the generated code to screen
  console.log(out.code);
});
```
我们通过 `node test.js`，来测试 babel 插件的转换输出。

#### 节点对比

- 原始代码 `var fool = [1,2,3];` 通过 AST 分析出来的节点如图：

![image](http://static1.vince.xin/01D7FD05-91D7-4124-A764-3BF4D13F9C05.png?imageView2/2/w/500)

- 转换后代码 `var bar = vince.init(1, 2, 3);`，通过 AST 分析出来的节点如图：

![image](http://static1.vince.xin/6E4FB4AD-C22C-45A6-B162-966AA31DF2A0.png?imageView2/2/w/500)

我们通过用红色标注来区分原始与转换后的 AST 结构图，现在我们可以很清晰的看到我们需要替换的节点，将 ArrayExpression 替换为 CallExpression ，在 CallExpression 节点中中增加一个 MemberExpression，并且保留原始的三个 NumericLiteral。

#### plugin 编写

首先，我们需要替换的是 ArrayExpression ，所以给 vistor 添加 ArrayExpression 方法。

```
// plugin.js
module.exports = function(babel) {
    var t = babel.types;
    return {
      visitor: {
        ArrayExpression: function(path, state) {
            // ...
        }
      }
    };
};
```

当 Babel 遍历 AST 时，当发现含有 visitor 上有对呀节点方法时，即会触发这个方法，并且将上下文传入(path, state)，在函数里面我们进行节点的分析和替换操作：

```
// plugin.js
module.exports = function(babel) {
    var t = babel.types;
    return {
      visitor: {
        ArrayExpression: function(path, state) {
            // 替换该节点
            path.replaceWith(
              // 创建一个 callExpression 
              t.callExpression(
                t.memberExpression(t.identifier(state.opts.name), t.identifier('init')),
                path.node.elements
              )
            );
        }
      }
    };
};
```

我们需要将 ArrayExpression 替换为 CallExpression，可以通过 t.callExpression(callee, arguments) 来生成 CallExpression，第一个参数是 MemberExpression，通过t.memberExpression(object, property) 来生成，然后再将原有的三个 NumericLiteral 设置为第二个参数，于是就完成了我们的需求。

这里我们要注意 `state.opts.name` 中指的是配置 plugin 时，设置的 config 参数。

更多的转换方式和节点属性，可以查阅 [babel-types](https://github.com/babel/babel/tree/master/packages/babel-types#babel-types) 的文档

#### 测试plugin

我们回到`test.js`，运行`node test.js`，便会得出：

```
node test.js

=> var bar = vince.init(1, 2, 3);

```

到这里，我们简易的 Babel 插件便完成好了，实际上的开发需求要复杂的多，但是主要的逻辑还是离不开上面的几个概念。

### 总结

还是回到开始那句话“如果你能熟练地操作 AST ，那么你真的可以为所欲为。”，我们能够通过 AST 将原始代码转换成我们所需要的任何代码，甚至你能创建一个私人的 `ESXXX`，添加你创造的新规范。AST 并不是一个很复杂的技术活，很大一部分可以视为“苦力活”，因为遇到复杂的转换需求可能需要编写写很多逻辑代码。

通过阅读这篇文章，我们了解了 Babel 插件的实现原理，并且实践了一个 Plugin，除此之外，我们也理解了 AST 的概念，认识到了其强大之处。

引用：

[Babel 用户手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/user-handbook.md)

[Babel 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-visitors)
