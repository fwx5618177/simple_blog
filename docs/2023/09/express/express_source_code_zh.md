# Express 源码解析

Express 是一个简单的 Node 框架。本文不涉及源码处理，近涉及设计思路。

目录：

```bash
.
├── Charter.md
├── Code-Of-Conduct.md
├── Collaborator-Guide.md
├── Contributing.md
├── History.md
├── LICENSE
├── Readme-Guide.md
├── Readme.md
├── Release-Process.md
├── Security.md
├── Triager-Guide.md
├── appveyor.yml
├── benchmarks
├── examples
├── index.js
├── lib
├── package.json
└── test

4 directories, 14 files
```

基于目录和文件名，以下是一个简要的解释：

1. **文档与社区指南**:

   - `Charter.md`: 描述项目的使命、目标和愿景。
   - `Code-Of-Conduct.md`: 表示项目的行为守则，通常为贡献者和维护者设定行为标准。
   - `Collaborator-Guide.md`: 提供给项目合作者的指南，解释如何参与和协作。
   - `Contributing.md`: 指导开发者如何为项目做贡献，包括代码、文档等。
   - `History.md`: 项目的版本历史或更改日志。
   - `Readme-Guide.md`: 是关于如何编写和格式化项目的 README 的指南。
   - `Readme.md`: 项目的主要介绍文档，通常包括如何安装、使用和贡献的指南。
   - `Release-Process.md`: 描述了项目版本发布的过程和步骤。
   - `Security.md`: 关于项目安全实践和如何报告安全问题的指南。
   - `Triager-Guide.md`: 是指导项目中问题分类者如何处理和分类问题的指南。

2. **配置和许可**:

   - `LICENSE`: 包含项目的开源许可证。
   - `appveyor.yml`: AppVeyor 的 CI/CD 配置文件，用于自动化测试和部署。

3. **代码**:

   - `index.js`: 项目的主入口文件。
   - `lib`: 通常包含项目的主要源代码库。
   - `package.json`: Node.js 项目的配置文件，包括项目的依赖、脚本等信息。

4. **其他**:
   - `benchmarks`: 包含性能基准测试的脚本和数据。
   - `examples`: 提供如何使用项目或库的代码示例。
   - `test`: 包含项目的单元测试、集成测试等测试代码。

## CI/CD - appveyor.yml

这个 `appveyor.yml` 是一个用于 `AppVeyor CI/CD` 服务的配置文件, 考虑了不同版本的 Node.js 和相关的特定版本依赖，以确保项目在这些版本上都能正常工作。

AppVeyor 是一个 CI/CD 工具，用于自动化构建、测试和部署应用。这个配置文件是为 Node.js 项目定制的。以下是这个文件内容的详细解释：

```yml
environment:
  matrix:
    - nodejs_version: "0.10"
    - nodejs_version: "0.12"
    - nodejs_version: "1.8"
    - nodejs_version: "2.5"
    - nodejs_version: "3.3"
    - nodejs_version: "4.9"
    - nodejs_version: "5.12"
    - nodejs_version: "6.17"
    - nodejs_version: "7.10"
    - nodejs_version: "8.17"
    - nodejs_version: "9.11"
    - nodejs_version: "10.24"
    - nodejs_version: "11.15"
    - nodejs_version: "12.22"
    - nodejs_version: "13.14"
    - nodejs_version: "14.20"
    - nodejs_version: "15.14"
    - nodejs_version: "16.19"
    - nodejs_version: "17.9"
    - nodejs_version: "18.15"
    - nodejs_version: "19.7"
cache:
  - node_modules
install: ......
build: off
test_script:
  # Output version data
  - ps: |
      node --version
      npm --version
  # Run test script
  - npm run test-ci
version: "{build}"
```

1. environment: 环境配置，定义了一组环境变量
   - matrix: 是一个节点版本的数组，项目会在这些指定的 Node.js 版本上构建和测试。
