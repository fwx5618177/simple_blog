# 【Go】Minio源码解析（一）——入口函数、位腐败算法、服务器入口点

MinIO 是一个开源的对象存储服务器，旨在实现高性能、高可用性的分布式对象存储解决方案。它是一个兼容Amazon S3（Simple Storage Service）的服务器，可以用于构建私有云存储、公有云存储、备份、归档以及大规模数据存储等应用场景。MinIO 支持大规模数据存储、高速数据传输以及对象元数据的存储和检索。

MinIO 主要的特点和用途包括：

1. **分布式对象存储**：MinIO 可以横向扩展，将数据分布到多个存储节点上，以提供高性能和可伸缩性。

2. **高性能**：MinIO 的设计目标是提供低延迟、高吞吐量的数据传输，适用于需要快速读写大文件的应用。

3. **开源和免费**：MinIO 是一个开源项目，可以免费使用并根据需要进行修改。

4. **S3 兼容性**：MinIO 支持 Amazon S3 的 API，这意味着您可以使用现有的 S3 客户端和工具来访问 MinIO 存储，同时还兼容许多 S3 的功能。

5. **数据保护和冗余**：MinIO 支持数据的分布式冗余和数据保护策略，以确保数据的可靠性和可用性。

6. **对象元数据**：MinIO 可以存储和检索对象的元数据，这使得您可以在对象上存储任何类型的自定义信息。

7. **容器和云原生**：MinIO 适用于容器化环境和云原生架构，可以轻松集成到 Kubernetes 等平台中。

8. **备份和归档**：MinIO 可以用于数据备份、归档和长期存储，以满足不同类型的数据管理需求。

MinIO 的应用场景广泛，从个人用户使用它作为文件备份和存储，到企业使用它来构建大规模的分布式存储解决方案。它可以用于存储图像、视频、日志文件、备份数据等各种类型的数据。它是一个强大的开源对象存储服务器，适用于构建高性能、可伸缩的分布式存储解决方案，可以满足多种数据管理和存储需求。

## 简介范围
1. 入口函数
   1. 无缓冲通道
   2. 代码指令补齐
      1. Trie Tree: 前缀树(字典树)
2. 位腐败算法: bitrot
3. 服务器入口点

## 1. 入口函数
- `cmd/main.go`: Minio服务器的入口

```go
// Main main for minio server.
func Main(args []string) {
	// Set the minio app name.
	appName := filepath.Base(args[0])

	if env.Get("_MINIO_DEBUG_NO_EXIT", "") != "" {
		freeze := func(_ int) {
			// Infinite blocking op
			<-make(chan struct{})
		}

		// Override the logger os.Exit()
		logger.ExitFunc = freeze

		defer func() {
			if err := recover(); err != nil {
				fmt.Println("panic:", err)
				fmt.Println("")
				fmt.Println(string(debug.Stack()))
			}
			freeze(-1)
		}()
	}

	// Run the app - exit on error.
	if err := newApp(appName).Run(args); err != nil {
		os.Exit(1) //nolint:gocritic
	}
}
```

这段代码用于设置MinIO应用程序的名称以及一些调试和错误处理逻辑。来逐行解释代码的含义：

1. `appName := filepath.Base(args[0])`
   这一行代码用于获取执行程序的名称，它使用`filepath.Base`函数从`args`切片中获取第一个参数（通常是执行程序的路径），然后提取路径中的文件名部分作为`appName`。

2. `if env.Get("_MINIO_DEBUG_NO_EXIT", "") != "" {`
   这一行开始一个条件语句，检查名为"_MINIO_DEBUG_NO_EXIT"的环境变量是否存在且非空。如果该环境变量存在且非空，代码块中的内容将被执行，这部分代码通常用于调试目的。

3. `freeze := func(_ int) { ... }`
   在这里，一个名为`freeze`的匿名函数被定义。它接受一个整数参数，但在函数体内并没有使用这个参数。这个函数会执行一个永久阻塞的操作，通过在一个无缓冲通道上等待。这似乎是一种暂停或阻塞程序执行的方法。

