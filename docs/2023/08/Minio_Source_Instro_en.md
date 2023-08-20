# [Go] MinIO Source Code Analysis (Part 1) - Entry Function, Bitrot Algorithm, Server Entry Points

MinIO is an open-source object storage server designed to deliver high-performance, high-availability distributed object storage solutions. It is a server compatible with Amazon S3 (Simple Storage Service) and can be used to build private cloud storage, public cloud storage, backup, archiving, and large-scale data storage applications. MinIO supports massive data storage, high-speed data transfer, and the storage and retrieval of object metadata.

The main features and use cases of MinIO include:

1. **Distributed Object Storage**: MinIO can scale horizontally, distributing data across multiple storage nodes to provide high performance and scalability.

2. **High Performance**: MinIO is designed to offer low-latency, high-throughput data transfer, suitable for applications that require fast reading and writing of large files.

3. **Open Source and Free**: MinIO is an open-source project, available for free use and modification as needed.

4. **S3 Compatibility**: MinIO supports Amazon S3's API, allowing you to access MinIO storage using existing S3 clients and tools while also being compatible with many S3 features.

5. **Data Protection and Redundancy**: MinIO supports distributed redundancy and data protection strategies to ensure data reliability and availability.

6. **Object Metadata**: MinIO can store and retrieve object metadata, enabling you to store any type of custom information on objects.

7. **Container and Cloud-Native**: MinIO is suitable for containerized environments and cloud-native architectures, easily integrating into platforms like Kubernetes.

8. **Backup and Archiving**: MinIO can be used for data backup, archiving, and long-term storage to meet various data management needs.

MinIO has a wide range of applications, from individual users using it for file backups and storage to enterprises using it to build large-scale distributed storage solutions. It can be used to store images, videos, log files, backup data, and various types of data. It is a powerful open-source object storage server suitable for building high-performance, scalable distributed storage solutions to meet various data management and storage requirements.

## Scope of the Introduction
1. Entry Function
   1. Unbuffered Channels
   2. Code Instruction Completion
      1. Trie Tree: Prefix Tree (Trie)
2. Bitrot Algorithm
3. Server Entry Points

## 1. Entry Function
- `cmd/main.go`: Entry point for the MinIO server.