2. cache：这部分配置了哪些目录/文件应该被缓存。这里缓存了 node_modules 以加快构建速度
3. install: 安装阶段的进程，用来执行具体的操作，后面详细介绍
4. build: `build: off` 表示这个项目不需要构建阶段，只需要测试。
5. test_script: 测试脚本
   1. ps: 输出 Node.js 和 npm 的版本信息。
   2. `npm run test-ci`: 运行项目中定义的 test-ci 脚本来执行测试
6. version: 定义了构建的版本格式。在 AppVeyor CI 中，{build} 是一个预定义的变量。它代表构建版本的自动增量数字，每当一个新的构建任务在 AppVeyor 中触发时，这个数字就会自动增加

### install stage

```yml
install:
  # Install Node.js
  - ps: >-
      try { Install-Product node $env:nodejs_version -ErrorAction Stop }
      catch { Update-NodeJsInstallation (Get-NodeJsLatestBuild $env:nodejs_version) x64 }
  # Configure npm
  - ps: |
      npm config set loglevel error
      if ((npm config get package-lock) -eq "true") {
        npm config set package-lock false
      } else {
        npm config set shrinkwrap false
      }
  # Remove all non-test dependencies
  - ps: |
      # Remove example dependencies
      npm rm --silent --save-dev connect-redis
      # Remove lint dependencies
      cmd.exe /c "node -pe `"Object.keys(require('./package').devDependencies).join('\n')`"" | `
        sls "^eslint(-|$)" | `
        %{ npm rm --silent --save-dev $_ }
  # Setup Node.js version-specific dependencies
  - ps: |
      # mocha for testing
      # - use 3.x for Node.js < 4
      # - use 5.x for Node.js < 6
      # - use 6.x for Node.js < 8
      # - use 7.x for Node.js < 10
      # - use 8.x for Node.js < 12
      # - use 9.x for Node.js < 14
      if ([int]$env:nodejs_version.split(".")[0] -lt 4) {
        npm install --silent --save-dev mocha@3.5.3
      } elseif ([int]$env:nodejs_version.split(".")[0] -lt 6) {
        npm install --silent --save-dev mocha@5.2.0
      } elseif ([int]$env:nodejs_version.split(".")[0] -lt 8) {
        npm install --silent --save-dev mocha@6.2.2
      } elseif ([int]$env:nodejs_version.split(".")[0] -lt 10) {
        npm install --silent --save-dev mocha@7.2.0
      } elseif ([int]$env:nodejs_version.split(".")[0] -lt 12) {
        npm install --silent --save-dev mocha@8.4.0
      } elseif ([int]$env:nodejs_version.split(".")[0] -lt 14) {
        npm install --silent --save-dev mocha@9.2.2
      }
  - ps: |
      # nyc for test coverage
      # - use 10.3.2 for Node.js < 4
      # - use 11.9.0 for Node.js < 6
      # - use 14.1.1 for Node.js < 8
      if ([int]$env:nodejs_version.split(".")[0] -lt 4) {
        npm install --silent --save-dev nyc@10.3.2
      } elseif ([int]$env:nodejs_version.split(".")[0] -lt 6) {
        npm install --silent --save-dev nyc@11.9.0
      } elseif ([int]$env:nodejs_version.split(".")[0] -lt 8) {
        npm install --silent --save-dev nyc@14.1.1
      }
  - ps: |
      # supertest for http calls
      # - use 2.0.0 for Node.js < 4
      # - use 3.4.2 for Node.js < 7
      # - use 6.1.6 for Node.js < 8
      if ([int]$env:nodejs_version.split(".")[0] -lt 4) {
        npm install --silent --save-dev supertest@2.0.0
      } elseif ([int]$env:nodejs_version.split(".")[0] -lt 7) {
        npm install --silent --save-dev supertest@3.4.2
      } elseif ([int]$env:nodejs_version.split(".")[0] -lt 8) {
        npm install --silent --save-dev supertest@6.1.6
      }
  # Update Node.js modules
  - ps: |
      # Prune & rebuild node_modules
      if (Test-Path -Path node_modules) {
        npm prune
        npm rebuild
      }
  # Install Node.js modules
  - npm install
```