4. `logger.ExitFunc = freeze`
   这一行将日志记录器（`logger`）的`ExitFunc`字段设置为之前定义的`freeze`函数。这样，在日志记录器试图调用`os.Exit()`函数时，实际上会执行`freeze`函数，导致程序被永久阻塞。

5. `defer func() { ... }()`
   这里定义了一个延迟执行的匿名函数，用于在函数执行结束后进行一些清理工作。首先，它通过`recover()`函数捕获可能发生的恐慌（panic）。如果恐慌发生，它会打印恐慌的错误信息和堆栈跟踪信息。然后，它调用之前定义的`freeze`函数，再次导致程序被永久阻塞。请注意，`freeze(-1)`的参数值似乎是多余的，因为`freeze`函数并没有使用参数。

这段代码是为了在某种特殊的调试模式下，防止MinIO应用程序正常退出，以便进行调试和错误排查。当设置了"_MINIO_DEBUG_NO_EXIT"环境变量时，程序将永久阻塞，以便能够观察程序状态和堆栈信息，以便更好地理解问题。但是，请注意，这种做法不适合正式的生产环境，因为它会导致应用程序无法正常终止。


### 1. 无缓冲通道
```go
// Infinite blocking op
<-make(chan struct{})
```

我们回顾一下。在Go语言中，通道（Channel）是用于在不同goroutine之间进行通信和同步的一种机制。通道可以是有缓冲的（buffered）或无缓冲的（unbuffered）。

无缓冲通道的特点是：发送操作（send）会阻塞直到有接收操作（receive）等待，而接收操作会阻塞直到有发送操作等待。这意味着在无缓冲通道上发送数据会使发送者和接收者同时阻塞，直到另一方准备好。因此，无缓冲通道也被称为同步通道（synchronous channel）。


例子增加认识:
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch := make(chan int) // 创建无缓冲通道

	go func() {
		fmt.Println("Sending data...")
		ch <- 42 // 发送数据到通道
		fmt.Println("Data sent")
	}()

	time.Sleep(time.Second) // 等待一段时间

	fmt.Println("Receiving data...")
	data := <-ch // 从通道接收数据
	fmt.Println("Data received:", data)
}

