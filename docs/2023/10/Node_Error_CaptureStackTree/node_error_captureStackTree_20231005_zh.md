# 深入理解 JavaScript 错误堆栈(调用桢)捕获装饰器的错误位置

## 摘要

本文探讨了如何在 `JavaScript` 中获取调用代码的位置信息，特别是装饰器函数的位置。我们将深入了解 `JavaScript` 错误堆栈以及如何使用 `Error.captureStackTrace` 来捕获调用位置。即，通过调用桢（call frame）的位置来获取错误的位置。

`JavaScript` 中的错误堆栈（stack trace）包含了代码调用的层次结构信息，但通常包括了许多不相关的函数调用。在装饰器模式等情况下，我们可能希望捕获装饰器函数所应用的类的位置。为了实现这一目标，我们需要了解错误堆栈的结构以及如何正确地获取调用位置。

## 应用场景

我们自定义了一个 Error 类，用于抛出具体类型的错误。而我们希望在抛出错误时，日志系统能够记录错误的位置，以便于调试。在这种情况下，本来是直接使用`console.log`来获取错误。但是我们希望能够在错误类中直接获取错误的位置，而不是在每个错误类中都写一遍`console.log`。因此装饰器就派上用场了，不仅便捷，而且代码更加简洁。

代码如下：

```typescript
import { Log } from "../logs/Logs";

@Log.logErrorClass
class JceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JceError";
  }
}

export default JceError;
```

由于无法直接在构造器中调用装饰器，因此我们需要在装饰器中调用构造器，使用了`Reflect.construct`。

这是记录错误位置的装饰器：

```typescript
/**
 * 用于记录错误的类装饰器。每当使用了该装饰器的类被实例化时，都会记录错误信息。
 *
 * @param target - 被装饰的类。
 *
 * @example
 * @Log.logErrorClass
 * class MyErrorClass { // ... }
 */
static logErrorClass(...args: any[]) {
    // 保存原始定义
    const original: Function = args[0];

    // 新构造函数的行为
    const f: any = function (...args: any[]) {
        let instance;

        try {
            // 尝试实例化原始类
            instance = Reflect.construct(original, args, new.target);

            // 记录位置和地址
            const location = Log.getCallerLocation();
            const params = JSON.stringify(args);

            // 在实例上附加位置和参数信息
            instance.location = location;
            instance.params = params;

            console.log(
                chalk.red('[Error Class]'),
                chalk.blue(`(${location}):`),
                chalk.yellow(params),
            );
        } catch (error: any) {
            // 捕获构造函数中的错误，并在控制台中以彩色输出显示错误信息
            const stackLines = error.stack?.split('\n');
            const location = stackLines ? stackLines[1].trim() : '未知位置';

            console.log(
                chalk.red('[错误]'),
                chalk.blue(`(${location}):`),
                chalk.yellow(error.message),
            );

            throw error; // 重新抛出错误
        }

        return instance;
    };

    // 复制原型，使 instanceof 操作符仍然可用
    f.prototype = original.prototype;

    // 返回新构造函数（将替换原始构造函数）
    return f;
}
```

我们打算用 `logErrorClass` 装饰器来装饰错误类的，但是装饰器函数的位置并不是我们想要的位置，我们希望捕获装饰器函数所应用的类的位置。就引入了本文的核心内容：**错误堆栈**。

## 讲解

在 JavaScript 中，错误堆栈（stack trace）包含了调用代码的层次结构信息。通常，堆栈的顶部包含了当前代码执行的位置，然后逐渐向下包含了调用的函数和方法的位置。这个堆栈通常是一个文本字符串，其中每一行代表一个调用帧（call frame），包含了函数或方法的名称以及它们在代码中的位置。

我们希望捕获装饰器函数所应用的类的位置。然而，堆栈中还包含了其他的函数调用，比如 JavaScript 引擎的内部函数和 Node.js 运行时的函数。因此，我们需要找到正确的行来获取装饰器函数所应用的类的位置。

### **错误堆栈的一般结构**