这段代码描述了在 AppVeyor CI 中执行的 `install` 阶段。这一阶段主要负责安装所需的 Node.js 版本，配置 npm，安装和更新依赖等。具体来说：

1. **安装 Node.js**：

   - `try { Install-Product node $env:nodejs_version -ErrorAction Stop }`：尝试使用 `$env:nodejs_version`（预定义的环境变量，表示目标 Node.js 版本）来安装 Node.js。
   - 如果上述安装失败，则通过 `catch` 捕获错误，并使用 `Update-NodeJsInstallation (Get-NodeJsLatestBuild $env:nodejs_version) x64` 来安装或更新 Node.js 到指定版本。

2. **配置 npm**：

   - 设置 npm 的日志级别为 "error"。
   - 检查 npm 的配置中是否设置了 package-lock，并根据其状态进行配置。

3. **删除所有非测试依赖**：

   - 删除示例依赖：移除 `connect-redis` 。
   - 删除 lint 依赖：这里使用了一串命令来查找并移除所有以 `eslint` 开头的依赖。

4. **设置 Node.js 版本特定的依赖**：

   - 根据当前 Node.js 版本来安装相应版本的 `mocha` 用于测试。
   - 根据当前 Node.js 版本来安装相应版本的 `nyc` 用于测试覆盖率报告。
   - 根据当前 Node.js 版本来安装相应版本的 `supertest` 用于执行 HTTP 调用的测试。

5. **更新 Node.js 模块**：

   - 如果存在 `node_modules` 目录，执行 `npm prune` 来移除不再需要的模块和 `npm rebuild` 来重建模块。

6. **安装 Node.js 模块**：
   - 使用 `npm install` 来安装 `package.json` 文件中列出的所有依赖。

## npm

1. **`npm prune`**：

   - 此命令用于删除`node_modules`目录中未在`package.json`文件中定义的模块。换句话说，如果你手动安装了一个包但没有将其保存到`package.json`，或者你曾经保存过但后来从`package.json`中删除了，那么`npm prune`会帮助你从`node_modules`中删除这些多余的模块。
   - 这样确保`node_modules`目录只包含`package.json`中定义的依赖，从而保持项目的清洁。

2. **`npm rebuild`**：
   - 该命令用于重新构建和编译已安装在`node_modules`中的模块。这在某些情况下特别有用，例如当你更改了 Node.js 版本或操作系统环境时，一些包含本机扩展的模块需要重新编译。
   - 使用`npm rebuild`可以确保所有这些本机扩展都被正确地构建和编译，以匹配当前的环境。

## benchmarks

```bash
.
├── Makefile
├── middleware.js
└── run

0 directories, 3 files
```

这是一个简单的项目或工具的基本结构，具有构建规则 (Makefile)、功能代码 (middleware.js) 和一个主执行脚本 (run)。

### middleware

```js
var express = require("..");
var app = express();

// number of middleware

var n = parseInt(process.env.MW || "1", 10);
console.log("  %s middleware", n);

while (n--) {
  app.use(function (req, res, next) {
    next();
  });
}

app.use(function (req, res) {
  res.send("Hello World");
});

app.listen(3333);
```

本文件通过设置中间件的数量来进行性能测试。

### run

用于启动一个 Node.js 服务，然后对其进行基准测试。

```bash
#!/usr/bin/env bash

echo
MW=$1 node $2 &
pid=$!

echo "  $3 connections"

sleep 2

wrk 'http://localhost:3333/?foo[bar]=baz' \
  -d 3 \
  -c $3 \
  -t 8 \
  | grep 'Requests/sec\|Latency' \
  | awk '{ print " " $2 }'

kill $pid
```

- `$!`: 在 Bash 中表示最近在后台启动的进程的进程 ID (PID)。这里将其赋值给 pid 变量，以便稍后可以终止该进程。
- `MW=$1 node $2 &`: $1 和 $2 是脚本的前两个参数, Node.js 进程在后台运行.
- `wrk 'http://localhost:3333/?foo[bar]=baz' \ ...`: 使用 wrk 工具对指定的 URL 进行基准测试。wrk 是一个用于 HTTP 基准测试的工具，它能生成大量的请求并测量服务器的性能.
  - d: 测试的持续时间
  - c: 并发连接数
  - t: 使用几个线程进行测试