```

在上面的例子中，主函数创建了一个无缓冲通道 ch。然后启动了一个新的goroutine，该goroutine试图将值 42 发送到通道 ch 中。由于通道是无缓冲的，发送操作会在这里阻塞，直到有另一个goroutine准备好接收数据。

主函数在等待一段时间后，执行接收操作 data := <-ch，这会导致发送操作继续执行，将数据发送到通道，然后接收操作成功接收到数据。

**无缓冲通道在确保数据同步和通信的时候非常有用，因为它强制发送和接收操作同时进行，从而有效避免了竞态条件（Race Condition）**

#### 通道阻塞会发生什么?

当通道阻塞时，意味着通道的发送或接收操作无法立即完成，而是被阻塞在那里，直到特定条件满足。通道阻塞可能是由于不同的情况引起的，下面我将解释两种常见的情况：

发送操作阻塞：
当向通道发送数据时，如果通道已满（对于有缓冲通道）或者没有接收者（无缓冲通道），发送操作将阻塞，直到满足以下条件之一：
- 对于有缓冲通道，直到有足够的空间来容纳发送的数据。
- 对于无缓冲通道，直到有接收者准备好从通道中接收数据。

接收操作阻塞：
当从通道接收数据时，如果通道为空（对于有缓冲通道）或者没有发送者（无缓冲通道），接收操作将阻塞，直到满足以下条件之一：
- 对于有缓冲通道，直到通道中有数据可供接收。
- 对于无缓冲通道，直到有发送者发送数据到通道中。

**在通道阻塞的情况下，goroutine（Go语言中的轻量级线程）会暂停执行，直到可以继续执行发送或接收操作。这种机制有助于确保并发程序中的数据同步和协调**

为了避免永久阻塞和死锁，通常需要小心地设计并确保通道的发送和接收操作能够按照预期进行。使用select语句可以在多个通道之间选择，以避免阻塞并处理多个通道的情况。

### 2. 代码指令补齐

```go
func newApp(name string) *cli.App {
	// Collection of minio commands currently supported are.
	commands := []cli.Command{}

	// Collection of minio commands currently supported in a trie tree.
	commandsTree := trie.NewTrie()

	// registerCommand registers a cli command.
	registerCommand := func(command cli.Command) {
		commands = append(commands, command)
		commandsTree.Insert(command.Name)
	}

	findClosestCommands := func(command string) []string {
		var closestCommands []string
		closestCommands = append(closestCommands, commandsTree.PrefixMatch(command)...)

		sort.Strings(closestCommands)
		// Suggest other close commands - allow missed, wrongly added and
		// even transposed characters
		for _, value := range commandsTree.Walk(commandsTree.Root()) {
			if sort.SearchStrings(closestCommands, value) < len(closestCommands) {
				continue
			}
			// 2 is arbitrary and represents the max
			// allowed number of typed errors
			if words.DamerauLevenshteinDistance(command, value) < 2 {
				closestCommands = append(closestCommands, value)
			}
		}

		return closestCommands
	}

	// Register all commands.
	registerCommand(serverCmd)
	registerCommand(gatewayCmd) // hidden kept for guiding users.
    ......
}
```

- 此处的设计为先启动服务，然后将服务注册到命令行中，这样可以保证服务的正常运行，而不会因为命令行的问题而导致服务无法启动。
- `commandsTree := trie.NewTrie()` 用于创建一个前缀树，用于存储命令行的指令，这样可以快速的进行指令补齐。

#### Trie Tree: 前缀树(字典树)

在Go编程语言中，"trie"（也称为"前缀树"或"字典树"）是一种用于存储和检索字符串数据的数据结构。它是一种有根的树形结构，每个节点代表一个字符串的字符，从根节点开始，沿着路径构建字符串。trie树的主要优势是它能够高效地执行字符串的查找和前缀匹配操作。

在trie树中，字符串被分解为字符序列，并沿着树的路径插入。每个节点代表一个字符，每个从根节点到叶子节点的路径构成一个字符串。树的结构使得具有相同前缀的字符串共享相同的节点，从而节省了存储空间。此外，trie树允许进行高效的前缀匹配，查找以某个特定前缀开头的所有字符串。

在Go中，你可以使用自定义结构和指针来构建trie树，或者使用现有的库来处理字符串的trie树操作。

创建一个基本的trie树：
```go
type rune int32

type Node struct {
	exists bool
	value  string
	child  map[rune]*Node // runes as child.
}

// newNode create a new trie node.
func newNode() *Node {
	return &Node{
		exists: false,
		value:  "",
		child:  make(map[rune]*Node),
	}
}

// Trie is a trie container.
type Trie struct {
	root *Node
	size int
}

// Root returns root node.
func (t *Trie) Root() *Node {
	return t.root
}

// Insert insert a key.
func (t *Trie) Insert(key string) {
	curNode := t.root
	for _, v := range key {
		if curNode.child[v] == nil {
			curNode.child[v] = newNode()
		}
		curNode = curNode.child[v]
	}

	if !curNode.exists {
		// increment when new rune child is added.
		t.size++
		curNode.exists = true
	}
	// value is stored for retrieval in future.
	curNode.value = key
}

// PrefixMatch - prefix match.
func (t *Trie) PrefixMatch(key string) []string {
	node, _ := t.findNode(key)
	if node == nil {
		return nil
	}
	return t.Walk(node)
}

// Walk the tree.
func (t *Trie) Walk(node *Node) (ret []string) {
	if node.exists {
		ret = append(ret, node.value)
	}
	for _, v := range node.child {
		ret = append(ret, t.Walk(v)...)
	}
	return
}