```go
// Main main for the MinIO server.
func Main(args []string) {
	// Set the MinIO app name.
	appName := filepath.Base(args[0])

	if env.Get("_MINIO_DEBUG_NO_EXIT", "") != "" {
		freeze := func(_ int) {
			// Infinite blocking operation
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

This code segment is used to set the MinIO application's name and includes debugging and error handling logic. Let's break down the code line by line:

1. `appName := filepath.Base(args[0])`
   This line of code extracts the name of the executing program. It uses the `filepath.Base` function to retrieve the first argument from the `args` slice (which typically contains the path of the executable) and extracts the filename portion as `appName`.

2. `if env.Get("_MINIO_DEBUG_NO_EXIT", "") != "" {`
   This line begins a conditional statement that checks whether an environment variable named "_MINIO_DEBUG_NO_EXIT" exists and is not empty. If this environment variable exists and is not empty, the code block within it will be executed. This part of the code is typically used for debugging purposes.

3. `freeze := func(_ int) { ... }`
   Here, an anonymous function named `freeze` is defined. It accepts an integer parameter, but this parameter is not used within the function body. This function performs a permanent blocking operation by waiting on an unbuffered channel. This seems to be a way to pause or block program execution indefinitely.

4. `logger.ExitFunc = freeze`
   This line sets the `ExitFunc` field of the logger (`logger`) to the previously defined `freeze` function. This way, when the logger attempts to call the `os.Exit()` function, it actually executes the `freeze` function, causing the program to be permanently blocked.

5. `defer func() { ... }()`
   An anonymous function with deferred execution is defined here, which is used to perform some cleanup work after the function execution ends. First, it uses the `recover()` function to catch any potential panics. If a panic occurs, it prints the panic's error message and stack trace. Then, it calls the previously defined `freeze` function again, causing the program to be permanently blocked. Note that the argument value of `freeze(-1)` seems to be redundant, as the `freeze` function does not use the argument.

This code is designed to prevent the MinIO application from exiting normally in a specific debug mode, allowing for debugging and error investigation. When the "_MINIO_DEBUG_NO_EXIT" environment variable is set, the program will be permanently blocked, allowing you to observe the program's state and stack information for better understanding of issues. However, please note that this practice is not suitable for formal production environments, as it will prevent the application from terminating properly.

### 1. Unbuffered Channels
```go
// Infinite blocking operation
<-make(chan struct{})
```

Let's recap. In the Go programming language, a channel is a mechanism used for communication and synchronization between different goroutines. Channels can be buffered or unbuffered.

The characteristics of an unbuffered channel are as follows: a send operation will block until there is a receiver waiting, and a receive operation will block until there is a sender ready. This means that sending data on an unbuffered channel blocks the sender and receiver simultaneously until the other side is ready. As a result, unbuffered channels are also referred to as synchronous channels.

Here's an example to enhance your understanding:

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch := make(chan int) // Create an unbuffered channel

	go func() {
		fmt.Println("Sending data...")
		ch <- 42 // Send data to the channel
		fmt.Println("Data sent")
	}()

	time.Sleep(time.Second) // Wait for some time

	fmt.Println("Receiving data...")
	data := <-ch // Receive data from the channel
	fmt.Println("Data received:", data)
}
```

In the example above, the main function creates an unbuffered channel `ch`. Then, it launches a new goroutine that attempts to send the value 42 to the channel `ch`. Since the channel is unbuffered, this send operation will block until the main function is ready to receive the data.

After waiting for a certain period of time, the main function performs a receive operation `data := <-ch`, which allows the send operation to continue and send the data into the channel. Finally, the receive operation successfully receives the data.

**Unbuffered channels are particularly useful for ensuring data synchronization and communication, as they enforce both the sender and receiver to operate simultaneously, effectively avoiding race conditions.**

#### What Happens When a Channel Blocks?

When a channel blocks, it means that the channel's send or receive operation cannot be completed immediately and is stuck until certain conditions are met. Channel blocking can occur due to different scenarios, and I'll explain two common ones:

Blocking on Send Operation:
When sending data to a channel, if the channel is full (for buffered channels) or there are no receivers (for unbuffered channels), the send operation will block until one of the following conditions is met:
- For buffered channels, it waits until there is enough space to accommodate the data being sent.
- For unbuffered channels, it waits until there is a receiver ready to receive data from the channel.

Blocking on Receive Operation:
When receiving data from a channel, if the channel is empty (for buffered channels) or there are no senders (for unbuffered channels), the receive operation will block until one of the following conditions is met:
- For buffered channels, it waits until there is data available in the channel to be received.
- For unbuffered channels, it waits until there is a sender ready to send data to the channel.

**In the case of channel blocking, the goroutine (lightweight threads in Go) pauses its execution until it can proceed with the send or receive operation. This mechanism helps ensure data synchronization and coordination in concurrent programs.**

To avoid indefinite blocking and deadlocks, it's generally important to design and ensure that channel send and receive operations behave as expected. Using a select statement can help you choose between multiple channels and handle situations involving multiple channels to prevent blocking. 

### 2. Code Command Autocompletion

```go
func newApp(name string) *cli.App {
	// Collection of MinIO commands currently supported.
	commands := []cli.Command{}

	// Collection of MinIO commands currently supported in a trie tree.
	commandsTree := trie.NewTrie()

	// registerCommand registers a cli command.
	registerCommand := func(command cli.Command) {
		commands = append(commands, command)
		commandsTree.Insert(command

.Name)
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
	registerCommand(gatewayCmd) // Hidden, kept for guiding users.
    // ...

    // Rest of the function...
}
```

- The design here first starts the server and then registers it with the command line to ensure the server runs correctly without being affected by command line issues.
- `commandsTree := trie.NewTrie()` is used to create a prefix tree for storing command line instructions, enabling fast command autocompletion.

#### Trie Tree: Prefix Tree (Trie)

In the Go programming language, a "trie" (also known as a "prefix tree" or "dictionary tree") is a data structure used for storing and retrieving string data. It is a rooted tree structure where each node represents a character of a string, and strings are constructed by following paths from the root node. The primary advantage of a trie is its efficiency in performing string lookup and prefix matching operations.

In a trie tree, strings are broken down into sequences of characters, and they are inserted along the paths of the tree. Each node represents a character, and each path from the root to a leaf node represents a string. The tree's structure allows strings with the same prefix to share common nodes, saving storage space. Additionally, a trie tree allows for efficient prefix matching, finding all strings that start with a particular prefix.

In Go, you can build a trie tree using custom structures and pointers, or you can use existing libraries to handle trie tree operations on strings.

Creating a basic trie tree:

```go
type rune int32

type Node struct {
	exists bool
	value  string
	child  map[rune]*Node // runes as children
}

// newNode creates a new trie node.
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

// Root returns the root node.
func (t *Trie) Root() *Node {
	return t.root
}

// Insert inserts a key.
func (t *Trie) Insert(key string) {
	curNode := t.root
	for _, v := range key {
		if curNode.child[v] == nil {
			curNode.child[v] = newNode()
		}
		curNode = curNode.child[v]
	}

	if !curNode.exists {
		// Increment when a new rune child is added.
		t.size++
		curNode.exists = true
	}
	// The value is stored for retrieval in the future.
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

// Find nodes corresponding to the key.
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

// NewTrie creates a new trie.
func NewTrie() *Trie {
	return &Trie{
		root: newNode(),
		size: 0,
	}
}
```

When 'testing' is inserted, the data structure of the trie tree will look like this:

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

Each node represents a character, `exists` indicates whether it's the end of a string, `value` stores the string value, and `child` is a map where keys are runes of characters and values are pointers to child nodes.

The construction of the trie tree proceeds as follows:
1. The character 't' is inserted, creating a new node with `exists` set to false.
2. The character 'e' is inserted, creating a new node with `exists` set to false.
3. The character 's' is inserted, creating a new node with `exists` set to false.
4. The character 't' is inserted, creating a new node with `exists` set to true and `value` set to "testing".
5. The character 'i' is inserted, creating a new node with `exists` set to false.
6. The character 'n' is inserted, creating a new node with `exists` set to false.
7. The character 'g' is inserted, creating a new node with `exists` set to false.

The result is a trie tree where the string "testing" is inserted and marked as the end of a string. Other character sequences 't', 'e', 's', 't', 'i', 'n', 'g' are also inserted accordingly.

Please note that this trie tree only represents the insertion of a single string "testing" and does not include other possible inserted strings. In practice, a trie tree may contain multiple strings that share common prefix nodes.

#### Code Command Autocompletion
```go
closestCommands = append(closestCommands, commandsTree.PrefixMatch(command)...)
```

The meaning of this line of code is to add command names from the trie tree `commandsTree` that have the same prefix as the given command `command` to

 the `closestCommands` slice. This is used to find all command names in the trie tree that have the same prefix as the given command and add these command names to the `closestCommands` slice for further processing or display. This operation is very common in scenarios like auto-completion and command prompts.

Let me explain this line of code step by step:

- `closestCommands`: This is a slice used to store command names that have the same prefix as the given command.

- `commandsTree.PrefixMatch(command)`: This is a call to the `PrefixMatch` method of the trie tree `commandsTree`, which returns all command names that have the same prefix as the given command `command`. This return value is a slice.

- `...`: This is a syntax in Go used to unpack the elements of a slice as arguments to a function. Here, it's used to add the elements from the slice returned by the `PrefixMatch` method to the `closestCommands` slice.

## 2. Bitrot Algorithm: bitrot

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

In the registered commands, we can see the definition of `serverCmd`, which includes the `Action` field that specifies the `serverMain` function. This function serves as the execution function for the MinIO command.

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

Let's take `bitrotSelfTest` as a concrete example to explain:

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

`bitrotSelfTest` performs a self-test to ensure that bitrot algorithms correctly calculate checksums. If any algorithm produces an incorrect checksum, it results in a hard error.

The purpose of this function is to detect any issues in the bitrot implementation early on instead of silently corrupting data. Here's an explanation of this function:

1. `checksums` is a map that associates different bitrot algorithms with their expected checksums. These checksums are pre-computed and are used to verify the correctness of the bitrot algorithms.

2. Using a `for` loop, it iterates through all available bitrot algorithms, which are stored in `bitrotAlgorithms`. If an algorithm is not available, it continues to the next one.

3. For each algorithm, it retrieves the expected checksum from the `checksums` map and decodes it into binary data.

4. It creates a hash object (`hash`) for the current algorithm, along with empty byte slices `msg` and `sum`. `msg` is used to store the message for hashing, and `sum` is used to store the hash result.

5. It enters a loop that repeatedly applies the hash operation to the `msg`, appends the hash result to `msg`, and then resets the hash object. This simulates the process of repeatedly calculating the hash of a message and appending it to the message.

6. Finally, it compares the final `sum` with the expected checksum. If they are not equal, it means that the algorithm produced an incorrect result during the self-test, and it results in a fatal error.

```go
for i := 0; i < hash.Size()*hash.BlockSize(); i += hash.Size() {
        hash.Write(msg)
        sum = hash.Sum(sum[:0])
        msg = append(msg, sum...)
        hash.Reset()
}
```

This part of the code is used in the self-test of bitrot algorithms. Its purpose is to create a message block (`msg`) and then apply hash operations to it repeatedly. The computed hash values are appended to the message block, simulating the transmission of data blocks and the calculation of checksums for each block.

Let's break down how this part of the code works step by step:

1. `for i := 0; i < hash.Size()*hash.BlockSize(); i += hash.Size()`: This is a loop that is executed multiple times to perform hash calculations on the message block. The number of iterations is determined by `hash.Size()*hash.BlockSize()`, where `hash.Size()` returns the output size of the hash algorithm, and `hash.BlockSize()` returns the block size of the hash algorithm.

2. `hash.Write(msg)`: This line writes the current message block `msg` into the hash calculator `hash`. In the first iteration, this is an empty message block.

3. `sum = hash.Sum(sum[:0])`: This line calculates the hash value of the current message block and stores the result in the `sum` variable. The `hash.Sum([]byte)` method is used to calculate the hash value, and `sum[:0]` is used to create a new `sum` slice to receive the hash value.

4. `msg = append(msg, sum...)`: This line appends the computed hash value (`sum`) to the end of the message block (`msg`). This simulates the transmission of data blocks, where the checksum of each block is the hash value of the previous block.

5. `hash.Reset()`: This line resets the hash calculator `hash` so that it can continue calculating the hash value of a new data block in the next iteration.

**The purpose of this code section is to simulate the continuous transmission of data blocks, where the checksum of each data block is the hash value of the previous data block. This is done to test whether the bitrot algorithm can correctly calculate hash values and ensure that their calculations on different data blocks are predictable.**

In other words, this code continuously appends the hash value of the previous data block to the end of the current data block and then recalculates the hash value of the current data block. This process simulates the transmission of data blocks and hash calculations to ensure that the bitrot algorithm can correctly calculate and verify the hash values of data blocks. Since the goal of the bitrot algorithm is to detect bit errors in data blocks, this self-test ensures that the algorithm also works on continuously changing data blocks.

## 3. Introduction to the Server Entry Point

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

This function is the main entry point of the MinIO server. It handles the initialization and startup process of the server, primarily responsible for initializing the MinIO server and starting various services and goroutines so that the server can accept client requests and provide object storage services. Here are explanations of the main parts of the function:

1. **Signal Handling:** At the beginning of the function, it calls `signal.Notify` to capture operating system interrupt signals (`os.Interrupt`), termination signals (`syscall.SIGTERM`), and quit signals (`syscall.SIGQUIT`). These signals are used for gracefully shutting down the server.

2. **Start Signal Handling Goroutine:** It uses `go handleSignals()` to start a goroutine that handles captured signals. This goroutine listens for signals and executes the corresponding handling logic when a signal is received, such as shutting down the server.

3. **Set Default Profiler Rates:** It calls `setDefaultProfilerRates()` to set default rates for performance profiling, used for collecting server performance data.

4. **Initialize Global Console System:** It calls `NewConsoleLogger` to create the global console logging system `globalConsoleSys`, used for logging server messages, and adds it as a target for the logger.

5. **Perform Self-Tests:** It calls `bitrotSelfTest()`, `erasureSelfTest()`, and `compressSelfTest()` to perform self-tests for the server to ensure the correctness of various algorithms and functionalities.

6. **Process Server Environment Variables:** It processes server environment variables by calling `serverHandleEnvVars()`.

7. **Process Server Command-Line Arguments:** It processes server command-line arguments by calling `serverHandleCmdArgs(ctx)` with the provided `cli.Context`. These arguments are used for configuring the server.

8. **Initialize KMS Configuration:** It calls `handleKMSConfig()` to initialize the Key Management Service (KMS) configuration.

9. **Set Node Name:** It sets the node name by calling `globalConsoleSys.SetNodeName(globalLocalNodeName)`. This is done only in distributed settings.

10. **Initialize Help Information:** It calls `initHelp()` to initialize help information for user requests.

11. **Initialize All Subsystems:** It calls `initAllSubsystems(GlobalContext)` to initialize all subsystems of the server, such as event notifications, data scanning, etc.

12. **Check for Updates:** It starts a goroutine to check for updates of the MinIO server. This is done in a non-blocking manner.

13. **Configure the Server:** It calls `configureServerHandler` to configure the server's handlers, creating HTTP handlers based on server endpoints' configuration.

14. **Create HTTP Server:** It calls `xhttp.NewServer` to create an HTTP server, configures the server's listening address, TLS configuration, etc., and starts the HTTP server.

15. **Initialize Other Services:** It starts a series of goroutines to initialize other background services, such as data scanning, background replication, etc.

16. **Initialize Object Storage Layer:** It calls `newObjectLayer` to initialize the object storage layer, which is the core component of the MinIO storage system.

17. **Initialize Authentication and Authorization Systems:** It starts a goroutine to initialize user credentials, policies, and other authentication and authorization systems.

18. **Initialize Other Background Services:** It starts goroutines to initialize other background services, such as FTP server, SFTP server, etc.

19. **Wait for Operating System Signals:** It waits for operating system signals by using `<-globalOSSignalCh`, and once a signal is received, it triggers the server's shutdown.

### Chunked Introduction

```go
func serverMain(ctx *cli.Context) {
    // Notify globalOSSignalCh when the server receives termination signals.
    signal.Notify(globalOSSignalCh, os.Interrupt, syscall.SIGTERM, syscall.SIGQUIT)

    // Start a goroutine to handle signals.
    go handleSignals()

    // Set default performance profiling rates.
    setDefaultProfilerRates()

    // Initialize the global logging system.
    bootstrapTrace("newConsoleLogger")
    globalConsoleSys = NewConsoleLogger(GlobalContext)
    logger.AddSystemTarget(GlobalContext, globalConsoleSys)

    // Perform various self-tests.
    bootstrapTrace("selftests")
    bitrotSelfTest()
    erasureSelfTest()
    compressSelfTest()

    // Process all server environment variables.
    bootstrapTrace("serverHandleEnvVars")
    serverHandleEnvVars()

    // Process all server command-line arguments.
    bootstrapTrace("serverHandleCmdArgs")
    serverHandleCmdArgs(ctx)

    // Initialize KMS configuration.
    bootstrapTrace("handleKMSConfig")
    handleKMSConfig()

    // Set the node name, used only in distributed setups.
    bootstrapTrace("setNodeName")
    globalConsoleSys.SetNodeName(globalLocalNodeName)

    // Initialize all help information.
    bootstrapTrace("initHelp")
    initHelp()

    // Initialize all subsystems.
    bootstrapTrace("initAllSubsystems")
    initAllSubsystems(GlobalContext)
    // Other code...
}
```

- This function `serverMain` primarily serves as the startup logic for the MinIO server, including signal handling, log initialization, self-tests, environment variable processing, command-line argument processing, KMS configuration, node name setting, help information initialization, and subsystem initialization. These steps are part of the server's initialization process to ensure that the server starts correctly. Each step is explained with comments in the function.

```go
// Is distributed setup, error out if no certificates are found for HTTPS endpoints.
if globalIsDistErasure {
    if globalEndpoints.HTTPS() && !globalIsTLS {
        logger.Fatal(config.ErrNoCertsAndHTTPSEndpoints(nil), "Unable to start

 the server")
    }
    if !globalEndpoints.HTTPS() && globalIsTLS {
        logger.Fatal(config.ErrCertsAndHTTPEndpoints(nil), "Unable to start the server")
    }
}

```

- This code section checks whether it's a distributed setup. If it is, it checks for the presence of HTTPS certificates and reports an error if they are missing. This ensures that in a distributed setup, HTTPS must be configured with proper certificates.

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

- This code segment starts a goroutine to check for updates to the MinIO server. It periodically checks for the availability of new versions and displays notifications on the console if updates are available.

```go
// Set system resources to maximum.
bootstrapTrace("setMaxResources")
setMaxResources()

```
- This part of the code is used to set system resources such as CPU cores and memory limits to their maximum values, ensuring that MinIO can make the best use of available hardware resources.

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
- This part of the code checks the kernel version and runtime configuration of the operating system and provides warning messages. It informs the user whether the system meets MinIO's performance recommendations.

### Why use `go func` in an anonymous manner?

Using `go func` within a function is an effective way to organize code and control the lifecycle, making it easier to maintain and manage various components and tasks of the server. This helps ensure server stability and maintainability:

1. **Control of Lifecycle:** These `go func` statements control the lifecycle of the MinIO server. They start background goroutines to perform various tasks, often requiring interaction with other parts of the server. Placing them within the function tightly associates these tasks with the server's initialization and shutdown process. This ensures that these tasks gracefully terminate when the server is shut down, rather than continuing to run after the main program exits.

2. **Dependency Injection:** These `go func` statements may need access to variables and configurations within the function, such as `newObject`, `GlobalContext`, etc. Placing them within the function allows them to easily access these dependencies without requiring them to be passed externally.

3. **Error Handling:** Within the function, it's easier to handle errors generated by these tasks. If these tasks were outside the function, error handling might be more complex and less integrated with other components.

4. **Concurrency Control:** Placing `go func` within the function makes it easier to control concurrency. These tasks often need to work in coordination with other tasks and may require waiting for certain tasks to complete before starting others. Placing them within the function makes it easier to manage such concurrent logic.
