# 如何搭建HTTP服务器调用DLL库

之前在帮朋友救急时，忽然想到了这个方法，就是通过HTTP服务器调用DLL库。在某些情况下，我们可能需要远程调用本地的 DLL 库。为了实现这个目标，我们可以搭建一个 HTTP 服务器，通过发送 HTTP 请求来调用 DLL 库的函数。这种方法可以让我们在不将 DLL 库放到远程机器上的情况下，实现对 DLL 函数的远程调用。

环境：MacOS + Node 18.0.0
目的：酒店的房卡系统，通过HTTP服务器调用DLL库，实现对房卡的读取、写入、删除等操作。

## 准备阶段

1. 安装 Node.js：首先，我们需要安装 Node.js。Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时，它可以帮助我们构建高效的网络应用程序。

2. 创建 HTTP 服务器：使用 Node.js 的内置模块，我们可以轻松地创建一个简单的 HTTP 服务器。我们将展示如何编写一个简单的 Node.js 脚本，以创建一个监听特定端口的 HTTP 服务器。这里我们使用express框架。

3. 调用 DLL 库：为了调用 DLL 库，我们将使用 Node.js 的 "ffi" 模块。该模块允许我们加载和调用动态链接库（DLL）中的函数。我们将演示如何使用 "ffi" 模块加载 DLL 库，并调用其中的函数。

## 1. 搭建基础读取DLL库

首先创建一个文件夹：`mkdir http-dll`，然后进入该文件夹：`cd http-dll`。

### 1.1 创建 package.json 文件

在该文件夹下创建 package.json 文件：`pnpm init -y`。

### 1.2 安装依赖

安装依赖：`pnpm i ffi ref-struct ref-array ref`。

### 1.3 读取

搭建的过程不重要，为什么用的原因更重要，其次是思考怎么处理，最后是设计使用的方法。

假如这里我们使用的是`LockSDK.dll`，这里只是为了演示，提供了基础的4个方法，因此以这4个方法为例子。

- TP_Configuration：动态库初始化配置，完成门锁类型选择/发卡器连接等
- TP_MakeGuestCardEx： 制作宾客卡
- TP_ReadGuestCardEx： 读宾客卡信息
- TP_CancelCard： 注销卡片/卡片回收

此处不展示具体的C代码，而直接以DLL库的形式提供给我们使用。

首先要考虑一个问题，单纯从文档里拿去使用和调用的话，会出现什么问题？

1. 每次使用都需要读文档
2. 每次使用都需要重新编写代码
3. 没有统一的调用方法，很容易出现凌乱的管理

那我们需要在此设置一个目标，就是将这些方法封装起来，统一调用，方便管理。而我们创建一个conf目录，用于存放配置文件，创建`dll.conf.js`文件，用于存放dll配置信息。

```js
/**
函数名：TP_Configuration
功能：动态库初始化配置，完成门锁类型选择/发卡器连接等
@param {number} lock_type - 门锁类型(也就是使用的卡片类型): 4-RF57门锁; 5-RF50门锁
@returns {number} - 错误类型
注意：此函数为 __stdcall 调用约定，如果您的函数库采用的是 __cdecl 调用约定，需要将其修改为 __stdcall 调用约定。
*/
export const TP_Configuration = {
  "TP_Configuration": [
    "int", // return
    // parameters
    ["int"],
  ],
};
```

- 这种配置方法是为了方便ffi调用，暂且不表。

如果只是这种方式配置，那么我们还是需要每次都去读文件，然后重新编写，这样就没有意义了。因此我们需要考虑一个更方便的方式，也就是放置在一个统一的文件内，通过调用这个文件，来获取我们需要的所有方法。

因此创建conf.js文件，用于存放所有的方法。
    
```js
const { TP_Configuration, TP_MakeGuestCardEx, TP_ReadGuestCardEx, TP_CancelCard } = require('./dll.conf.js')

export const LIB_NAME = "../dll/mylib.dll"

export const lib_func = {
    TP_Configuration,
    TP_MakeGuestCardEx,
    TP_ReadGuestCardEx,
    TP_CancelCard
}

module.exports = {
    LIB_NAME,
    lib_func
}
```