// find nodes corresponding to key.
func (t *Trie) findNode(key string) (node *Node, index int) {
	curNode := t.root
	f := false
	for k, v := range key {
		if f {
			index = k
			f = false
		}
		if curNode.child[v] == nil {
			return nil, index
		}
		curNode = curNode.child[v]
		if curNode.exists {
			f = true
		}
	}

	if curNode.exists {
		index = len(key)
	}

	return curNode, index
}

// NewTrie create a new trie.
func NewTrie() *Trie {
	return &Trie{
		root: newNode(),
		size: 0,
	}
}
```

当在插入字符串'testing'后，trie树的数据结构将如下所示：
```bash
(root)
  |
  t (exists: false, value: "", size: 7)
   \
    e (exists: false, value: "", size: 6)
     \
      s (exists: false, value: "", size: 5)
       \
        t (exists: true, value: "testing", size: 4)
         \
          i (exists: false, value: "", size: 3)
           \
            n (exists: false, value: "", size: 2)
             \
              g (exists: false, value: "", size: 1)
                \
                 (exists: false, value: "", size: 0)
```
每个节点表示一个字符，exists 表示是否是一个字符串的结尾，value 存储字符串值，child 是一个 map，其中键是字符的 rune 类型，值是指向子节点的指针。

以下是树的构建过程：
1. 字符 't' 插入，创建新节点，'exists' 设置为 false。
2. 字符 'e' 插入，创建新节点，'exists' 设置为 false。
3. 字符 's' 插入，创建新节点，'exists' 设置为 false。
4. 字符 't' 插入，创建新节点，'exists' 设置为 true，'value' 设置为 "testing"。
5. 字符 'i' 插入，创建新节点，'exists' 设置为 false。
6. 字符 'n' 插入，创建新节点，'exists' 设置为 false。
7. 字符 'g' 插入，创建新节点，'exists' 设置为 false。

最终形成一个trie树，其中字符串 "testing" 被插入并标记为一个字符串的结尾。其他字符序列 't', 'e', 's', 't', 'i', 'n', 'g' 也被相应地插入。

注意，该trie树仅表示插入了一个字符串 "testing"，并没有包含其他可能插入的字符串。在实际使用中，trie树可能会包含多个字符串，共享相同的前缀节点。

#### 代码指令补齐
```go
closestCommands = append(closestCommands, commandsTree.PrefixMatch(command)...)
```
这行代码的含义是将 trie 树 commandsTree 中与给定命令 command 具有相同前缀的命令名称添加到切片 closestCommands 中。作用是找到 trie 树中与给定命令具有相同前缀的所有命令名称，并将这些命令名称添加到 closestCommands 切片中，以便后续处理或显示。这种操作在自动补全、命令提示等场景中非常常见。

让我逐步解释这行代码：

- closestCommands: 这是一个切片，用于存储与给定命令具有相同前缀的命令名称。

- commandsTree.PrefixMatch(command): 这是一个调用 trie 树 commandsTree 的 PrefixMatch 方法，该方法会返回与给定命令 command 具有相同前缀的所有命令名称。这个返回值是一个切片。

- `...`: 这是 Go 语言中的一个语法，用于将切片的元素打散作为参数传递给函数。在这里，它被用于将 PrefixMatch 方法返回的切片中的元素依次添加到 closestCommands 切片中。

## 2. 位腐败算法: bitrot

```go
// Register all commands.
registerCommand(serverCmd)
...

