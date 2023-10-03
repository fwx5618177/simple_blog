# Zig 编译器-Bog 捕获错误的优势写法

在阅读一个开源项目 Bog 时,恰好看到编写的虚拟机,在处理运行中的错误时所使用的写法。为止新奇，但确实要方便一些，只是学习成本比较高。

```zig
pub fn run(vm: *Vm, f: *Frame) (Error || error{Suspended})!*Value {
    ...
}
```

- `!*Value`：意味着在正常情况下，返回的是一个 `Value` 类型的值
- 如果是非正常的情况下，则会返回一个 `Error` 类型的值。Error 是 zig 原生定义的值，而`error{Suspended}`则是我们自己定义的错误

注意: 在 zig 中，error 为类似于`enum`的基础类型，具体参考链接: [Error-Set-Type](https://ziglang.org/documentation/master/#Error-Set-Type)

既然熟悉了结果，那开始自己构造并且来使用。以下为实际例子:

```zig
const Node = struct {
    pre: i8,
    post: bool,
};

const Error = error{NotFound};

fn testError(a: Node) (Error || error{NotFound})!i8 {
    return a.pre;
}
```

- 当我在 bog 里面去定义的时候，如果是属于 vm 内部的定义错误，它就会扔出来我们自定义的错，方便 gc 处理
- 如果超出了我们在 vm 里定义的内部错误，就会由外部捕获基础错误
- 一切正常的时候，则返回 i8 类型的值

## 实际例子

```zig
const std = @import("std");

const Error = error{NotFound};

pub fn main() !void {
    const node1: Node = .{
        .pre = 1,
        .post = true,
    };

    const node2 = Node{
        .pre = 2,
        .post = false,
    };

    const node3 = .{
        .pre = true,
        .post = true,
    };

    const node4 = .{
        .pre = error.NotFound,
        .post = true,
    };

    const result = try testError(node1);
    const result2 = try testError(node3);
    const result3 = try testError(node4);

    std.debug.print("variable: {}\n", .{result});
    std.debug.print("variable: {}\n", .{result2});
    std.debug.print("variable: {}\n", .{result3});

    std.debug.print("variable: {s}\n", .{@typeName(Node)});
    std.debug.print("variable: {s}\n", .{@typeName(@TypeOf(node1))});
    std.debug.print("variable: {s}\n", .{@typeName(@TypeOf(node2))});
    std.debug.print("variable: {s}\n", .{@typeName(@TypeOf(node3))});

    std.debug.print("variable: {!}\n", .{query(1)});
}

const Node = struct {
    pre: i8,
    post: bool,
};

fn query(a: i32) !i32 {
    return a;
}

fn testError(a: Node) (Error || error{NotFound})!i8 {
    return a.pre;
}

```

## 编译结果

```zig
bog/tests/main_vm.zig:27:35: error: expected type 'i8', found 'bool'
    const result2 = try testError(node3);

bog/tests/main_vm.zig:28:35: error: expected type 'i8', found 'error{NotFound}'
const result3 = try testError(node4);
```
