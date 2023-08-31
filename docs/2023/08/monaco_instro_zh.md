# 【Typescript】Monaco 源码分析与介绍

Monaco 是 Vscode 的编辑器。有 monaco-editor 和 monaco-editor-core 两个库。而核心的编辑器原名叫"Monaco-editor-core"，现在改名为[vscode](https://github.com/microsoft/vscode)

## 1. monaco-editor

此处讲的主要是 Monaco-Editor，主要解决的是 vscode 的语言支持。特别是在 [Monaco Editor](https://microsoft.github.io/monaco-editor/) 中。Monaco Editor 是一个由 Microsoft 开发的代码编辑器，也是 Visual Studio Code 的核心部分。

### 文件目录

```bash
.
├── basic-languages
│   ├── _.contribution.ts
│   ├── monaco.contribution.ts
│   ├── abap
│   ├── apex
│   ├── azcli
│   ├── bat
│   ├── bicep
│   ├── cameligo
....
├── fillers
│   ├── editor.api.d.ts
│   ├── monaco-editor-core-amd.ts
│   └── monaco-editor-core.ts
├── language
│   ├── common
│   ├── css
│   ├── html
│   ├── json
│   └── typescript
└── tsconfig.json

89 directories, 6 files
```

此处着重讲解`basic-languages`这个目录。此目录为各种语言的支持，每个语言都有一个文件夹，文件夹下有一个`_.contribution.ts`和`monaco.contribution.ts`文件：

- `_.contribution.ts`为语言的支持
- `monaco.contribution.ts`为语言的支持的注册，换句话说，其实是将各个语言目录中的在`xx.contribution.ts`的内容注册到 monaco-editor 中

### 实践添加语言

```typescript
import { registerLanguage } from "../_.contribution";

declare var AMD: any;
declare var require: any;

registerLanguage({
  id: "php",
  extensions: [".php", ".php4", ".php5", ".phtml", ".ctp"],
  aliases: ["PHP", "php"],
  mimetypes: ["application/x-php"],
  loader: () => {
    if (AMD) {
      return new Promise((resolve, reject) => {
        require(["vs/basic-languages/php/php"], resolve, reject);
      });
    } else {
      return import("./php");
    }
  },
});
```

- id: 语言的 id
- extensions: 语言的后缀名
- aliases: 语言的别名
- loader: 语言的加载器，此处为动态加载，如果是静态加载，直接返回`import('./abap')`即可

### 语言语法的支持

#### Conf

```typescript
export const conf: languages.LanguageConfiguration = {
  wordPattern:
    /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,

  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"],
  },

  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],

  autoClosingPairs: [
    { open: "{", close: "}", notIn: ["string"] },
    { open: "[", close: "]", notIn: ["string"] },
    { open: "(", close: ")", notIn: ["string"] },
    { open: '"', close: '"', notIn: ["string"] },
    { open: "'", close: "'", notIn: ["string", "comment"] },
  ],

  folding: {
    markers: {
      start: new RegExp("^\\s*(#|//)region\\b"),
      end: new RegExp("^\\s*(#|//)endregion\\b"),
    },
  },
};
```

这个 `conf` 对象是用于配置一个语言的特定行为，此配置为 Monaco Editor 提供了有关如何处理注释、括号匹配、单词选择和代码折叠的指南。

让我们一起看看这个配置中的每个 key:

1. **wordPattern**:

   - 这是一个正则表达式，定义了什么是一个"word"。当执行诸如单词选择或单词相关操作时，编辑器会使用此模式。例如，双击文本中的位置时，通常会根据此模式选择整个单词。

2. **comments**:

   - `lineComment` 指定单行注释的开始方式。
   - `blockComment` 指定块注释的开始和结束方式。

3. **brackets**:

   - 定义了用于匹配的括号对。例如，在代码中写一个 `{` 时，编辑器可能会自动插入一个 `}`，因为 `{` 和 `}` 是定义的匹配的括号对。

4. **autoClosingPairs**:

   - 定义了当输入某个字符（如 `{` 或 `"`）时，编辑器应该自动插入哪个关闭字符（如 `}` 或 `"`）。`notIn` 字段定义了在哪些上下文中不应执行此操作。例如，当在一个字符串中键入 `{` 时，可能不希望自动关闭它。

5. **folding**:
   - 这与编辑器的代码折叠功能有关。代码折叠允许用户折叠（或隐藏）代码块以便更容易地阅读和导航。
   - `markers` 指定了用于标记代码折叠开始和结束的注释模式。在这种情况下，`#region` 和 `#endregion` 或 `//region` 和 `//endregion` 之间的代码块可以被折叠。

##### 针对正则的详细解释

1. **/.../g**:

   - `/.../` 是正则表达式的界定符。
   - `g` 是一个修饰符，表示全局搜索，即搜索字符串中的所有匹配项，而不仅仅是找到的第一个。

2. **整体表达式是两个主要部分的组合，它们由 `|` 分隔**:

   - `|` 是一个逻辑"或"，意思是左侧或右侧的任何一个表达式都可以匹配。

3. **左侧部分：`(-?\d*\.\d\w*)`**:

   - `-?`：可能有一个负号。
   - `\d*`：可能有一个或多个数字（0-9）。
   - `\.`：一个点（`.`）。
   - `\d`：至少有一个数字。
   - `\w*`：可能有一个或多个字符（字母、数字或下划线）。

   例如，这部分可以匹配`-123.4abc`这样的字符串。

4. **右侧部分：`([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)`**:

   - `[^...]`：匹配不在括号内的任何单个字符。
   - 这部分列出了很多字符，表示它可以匹配任何字符，除了列出的这些特殊字符和空格。

   例如，它可以匹配一个单独的字母`a`或者一个单词`word`，但不会匹配`@`、`#`等特殊字符或空格。

所以此正则表达式旨在匹配两种可能的模式：

1. 带有可能的前导负号的数字，后跟一个点，再跟一个或多个数字和可能的字母/数字字符。
2. 不包含列出的特殊字符和空格的字符串。

#### Language

此处内容主要是语言的语法支持，针对语法高亮进行的一些处理。定义了一个使用 Monarch 的语言模型，通常用于语法高亮。

Monarch 是一种轻量级的、使用 JSON 描述的语法高亮语言，通常用于 Visual Studio Code 和 Monaco Editor。

```typescript
export const language = <languages.IMonarchLanguage>{
	defaultToken: '',
	tokenPostfix: '',
	// ignoreCase: true,

	// The main tokenizer for our languages
	tokenizer: {
		root: [
			[/<\?((php)|=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.root' }],
			[/<!DOCTYPE/, 'metatag.html', '@doctype'],
			[/<!--/, 'comment.html', '@comment'],
			...
		],

		doctype: [
			[/<\?((php)|=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.comment' }],
			...
		],

		comment: [
			[/<\?((php)|=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.comment' }],
			...
		],

		otherTag: [
			[/<\?((php)|=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.otherTag' }],
			[/\/?>/, 'delimiter.html', '@pop'],
			...
		],

		// -- BEGIN <script> tags handling

		// After <script
		script: [
			[/<\?((php)|=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.script' }],
			[/type/, 'attribute.name', '@scriptAfterType'],
			[/"([^"]*)"/, 'attribute.value'],
			[/'([^']*)'/, 'attribute.value'],
			...
		],

		// After <script ... type
		scriptAfterType: [
			[
				/<\?((php)|=)?/,
				{
					token: '@rematch',
					switchTo: '@phpInSimpleState.scriptAfterType'
				}
			],
			...
		],

		// After <script ... type =
		scriptAfterTypeEquals: [
			[
				/<\?((php)|=)?/,
				{
					token: '@rematch',
					switchTo: '@phpInSimpleState.scriptAfterTypeEquals'
				}
			],
			...
		],

		// After <script ... type = $S2
		scriptWithCustomType: [
			[
				/<\?((php)|=)?/,
				{
					token: '@rematch',
					switchTo: '@phpInSimpleState.scriptWithCustomType.$S2'
				}
			],
			...
		],

		scriptEmbedded: [
			[
				/<\?((php)|=)?/,
				{
					token: '@rematch',
					switchTo: '@phpInEmbeddedState.scriptEmbedded.$S2',
					nextEmbedded: '@pop'
				}
			],
			[/<\/script/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }]
		],

		// -- END <script> tags handling

		// -- BEGIN <style> tags handling

		// After <style
		style: [
			[/<\?((php)|=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.style' }],
			[/type/, 'attribute.name', '@styleAfterType'],
			[/"([^"]*)"/, 'attribute.value'],
			[/'([^']*)'/, 'attribute.value'],
			...
		],

		// After <style ... type
		styleAfterType: [
			[
				/<\?((php)|=)?/,
				{
					token: '@rematch',
					switchTo: '@phpInSimpleState.styleAfterType'
				}
			],
			...
		],

		// After <style ... type =
		styleAfterTypeEquals: [
			[
				/<\?((php)|=)?/,
				{
					token: '@rematch',
					switchTo: '@phpInSimpleState.styleAfterTypeEquals'
				}
			],
			...
		],

		// After <style ... type = $S2
		styleWithCustomType: [
			[
				/<\?((php)|=)?/,
				{
					token: '@rematch',
					switchTo: '@phpInSimpleState.styleWithCustomType.$S2'
				}
			],
			...
		],

		styleEmbedded: [
			[
				/<\?((php)|=)?/,
				{
					token: '@rematch',
					switchTo: '@phpInEmbeddedState.styleEmbedded.$S2',
					nextEmbedded: '@pop'
				}
			],
			[/<\/style/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }]
		],

		// -- END <style> tags handling

		phpInSimpleState: [
			[/<\?((php)|=)?/, 'metatag.php'],
			[/\?>/, { token: 'metatag.php', switchTo: '@$S2.$S3' }],
			{ include: 'phpRoot' }
		],

		phpInEmbeddedState: [
			[/<\?((php)|=)?/, 'metatag.php'],
			[
				/\?>/,
				{
					token: 'metatag.php',
					switchTo: '@$S2.$S3',
					nextEmbedded: '$S3'
				}
			],
			{ include: 'phpRoot' }
		],

		phpRoot: [
			[
				/[a-zA-Z_]\w*/,
				{
					cases: {
						'@phpKeywords': { token: 'keyword.php' },
						'@phpCompileTimeConstants': { token: 'constant.php' },
						'@default': 'identifier.php'
					}
				}
			],

			// brackets
			[/[{}]/, 'delimiter.bracket.php'],
			...
		],

		phpComment: [
			[/\*\//, 'comment.php', '@pop'],
			[/[^*]+/, 'comment.php'],
			[/./, 'comment.php']
		],

		phpLineComment: [
			[/\?>/, { token: '@rematch', next: '@pop' }],
			[/.$/, 'comment.php', '@pop'],
			[/[^?]+$/, 'comment.php', '@pop'],
			[/[^?]+/, 'comment.php'],
			[/./, 'comment.php']
		],

		phpDoubleQuoteString: [
			[/[^\\"]+/, 'string.php'],
			[/@escapes/, 'string.escape.php'],
			[/\\./, 'string.escape.invalid.php'],
			[/"/, 'string.php', '@pop']
		],

		phpSingleQuoteString: [
			[/[^\\']+/, 'string.php'],
			[/@escapes/, 'string.escape.php'],
			[/\\./, 'string.escape.invalid.php'],
			[/'/, 'string.php', '@pop']
		]
	},

	phpKeywords: [
		'abstract',
		'and',
		'array',
		'as',
		'break',
		'callable',
		'case',
		'catch',
		'cfunction',
		'class',
		'clone',
		'const',
		'continue',
		'declare',
		...
	],

	phpCompileTimeConstants: [
		'__CLASS__',
		'__DIR__',
		...
	],

	phpPreDefinedVariables: [
		'$GLOBALS',
		'$_SERVER',
		'$_GET',
		...
	],

	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/
};
```

这里为描述了代码中的每个关键字段：

1. **defaultToken**: 默认情况下为任何未被其他规则匹配的内容指定的标记。在这里是一个空字符串。
2. **tokenPostfix**: 附加到每个 token 名称后的字符串。默认为空字符串。
3. **tokenizer**: 语言的主要部分，定义了如何识别各种 token。
   - **root**: 代码的初始状态或根状态，通常会从这里开始分析文本。
   - **doctype**: 处理 `<!DOCTYPE>` 标签。
   - **comment**: 处理 HTML 注释，即 `<!-- -->`。
   - **otherTag**: 处理 HTML 中的其他标签。
   - **script** 和相关的状态：处理 `<script>` 标签及其属性和内容。
   - **style** 和相关的状态：处理 `<style>` 标签及其属性和内容。
   - **phpInSimpleState** 和 **phpInEmbeddedState**: 处理可能出现在 HTML 中的 PHP 代码片段。
   - **phpRoot**: 处理 PHP 的主要元素，如变量、字符串、数字、注释等。
   - **phpComment**: 处理 PHP 注释。
   - **phpLineComment**: 处理 PHP 行注释。
   - **phpDoubleQuoteString**: 处理 PHP 双引号字符串。
   - **phpSingleQuoteString**: 处理 PHP 单引号字符串。
   - **phpKeywords**: PHP 关键字。
   - **phpCompileTimeConstants**: PHP 编译时常量。
   - **phpPreDefinedVariables**: PHP 预定义变量。
   - **escapes**: PHP 转义序列。
   - **include**: 用于将另一个语言模型包含到当前模型中。
   - **switchTo**: 用于将状态切换到另一个状态。
   - **next**: 用于将状态切换到另一个状态，但不会将其推送到状态堆栈中。
   - **nextEmbedded**: 用于将状态切换到另一个状态，但不会将其推送到状态堆栈中。此外，它还指定了要使用的嵌入式语言。
   - **@rematch**: 用于将状态切换到另一个状态，但不会将其推送到状态堆
   - **@pop**: 用于将状态从堆栈中弹出。

大体上，这个`language`对象定义了如何为 PHP 和其嵌入在 HTML 中的部分进行语法高亮。每种状态都包含了可以匹配的模式以及当匹配到这些模式时应该如何操作。例如，当匹配到 PHP 的起始标记`<?php`时，它将切换到`phpInSimpleState`状态，这使编辑器知道接下来的代码应该被视为`PHP`代码并相应地高亮显示。

## 2. 【Vscode】monaco-editor-core

主要以`src`目录为主。

```bash
.
├── bootstrap-amd.js
├── bootstrap-fork.js
├── bootstrap-node.js
├── bootstrap-window.js
├── bootstrap.js
├── buildfile.js
├── cli.js
├── main.js
├── server-cli.js
├── server-main.js
├── tsconfig.base.json
├── tsconfig.json
├── tsconfig.monaco.json
├── tsconfig.tsec.json
├── tsconfig.vscode-dts.json
├── tsconfig.vscode-proposed-dts.json
├── tsec.exemptions.json
├── typings
├── vs
└── vscode-dts

3 directories, 17 files
```

- `vscode-dts`: 此处是稳定 API 和 API 提案的地方
- `vs`: VS Code 的核心源代码或核心库代码，包含编辑器的核心逻辑和组件

### VS Directory

核心代码文件繁多。如果一个个啃，很容易迷失在繁多的资料中。不如我们捋捋逻辑，从启动的一个入口开始。

此处，我将以命令行中`code .`触发软件启动开始。我们首先看目录 root 的`cli.js`文件。

```js
// Delete `VSCODE_CWD` very early even before
// importing bootstrap files. We have seen
// reports where `code .` would use the wrong
// current working directory due to our variable
// somehow escaping to the parent shell
// (https://github.com/microsoft/vscode/issues/126399)
delete process.env["VSCODE_CWD"];

const bootstrap = require("./bootstrap");
const bootstrapNode = require("./bootstrap-node");
const product = require("../product.json");

// Enable portable support
bootstrapNode.configurePortable(product);

// Enable ASAR support
bootstrap.enableASARSupport();

// Signal processes that we got launched as CLI
process.env["VSCODE_CLI"] = "1";

// Load CLI through AMD loader
require("./bootstrap-amd").load("vs/code/node/cli");
```

这段代码设置了 VS Code 命令行界面的启动环境，确保了正确的工作目录，并加载了必要的模块来运行 CLI。

- VSCODE_CWD: 为启动时，打开的默认当前目录。不过因为一些 issue，暂时删掉了启动之初自带的变量，而再下面的代码中，会重新设置这个变量。
- bootstrap: 为启动的核心文件，这部分代码导入了三个模块：bootstrap，bootstrapNode 和 product.json。
- bootstrapNode.configurePortable: 调用 configurePortable 函数来为 VS Code 配置便携式支持，意味着 VS Code 可以在没有安装的情况下从 USB 等设备上运行。
- bootstrap.enableASARSupport(): 这行代码启用了 ASAR 支持。ASAR 是一种将多个文件集成到单个文件中的格式，通常用于 Electron 应用程序。
- process.env['VSCODE_CLI'] = '1': 这将 VSCODE_CLI 环境变量设置为'1'，意味着 VS Code 是通过 CLI 启动的。
- require('./bootstrap-amd').load('vs/code/node/cli'): 这行代码通过 AMD（异步模块定义）加载器加载了 CLI 模块。AMD 是一种 JavaScript 模块定义，它允许模块和其依赖关系异步加载。