var serverCmd = cli.Command{
	Name:   "server",
	Usage:  "start object storage server",
	Flags:  append(ServerFlags, GlobalFlags...),
	Action: serverMain,
	CustomHelpTemplate: `NAME:
  {{.HelpName}} - {{.Usage}}
  `,
}
```
在注册的指令中，我们可以看到 serverCmd 的定义，其中包含了 Action 字段，这个字段指定了 serverMain 函数，这个函数就是 MinIO 指令的执行函数。

```go
func serverMain(ctx *cli.Context) {
	signal.Notify(globalOSSignalCh, os.Interrupt, syscall.SIGTERM, syscall.SIGQUIT)

	go handleSignals()

	setDefaultProfilerRates()

	// Initialize globalConsoleSys system
	bootstrapTrace("newConsoleLogger")
	globalConsoleSys = NewConsoleLogger(GlobalContext)
	logger.AddSystemTarget(GlobalContext, globalConsoleSys)

	// Perform any self-tests
	bootstrapTrace("selftests")
	bitrotSelfTest()
	erasureSelfTest()
	compressSelfTest()
    ......
}
```

我们以`bitrotSelfTest`为实际例子讲解：
```go
// bitrotSelfTest performs a self-test to ensure that bitrot
// algorithms compute correct checksums. If any algorithm
// produces an incorrect checksum it fails with a hard error.
//
// bitrotSelfTest tries to catch any issue in the bitrot implementation
// early instead of silently corrupting data.
func bitrotSelfTest() {
	checksums := map[BitrotAlgorithm]string{
		SHA256:          "a7677ff19e0182e4d52e3a3db727804abc82a5818749336369552e54b838b004",
		BLAKE2b512:      "e519b7d84b1c3c917985f544773a35cf265dcab10948be3550320d156bab612124a5ae2ae5a8c73c0eea360f68b0e28136f26e858756dbfe7375a7389f26c669",
		HighwayHash256:  "39c0407ed3f01b18d22c85db4aeff11e060ca5f43131b0126731ca197cd42313",
		HighwayHash256S: "39c0407ed3f01b18d22c85db4aeff11e060ca5f43131b0126731ca197cd42313",
	}
	for algorithm := range bitrotAlgorithms {
		if !algorithm.Available() {
			continue
		}

		checksum, err := hex.DecodeString(checksums[algorithm])
		if err != nil {
			logger.Fatal(errSelfTestFailure, fmt.Sprintf("bitrot: failed to decode %v checksum %s for selftest: %v", algorithm, checksums[algorithm], err))
		}
		var (
			hash = algorithm.New()
			msg  = make([]byte, 0, hash.Size()*hash.BlockSize())
			sum  = make([]byte, 0, hash.Size())
		)
		for i := 0; i < hash.Size()*hash.BlockSize(); i += hash.Size() {
			hash.Write(msg)
			sum = hash.Sum(sum[:0])
			msg = append(msg, sum...)
			hash.Reset()
		}
		if !bytes.Equal(sum, checksum) {
			logger.Fatal(errSelfTestFailure, fmt.Sprintf("bitrot: %v selftest checksum mismatch: got %x - want %x", algorithm, sum, checksum))
		}
	}
}
```

`bitrotSelfTest`执行了自我测试以确保位腐败（bitrot）算法能够正确计算校验和。位腐败指的是数据在传输或存储过程中因错误或损坏而导致的位级别的数据损坏。这个函数的主要目的是在发生数据位损坏时检测到问题，而不是默默地损坏数据，从而确保数据的完整性和正确性。**这个函数的主要目的是验证不同的位腐败算法是否能够正确计算校验和，以确保在存储和传输数据时不会因为位损坏而导致数据不一致或损坏。如果有任何测试失败，函数会以致命错误终止程序。这有助于在早期发现并解决潜在的位腐败问题。**

- 注意：这是一个测试函数，所以设置了固定的值

下面是这个函数的详细解释：

1. `checksums` 是一个映射，将不同的位腐败算法与其预期的校验和关联起来。这些校验和是预先计算好的，用于验证位腐败算法的正确性。

2. 使用 `for` 循环迭代所有可用的位腐败算法，这些算法保存在 `bitrotAlgorithms` 中。

3. 在循环中，首先检查当前算法是否可用，如果不可用，则跳过该算法的测试。

4. 从 `checksums` 映射中获取当前算法的预期校验和，并使用 `hex.DecodeString` 将其解码为二进制数据。

5. 为当前算法创建一个哈希（hash）对象和两个空的字节切片 `msg` 和 `sum`。`msg` 用于存储哈希操作的消息，`sum` 用于存储哈希的结果。

6. 通过循环迭代，多次将哈希操作应用于消息，并将哈希的结果附加到消息中。这样，`msg` 中将包含多次哈希操作的结果。

7. 最后，比较最终的 `sum` 与预期的校验和 `checksum` 是否相等。如果它们不相等，说明该算法在自我测试中产生了不一致的结果。

8. 如果任何算法的自我测试失败，将调用 `logger.Fatal` 函数，输出错误消息并终止程序运行。

```go
for i := 0; i < hash.Size()*hash.BlockSize(); i += hash.Size() {
        hash.Write(msg)
        sum = hash.Sum(sum[:0])
        msg = append(msg, sum...)
        hash.Reset()
}
```

这部分代码是在进行位腐败算法的自我测试中使用的。它的目的是创建一个消息块（`msg`），然后对该消息块进行连续的哈希计算，并将计算的哈希值附加到消息块中，以模拟数据块的传输和计算数据块的校验和的过程。

让我逐步解释这部分代码的工作原理：

1. `for i := 0; i < hash.Size()*hash.BlockSize(); i += hash.Size()`：这是一个循环，它会执行多次，以便对消息块进行多次哈希计算。循环的次数是`hash.Size()*hash.BlockSize()`，其中`hash.Size()`返回哈希算法的输出大小，`hash.BlockSize()`返回哈希算法的块大小。

2. `hash.Write(msg)`：这一行将当前的消息块`msg`写入哈希计算器`hash`中。在第一次迭代中，这是一个空的消息块。

3. `sum = hash.Sum(sum[:0])`：这一行计算当前消息块的哈希值，并将结果存储在`sum`变量中。`hash.Sum([]byte)`方法用于计算哈希值，参数`sum[:0]`用于创建一个新的`sum`切片，以接收哈希值。

4. `msg = append(msg, sum...)`：这一行将计算得到的哈希值（`sum`）附加到消息块`msg`的末尾。这模拟了数据块的传输，其中每个数据块的校验和都是前一个数据块的哈希值。

5. `hash.Reset()`：这一行重置哈希计算器`hash`，以便进行下一次迭代时，它可以继续计算一个新的数据块的哈希值。

**这部分代码的目的是模拟数据块的连续传输，每个数据块的校验和都是前一个数据块的哈希值。这样做是为了测试位腐败算法是否能够正确地计算哈希值，并确保它们在不同数据块上的计算结果是可预测的**

换而言之，这段代码不断地将前一个数据块的哈希值附加到当前数据块的末尾，然后重新计算当前数据块的哈希值。这个过程模拟了数据块的传输和哈希计算，以确保位腐败算法能够正确地计算和校验数据块的哈希值。因为位腐败算法的目标是检测数据块中的位错误，所以这个自我测试确保算法在不断变化的数据块上也能正常工作。

## 3. 服务器入口点简介

- `cmd/server-main.go`, Line 544

```go
func serverMain(ctx *cli.Context) {
	signal.Notify(globalOSSignalCh, os.Interrupt, syscall.SIGTERM, syscall.SIGQUIT)

	go handleSignals()

	setDefaultProfilerRates()

	// Initialize globalConsoleSys system
	bootstrapTrace("newConsoleLogger")
	globalConsoleSys = NewConsoleLogger(GlobalContext)
	logger.AddSystemTarget(GlobalContext, globalConsoleSys)

	// Perform any self-tests
	bootstrapTrace("selftests")
	bitrotSelfTest()
	erasureSelfTest()
	compressSelfTest()
    ......
}
```

这个函数是 MinIO 服务器的主要入口点，它完成了服务器的初始化和启动过程，主要负责初始化 MinIO 服务器并启动各个服务和协程，以便服务器可以接受客户端请求并提供对象存储服务。下面是对函数中主要部分的解释：

1. **信号处理：** 在函数一开始，它调用 `signal.Notify` 来捕获操作系统的中断信号（`os.Interrupt`）、终止信号（`syscall.SIGTERM`）和退出信号（`syscall.SIGQUIT`）。这些信号用于优雅地关闭服务器。

2. **启动信号处理协程：** 使用 `go handleSignals()` 启动一个协程来处理捕获到的信号。这个协程会监听信号并在收到信号时执行相应的处理逻辑，例如关闭服务器。

3. **设置默认的性能分析速率：** 调用 `setDefaultProfilerRates()` 来设置性能分析的默认速率，用于统计服务器的性能数据。

4. **初始化全局控制台系统：** 调用 `NewConsoleLogger` 创建全局控制台日志系统 `globalConsoleSys`，用于记录服务器的日志信息。

5. **执行自我测试：** 调用 `bitrotSelfTest()`、`erasureSelfTest()` 和 `compressSelfTest()` 来执行服务器的自我测试，以确保各种算法和功能的正确性。

6. **处理服务器环境变量和命令行参数：** 通过调用 `serverHandleEnvVars()` 处理服务器的环境变量，通过调用 `serverHandleCmdArgs()` 处理命令行参数，这些参数用于配置服务器。

7. **初始化 KMS 配置：** 调用 `handleKMSConfig()` 来初始化密钥管理服务（KMS）的配置。

8. **设置节点名称：** 通过调用 `globalConsoleSys.SetNodeName` 来设置节点名称，只有在分布式设置中才会设置节点名称。

9. **初始化帮助信息：** 调用 `initHelp()` 来初始化帮助信息，以便在用户请求时显示。

10. **初始化所有子系统：** 调用 `initAllSubsystems` 来初始化服务器的所有子系统，例如事件通知、数据扫描等。

11. **检查更新：** 启动一个协程来检查 MinIO 服务器是否有新的更新版本。

12. **配置服务器：** 调用 `configureServerHandler` 来配置服务器的处理器，根据服务器的端点配置创建相应的 HTTP 处理器。

13. **创建 HTTP 服务器：** 调用 `xhttp.NewServer` 来创建 HTTP 服务器，配置服务器的监听地址、TLS 配置等，并启动 HTTP 服务器。

14. **初始化其他服务：** 启动一系列的协程来初始化其他后台服务，如数据扫描、后台复制等。

15. **初始化对象存储层：** 调用 `newObjectLayer` 来初始化对象存储层，这是 MinIO 存储系统的核心组件。

16. **初始化身份验证和授权系统：** 启动协程来初始化用户凭据、策略等身份验证和授权系统。

17. **初始化其他后台服务：** 启动协程来初始化其他后台服务，如 FTP 服务器、SFTP 服务器等。

18. **等待操作系统信号：** 通过 `<-globalOSSignalCh` 等待操作系统信号，一旦收到信号，就会触发服务器的关闭。


### 分块介绍

```go
func serverMain(ctx *cli.Context) {
    // 在服务器收到终止信号时通知 globalOSSignalCh。
    signal.Notify(globalOSSignalCh, os.Interrupt, syscall.SIGTERM, syscall.SIGQUIT)

    // 启动一个协程来处理信号。
    go handleSignals()

    // 设置默认的性能分析率。
    setDefaultProfilerRates()

    // 初始化全局日志系统。
    bootstrapTrace("newConsoleLogger")
    globalConsoleSys = NewConsoleLogger(GlobalContext)
    logger.AddSystemTarget(GlobalContext, globalConsoleSys)

    // 执行各种自测。
    bootstrapTrace("selftests")
    bitrotSelfTest()
    erasureSelfTest()
    compressSelfTest()

    // 处理所有服务器环境变量。
    bootstrapTrace("serverHandleEnvVars")
    serverHandleEnvVars()

    // 处理所有服务器命令参数。
    bootstrapTrace("serverHandleCmdArgs")
    serverHandleCmdArgs(ctx)

    // 初始化KMS配置。
    bootstrapTrace("handleKMSConfig")
    handleKMSConfig()

    // 设置节点名称，仅用于分布式设置。
    bootstrapTrace("setNodeName")
    globalConsoleSys.SetNodeName(globalLocalNodeName)

    // 初始化所有帮助信息。
    bootstrapTrace("initHelp")
    initHelp()

    // 初始化所有子系统。
    bootstrapTrace("initAllSubsystems")
    initAllSubsystems(GlobalContext)
    // 其他代码...
}
```

- 这个函数 serverMain 主要是 MinIO 服务器的启动逻辑，包括信号处理、日志初始化、自测、环境变量处理、命令参数处理、KMS配置、节点名称设置、帮助信息初始化、子系统初始化等。这些步骤都是 MinIO 服务器的初始化过程，用于确保服务器正确启动并配置。每个步骤的作用在函数中都有注释进行解释。

```go
// Is distributed setup, error out if no certificates are found for HTTPS endpoints.
if globalIsDistErasure {
    if globalEndpoints.HTTPS() && !globalIsTLS {
        logger.Fatal(config.ErrNoCertsAndHTTPSEndpoints(nil), "Unable to start the server")
    }
    if !globalEndpoints.HTTPS() && globalIsTLS {
        logger.Fatal(config.ErrCertsAndHTTPEndpoints(nil), "Unable to start the server")
    }
}