JavaScript 错误堆栈通常具有以下结构：

1. 第一行包含了错误信息的描述，通常不包含应用代码的位置信息。
2. 第二行通常是 `Error.captureStackTrace` 函数的调用行，也不包含应用代码的位置。
3. 第三行通常包含装饰器函数所应用的类的调用位置，这是我们希望捕获的位置。
4. 后续行包含了其他函数调用的位置，可能不包含我们感兴趣的装饰器位置。

为了获取正确的装饰器位置，我们做出以下假设：

- 如果堆栈中至少有四行，那么我们认为装饰器位置通常位于第四行，因此我们返回第四行的内容作为装饰器位置。
- 如果堆栈行数不足四行，那么我们无法确定装饰器位置，因此我们返回一个默认的 "未知位置"。

这个假设是基于一般情况的，实际的堆栈结构可能会有所不同。

## **捕获装饰器位置的方法**

为了捕获装饰器函数所应用的类的位置，我们可以使用 `Error.captureStackTrace` 方法。这个方法允许我们自定义一个错误对象，并捕获当前代码执行的调用堆栈信息。以下是捕获装饰器位置的步骤：

1. 创建一个空的错误对象，例如 `error`。
2. 调用 `Error.captureStackTrace(error, captureFunction)`，其中 `captureFunction` 是一个占位符函数，用于指示在堆栈信息中的哪个位置捕获堆栈信息。
3. 分析堆栈信息，通常装饰器函数的调用位置位于第三行（假设在堆栈的第四行），我们可以获取并记录这个位置。

以下是示例代码：

```typescript
function getCallerLocation() {
  const error = {};
  Error.captureStackTrace(error, getCallerLocation);

  const stackLines = error.stack.split("\n");

  // 假定调用位置在堆栈的第三行
  if (stackLines.length >= 4) {
    return stackLines[3].trim();
  } else {
    return "未知位置";
  }
}
```

这个示例中，`getCallerLocation` 函数捕获了装饰器函数的调用位置，并返回该位置。注意，实际的堆栈结构可能因环境而异，你可能需要根据你的项目需求来选择正确的行数。

## **捕获装饰器位置的更多方法**

### **使用 `Error.stackTraceLimit`**

`Error.stackTraceLimit` 属性用于指定堆栈的最大行数。默认情况下，这个值是 `10`，但是我们可以将其设置为 `Infinity` 来获取完整的堆栈信息。以下是示例代码：

```typescript
// 设置堆栈的最大行数为 Infinity
Error.stackTraceLimit = Infinity;
```

## **测试**

我们可以使用以下代码来测试 `getCallerLocation` 函数：

```typescript
import JceError from "./JceError";

function throwError() {
  throw new JceError("This is a test error");
}

try {
  throwError();
} catch (error: any) {
  console.error("Caught an error:", error.message);
}
```

运行结果如下：

```bash
[Error Class] (at Object.<anonymous> (/Users/fengwenxuan/Desktop/node/amigo-bot/packages/core/src/jce/jce.spec.ts:8:5)): ["This is a test error"]
Caught an error: This is a test error
```

由于是自定义的错误，所以构造器中本身不会出现问题。只有构造器本身都出问题了，才会走入下面的 catch 语句。比如：

```typescript
class JceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JceError";

    throw new Error("Method not implemented.");
  }
}
```

运行结果如下：

```bash
[错误] (at new JceError (/Users/fengwenxuan/Desktop/node/amigo-bot/packages/core/src/jce/JceError.ts:9:15)): Method not implemented.
Caught an error: This is a test error
```

**注意**: 因为是我们自定义的错误，所以`console.error("Caught an error:", error.message);`在捕捉时始终会打印出错误信息。如果是系统错误，那么就不一定了。

**总结**

JavaScript 错误堆栈包含了代码调用的层次结构信息，但通常包括了许多不相关的函数调用。通过深入理解堆栈结构和使用 `Error.captureStackTrace` 方法，我们可以捕获装饰器函数的位置，从而更好地了解代码的执行情况。