### Makefile

```makefile
all:
	@./run 1 middleware 50
	@./run 5 middleware 50
	@./run 10 middleware 50
	@./run 15 middleware 50
	@./run 20 middleware 50
	@./run 30 middleware 50
	@./run 50 middleware 50
	@./run 100 middleware 50
	@./run 10 middleware 100
	@./run 10 middleware 250
	@./run 10 middleware 500
	@./run 10 middleware 1000
	@echo

.PHONY: all
```

伪目标在 `make` 工具中是非常有用的，它允许我们定义并执行不与实际文件关联的任务。

在 `make` 和 `Makefile` 的上下文中，伪目标（Phony Target）是一个特殊的目标，它不代表任何文件或目录的名字。它被用来执行那些不与文件关联的任务，例如清除临时文件或构建文档。因为它不代表任何文件，所以不会有时间戳检查——无论什么情况下，只要该伪目标被指定或作为其他目标的先决条件，它都会被执行。

为什么我们需要伪目标？考虑一个常见的例子：在许多 `Makefile` 中，都有一个名为 `clean` 的目标，其目的是删除所有由构建过程生成的文件。我们不希望 `make` 查看一个名为 "clean" 的文件来确定是否执行这个目标，因为 "clean" 只是一个动作，而不是一个文件名。通过声明它为伪目标，我们可以避免这种混淆。

这就是为什么我们在 `Makefile` 中使用 `.PHONY` 声明伪目标的原因。例如：

```make
.PHONY: clean

clean:
    rm -rf *.o my_program
```

在这里，`.PHONY` 告诉 `make`，`clean` 是一个伪目标。因此，当我们运行 `make clean` 时，它会执行指定的命令（在这里是 `rm -rf *.o my_program`）而不查找是否存在一个名为 "clean" 的文件。

## lib

Express 的核心目录。

```bash
.
├── application.js
├── express.js
├── middleware
│   ├── init.js
│   └── query.js
├── request.js
├── response.js
├── router
│   ├── index.js
│   ├── layer.js
│   └── route.js
├── utils.js
└── view.js

2 directories, 11 files
```

- **`application.js`**: 通常负责定义应用程序的主体和生命周期。它包括如何启动应用、添加中间件、设置模板引擎、监听端口等功能。
- **`express.js`**: 这是整个框架的主入口文件。它导出一个函数，用于创建新的应用实例（如前面的 `createApplication` 函数）。
- **`middleware` 目录**:
  - 中间件是在请求和响应周期中处理任务的函数。
  - `init.js`: 是初始化一些必要的中间件或应用程序的基本设置。
  - `query.js`: 通常用于解析 URL 查询参数，并将它们添加到 `req.query` 对象中。
- **`request.js`**: 定义与 HTTP 请求相关的功能和属性。扩展 Node.js 的原生 `request` 对象，添加更多有用的方法或属性。
- **`response.js`**: 定义与 HTTP 响应相关的功能和属性。扩展 Node.js 的原生 `response` 对象，为其添加更多有用的方法或属性。
- **`router` 目录**:
  - 路由是将请求指向特定处理程序或中间件的机制。
  - `index.js`: 是路由的主入口，管理路由的所有功能。
  - `layer.js`: 在 Express 中，"layer" 是一个抽象，用于表示单个路由或中间件在内部的表示。它包含匹配路由的逻辑和相关的中间件。
  - `route.js`: 表示一个单独的路由，包含一个特定的路径和与之关联的一组 HTTP 方法（如 GET、POST 等）。
- **`utils.js`**: 通常包含框架内部使用的一些实用函数或工具。

- **`view.js`**: 负责处理视图和模板。包括如何查找和渲染模板、设置模板引擎等功能。