```

- 这部分代码检查是否是分布式设置，如果是，它会检查是否存在 HTTPS 证书，如果不存在则报错。这是为了确保在分布式设置中，如果需要使用 HTTPS，必须提供证书。


```go
// Check for updates in non-blocking manner.
go func() {
    if !globalCLIContext.Quiet && !globalInplaceUpdateDisabled {
        // Check for new updates from dl.min.io.
        bootstrapTrace("checkUpdate")
        checkUpdate(getMinioMode())
    }
}()
```
- 这段代码启动一个协程，用于检查 MinIO 服务器是否有新的更新。它会定期检查是否有新版本可用，并在控制台显示通知。

```go
// Set system resources to maximum.
bootstrapTrace("setMaxResources")
setMaxResources()

```
- 这部分代码用于设置系统资源（如 CPU 核心数和内存限制）的最大值，以确保 MinIO 可以充分利用可用的硬件资源。

```go
// Verify kernel release and version.
if oldLinux() {
    logger.Info(color.RedBold("WARNING: Detected Linux kernel version older than 4.0.0 release, there are some known potential performance problems with this kernel version. MinIO recommends a minimum of 4.x.x linux kernel version for best performance"))
}

maxProcs := runtime.GOMAXPROCS(0)
cpuProcs := runtime.NumCPU()
if maxProcs < cpuProcs {
    logger.Info(color.RedBoldf("WARNING: Detected GOMAXPROCS(%d) < NumCPU(%d), please make sure to provide all PROCS to MinIO for optimal performance", maxProcs, cpuProcs))
}

