# Understanding JavaScript Error Stack Traces (Call Frames) for Capturing Decorator Error Locations

## Abstract

This article explores how to obtain location information for the calling code in JavaScript, particularly the location of decorator functions. We will delve into JavaScript error stack traces and learn how to use `Error.captureStackTrace` to capture call frame locations, which in turn allows us to pinpoint error locations.

JavaScript error stack traces typically contain a hierarchy of code calls, but often include many unrelated function calls. In scenarios like decorator patterns, we may want to capture the location of the decorator function applied to a class. To achieve this, we need to understand the structure of error stacks and how to correctly obtain call frame locations.

## Use Cases

We have customized an Error class for throwing specific types of errors. We want our logging system to record error locations when errors are thrown for debugging purposes. In this scenario, we initially used `console.log` to obtain error details. However, we wanted to directly access error locations within the error class itself, rather than writing `console.log` statements in every error class. Decorators come in handy here, offering both convenience and cleaner code.

Here is an example code snippet:

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

## Using `Reflect.construct` to Invoke Constructors from Decorators

### Abstract

In JavaScript, we cannot directly invoke decorators within constructors. Therefore, we need to invoke constructors within decorators, and we achieve this using `Reflect.construct`.

This decorator is used to record error locations:

```typescript
/**
 * A class decorator used for error logging. When a class decorated with this
 * decorator is instantiated, error information is recorded.
 *
 * @param target - The class being decorated.
 *
 * @example
 * @Log.logErrorClass
 * class MyErrorClass { // ... }
 */
static logErrorClass(...args: any[]) {
    // Save the original constructor
    const original: Function = args[0];

    // Behavior of the new constructor
    const f: any = function (...args: any[]) {
        let instance;

        try {
            // Attempt to instantiate the original class
            instance = Reflect.construct(original, args, new.target);

            // Record the location and parameters
            const location = Log.getCallerLocation();
            const params = JSON.stringify(args);

            // Attach location and parameter information to the instance
            instance.location = location;
            instance.params = params;

            console.log(
                chalk.red('[Error Class]'),
                chalk.blue(`(${location}):`),
                chalk.yellow(params),
            );
        } catch (error: any) {
            // Capture errors in the constructor and display error information in color on the console
            const stackLines = error.stack?.split('\n');
            const location = stackLines ? stackLines[1].trim() : 'Unknown Location';

            console.log(
                chalk.red('[Error]'),
                chalk.blue(`(${location}):`),
                chalk.yellow(error.message),
            );

            throw error; // Re-throw the error
        }

        return instance;
    };

    // Copy the prototype to keep the instanceof operator working
    f.prototype = original.prototype;

    // Return the new constructor (replacing the original constructor)
    return f;
}
```

We intend to use the `logErrorClass` decorator to decorate error classes, but the decorator function's position is not what we desire. We want to capture the location of the class to which the decorator function is applied. This introduces the core concept of this article: **error stacks**.

## Explanation

In JavaScript, the error stack trace contains hierarchical information about the code's call structure. Typically, the top of the stack includes the current code execution location, followed by the locations of called functions and methods as you go down. This stack is usually a text string where each line represents a call frame, including the names of functions or methods and their positions in the code.

We want to capture the location of the class to which the decorator function is applied. However, the stack also contains other function calls, such as internal JavaScript engine functions and Node.js runtime functions. Therefore, we need to find the correct line to obtain the location where the decorator function is applied.

### **General Structure of Error Stacks**

JavaScript error stacks typically have the following structure:

1. The first line contains a description of the error message, usually without information about the location in the application code.
2. The second line is typically the invocation of the `Error.captureStackTrace` function, also without application code location.
3. The third line usually contains the call location of the class to which the decorator is applied, which is the position we want to capture.
4. Subsequent lines contain the positions of other function calls, which may not be of interest to us.

To obtain the correct decorator location, we make the following assumptions:

- If the stack has at least four lines, we assume that the decorator's location is usually on the fourth line, so we return the content of the fourth line as the decorator location.
- If there are fewer than four stack lines, we cannot determine the decorator's location, so we return a default "Unknown Location."

This assumption is based on general cases, and the actual stack structure may vary depending on the environment.

## **Methods for Capturing Decorator Locations**

To capture the location where a decorator function is applied, we can use the `Error.captureStackTrace` method. This method allows us to create a custom error object and capture the call stack information of the current code execution. Here are the steps to capture the decorator location:

1. Create an empty error object, such as `error`.
2. Call `Error.captureStackTrace(error, captureFunction)`, where `captureFunction` is a placeholder function used to indicate where to capture the stack information.
3. Analyze the stack information; typically, the decorator function's call location is on the third line (assuming it's on the fourth line in the stack). We can retrieve and record this location.

Here is an example code snippet:

```typescript
function getCallerLocation() {
  const error = {};
  Error.captureStackTrace(error, getCallerLocation);

  const stackLines = error.stack.split("\n");

  // Assuming the call location is on the third line of the stack
  if (stackLines.length >= 4) {
    return stackLines[3].trim();
  } else {
    return "Unknown Location";
  }
}
```

In this example, the `getCallerLocation` function captures the decorator function's call location and returns it. Please note that the actual stack structure may vary depending on your project's requirements, so you might need to adjust the line numbers accordingly.

## **Alternative Methods for Capturing Decorator Locations**

### **Using `Error.stackTraceLimit`**

The `Error.stackTraceLimit` property is used to specify the maximum number of lines in the stack. By default, this value is `10`, but you can set it to `Infinity` to obtain the complete stack information. Here's an example code snippet:

```typescript
// Set the maximum number of stack lines to Infinity
Error.stackTraceLimit = Infinity;
```

## **Testing**

You can test the `getCallerLocation` function using the following code:

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

The output will look like this:

```bash
[Error Class] (at Object.<anonymous> (/Users/fengwenxuan/Desktop/node/amigo-bot/packages/core/src/jce/jce.spec.ts:8:5)): ["This is a test error"]
Caught an error: This is a test error
```

Since this is a custom error, the constructor itself does not encounter any issues. Only when the constructor itself encounters an error will the code enter the catch statement. For example:

```typescript
class JceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JceError";

    throw new Error("Method not implemented.");
  }
}
```

The output will look like this:

```bash
[Error] (at new JceError (/Users/fengwenxuan/Desktop/node/amigo-bot/packages/core/src/jce/JceError.ts:9:15)): Method not implemented.
Caught an error: This is a test error
```

**Note**: Because it is a custom error, `console.error("Caught an error:", error.message);` will always print the error message when catching it. If it were a system error, the behavior might differ.

**Summary**

JavaScript error stacks contain information about the hierarchical structure of code calls, but they typically include many unrelated function calls. By understanding stack structures and using the `Error.captureStackTrace` method, we can capture the location of decorator functions, providing better insight into code execution.