此时我们已经配置好了conf的配置文件，那么下一步，我们就需要实现读取和调用的方法。

我们创建一个core目录，用于存放核心方法，创建load.js文件，用于存放核心方法。

```js
const { lib_func, LIB_NAME } = require('../conf/conf.js')

const ffi = require('ffi');
const ref = require('ref');
const {
    TP_Configuration,
    TP_MakeGuestCardEx,
    TP_ReadGuestCardEx,
    TP_CancelCard
} = ffi.Library(LIB_NAME, lib_func);


module.exports = {
    TP_Configuration,
    TP_MakeGuestCardEx,
    TP_ReadGuestCardEx,
    TP_CancelCard
}
```
- `ffi`模块，用于加载和调用动态链接库（DLL）中的函数。
- `ref`模块，用于处理C语言中的指针问题。
- 这里我们将Library从DLL里读取出来的函数，放置在一个对象里，方便外部调用。此处我们让HTTP服务器来调用

### 1.4 创建HTTP服务器

安装`express`框架，然后在创建`server`目录，用于存放HTTP服务器。

在`server`目录下创建`app.js`文件，用于存放HTTP服务器。

```js
const express = require('express');

class App {
    routes;
    app = express();

    constructor(routes) {
        this.routes = routes;
        this.requestEntry()
    }

    requestEntry() {
        this.routes.forEach(route => {
            this.app[route.method](route.path, route.handler)
        })
    }

    listen(port) {
        app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        })
    }
}

module.exports = {
    App
}

```

- 此处我们将HTTP服务器的创建和路由的配置分离，方便管理。

下面我们创建目录文件`routes.js`,用于存放路由配置。

```js
const CancelController = require('./controller/cancel.controller.js')
const ConfigurationController = require('./controller/configuration.controller.js')
const MakeGuestCardEx = require('./controller/MakeGuestCardEx.controller')
const ReadGuestCardExController = require('./controller/ReadGuestCardExController.controller')

const routes = [
    {
        path: '/cancel',
        method: 'post',
        handler: new CancelController(),
    },
    {
        path: '/configuration',
        method: 'post',
        handler: new ConfigurationController(),
    },
    {
        path: '/make-guest-card-ex',
        method: 'post',
        handler: new MakeGuestCardEx(),
    },
    {
        path: '/read-guest-card-ex',
        method: 'post',
        handler: new ReadGuestCardExController(),
    }
]

module.exports = {
    routes
}
```

在逻辑上，我们需要把每个路由的处理逻辑分离出来，因此我们创建`controller`目录，用于存放路由处理逻辑。

在`controller`目录下创建`cancel.controller.js`文件，用于存放路由处理逻辑。

```js
const ref = require("ref");
const { TP_CancelCard } = require("../../core/load");

class CancelController {
  constructor() {}

  async handler(_req, res) {
    try {
      const card_snr = _req.body.card_snr || ref.allocCString("", 20);
      const result = await TP_CancelCard(card_snr);
      const card_snr_str = ref.readCString(card_snr);

      return res.status(201).send({
        data: {
          result,
          card_snr_str,
        },
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = CancelController

```

- 到这个时候，我们已经完成了对DLL的函数的一个完整的调用，并且把这个调用封装成了一个HTTP服务器，方便我们通过网页端来进行处理。

此外,我们还需要一个`main.js`文件，用于启动HTTP服务器。

```js
const App = require('./server/app.js')
const { routes } = require('./server/routes.js')

const app = new App(routes);

app.listen(3000)
```

到这一步，整体流程就走完了。我们只需要在终端中输入`node main.js`，就可以启动HTTP服务器了。

## 最终结果

目录结构如下：

```bash
.
├── conf
│   ├── conf.js
│   └── dll.conf.js
├── core
│   └── load.js
├── dll
│   └── LockSDK.dll
├── main.js
├── mock
│   └── mockUse.js
├── package.json
├── pnpm-lock.yaml
└── server
    ├── app.js
    ├── controller
    │   ├── cancel.controller.js
    │   ├── configuration.controller.js
    │   ├── makeGuestCardEx.js
    │   └── readGuestCardEx.controller.js
    └── routes.js
```


# Reference

- [Node-DLL](https://github.com/fwx5618177/node-DLL)