```
- 这部分代码检查操作系统的内核版本和运行时的配置，然后输出警告消息，以便用户了解是否满足 MinIO 的最佳性能要求。

### 为什么把`go func`写到内部匿名？

将 `go func` 写在函数内部是一种组织代码和控制生命周期的有效方式，可以更好地维护和管理服务器的各个组件和任务。这有助于确保服务器的稳定性和可维护性：

1. **控制生命周期：** 这些 `go func` 控制了 MinIO 服务器的生命周期。它们会启动后台协程来执行各种任务，这些任务通常需要与服务器的其他部分进行交互。将它们放在函数内部使得这些任务与服务器的初始化和关闭过程紧密相关联。这样，在服务器关闭时，这些任务可以优雅地终止，而不会在主程序退出后继续运行。

2. **依赖注入：** 这些 `go func` 可能需要访问函数内的变量和配置，例如 `newObject`、`GlobalContext` 等。将它们放在函数内部允许它们轻松访问这些变量，而不需要在外部传递这些依赖。

3. **错误处理：** 在函数内部，可以更容易地处理任务的错误。如果这些任务在外部，错误处理可能会更加复杂，并且不容易与其他组件集成。

4. **并发控制：** 将 `go func` 放在函数内部使得可以更容易地控制并发。这些任务通常需要与其他任务协同工作，可能需要等待某些任务完成后再启动其他任务。将它们放在函数内部使得可以更容易地管理这种并发逻辑。

