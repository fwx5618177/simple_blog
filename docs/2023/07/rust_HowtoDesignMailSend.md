# [Rust]-如何设计 Mail Send 的基础库

最近在 Rust 的学习过程中，看到一个蛮有意思的项目: [mail-send](https://github.com/stalwartlabs/mail-send)。

该项目是从零手写的一个邮件发送库，支持 SMTP 协议，支持 DKIM 签名，支持 TLS 加密，支持多种认证方式，支持异步等等。

具体介绍和使用不再赘述，可以去看看官方的资料: [ReadMe](https://github.com/stalwartlabs/mail-send)。

[TOC]

## 梗概

1. Mail-send 的设计思路
2. 邮件发送的底层基础知识
   1. EHLO, LHLO
   2. 交流流程
   3. BDAT, DAT
   4. REST

## 1. Mail-send 的设计思路

当我们要去设计一套邮件的收发系统时，我们需要考虑的因素有很多，比如:

1. 邮件的收发协议
2. 邮件的认证方式
3. 邮件的加密方式
   ...

当然，考虑的地方有很多。如果一上来就需要面面俱到，那么可能会让人望而生畏。所以，我们可以先从最简单的开始，一步一步的去完善。

1. 一切开始前，我们要完成的是邮件的发送、接收功能，因此一定要有发送邮件的能力，不关注协议，我们就增加一个`send`方法，这个方法的参数是一个`Message`，返回值是一个`Result`，这个`Result`里面包含了发送的结果。

2. 我们要和 SMTP 服务器进行交互，那么我们就需要一个`SmtpClient`，这个`SmtpClient`需要知道 SMTP 服务器的地址和端口，还需要知道认证方式，加密方式等等。

考虑上面的设计，我们就需要 2 个文件:

- `message.rs`
- `client.rs`

在此之外，我们需要考虑其他的因素，比如:

1. 连接服务器后, 如何鉴定身份? (认证方式), 我们需要增加一个`auth.rs`
2. 在连接后，文件的内容如何传输?我们需要增加一个`envelope.rs`，针对信息作一定处理，然后再发送。
3. 只是单纯由这些还不够。我们需要处理邮件的建立、断开，对格式的处理和识别，我们需要增加一个`ehlo.rs`。
4. 如果我们要复用和直接使用连接和认证，则需要增加一个工厂的模式，我们需要增加一个`builder.rs`。

Extra:

1. 如果对加密要求更高的话，我们需要增加一个`tls.rs`。
2. 如果要自定义处理错误的话，我们需要增加一个`error.rs`。
3. 如果要判定收发是否成功的话，我们需要增加一个`mod.rs`。

有了以上的设计后，我们开始对上面的文件进行一个总结:

1. 基础的库: `message.rs, envelope.rs, client.rs, ehlo.rs, tls.rs, auth.rs`
2. 上层的库: `mod.rs, builder.rs, error.rs`

那我们能不能再进一步优化：

当我们使用基础库后，能否把这个流程封装起来，让用户只需要关注发送邮件的内容，而不需要关注流程的构建呢？

`error.rs`, `builder.rs`和`mod.rs`是不是可以合并呢？

答案是没有那么简单。

- `error.rs, mod.rs`可以合并，在处理邮件的时候，我们可以判断是否发、收成功，如果不成功，我们可以返回一个错误，这个错误可以是一个`enum`，里面包含了所有的自定义错误类型。因此，我们融合为: `lib.rs`
- `build.rs`更像是对基础库的合并封装，因此他不适合和上面两个合并，而应该继续独立出来。

顺此，我们此时的目录结构是:

```bash
.
├── lib.rs
└── smtp
    ├── auth.rs
    ├── builder.rs
    ├── client.rs
    ├── ehlo.rs
    ├── envelope.rs
    ├── message.rs
    ├── mod.rs
    └── tls.rs

1 directory, 9 files
```

## 2. 邮件发送的底层基础知识

### 协议: SMTP、DKIM

DKIM（DomainKeys Identified Mail）是一种用于电子邮件认证的协议，它旨在确保发件人身份的合法性和防止电子邮件的伪造。通过 DKIM，发件人可以对发送的邮件进行数字签名，接收方可以验证该签名以确定邮件是否来自合法的发件人，并且是否在传输过程中被篡改。

SMTP（Simple Mail Transfer Protocol）是用于在网络上发送和接收电子邮件的协议。它是电子邮件系统中用于传输邮件的标准协议。SMTP 负责将邮件从发件人的邮件服务器发送到接收人的邮件服务器。

DKIM 和 SMTP 是两个独立的协议，但它们可以结合使用以提高电子邮件的安全性和可信度。当发件人发送一封邮件时，它可以在邮件的头部添加 DKIM 签名，然后使用 SMTP 协议将邮件发送到接收人的邮件服务器。接收人的邮件服务器在接收到邮件后，可以使用 DKIM 公钥来验证邮件的签名，从而确认邮件是否来自合法的发件人。

通过结合使用 DKIM 和 SMTP，电子邮件系统可以更好地防止垃圾邮件和电子邮件伪造，并提高邮件传递的可靠性和安全性。

### EHLO, LHLO

在邮件系统中，EHLO（Extended Hello）和 LHLO（Long Hello）是客户端与邮件服务器进行通信时使用的命令。它们用于在建立连接后，客户端向邮件服务器发送一条问候信息，并请求服务器返回支持的邮件扩展和功能。

1. EHLO（Extended Hello）：EHLO 命令是扩展的问候命令，它向邮件服务器发送一个 EHLO 字符串，后跟客户端的域名或 IP 地址。邮件服务器在接收到 EHLO 命令后，会返回一条带有支持的扩展和功能信息的响应。EHLO 命令是标准的 SMTP 协议命令，用于与支持扩展的邮件服务器进行通信。

2. LHLO（Long Hello）：LHLO 命令是与 EHLO 类似的扩展问候命令，它向邮件服务器发送一个 LHLO 字符串，后跟客户端的域名或 IP 地址。与 EHLO 不同的是，LHLO 是一个非标准的扩展命令，通常用于与不完全支持 EHLO 的邮件服务器进行通信。

EHLO 和 LHLO 命令的响应会包含一系列的扩展项，这些扩展项描述了服务器支持的功能，例如支持的身份验证方式、加密选项、邮件大小限制等等。客户端在收到服务器的响应后，根据服务器的支持情况来决定是否使用某些扩展功能，以及如何进行后续的邮件传输操作。通过 EHLO 和 LHLO 命令，客户端和邮件服务器能够在连接建立时进行协商，从而提高邮件传输的效率和安全性。

### 服务器收到 EHLO, LHLO 后的响应

当服务器收到 EHLO 或 LHLO 命令后，会返回一条带有支持的扩展和功能信息的响应。这个响应通常是一个多行的文本消息，每行包含一个扩展项或功能信息。

例如，服务器可能返回类似以下的响应：

```bash
250-mail.example.com Hello [192.168.1.100]
250-SIZE 52428800
250-AUTH PLAIN LOGIN
250-STARTTLS
250-ENHANCEDSTATUSCODES
250-8BITMIME
250-DSN
250-SMTPUTF8
250 CHUNKING
```

在这个响应中，以 `250` 开头的行表示操作成功。然后，每个以 `250-` 开头的行都表示一个支持的扩展项或功能，如：

- `SIZE 52428800`：表示服务器支持最大邮件大小为 52,428,800 字节。
- `AUTH PLAIN LOGIN`：表示服务器支持 PLAIN 和 LOGIN 两种身份验证方式。
- `STARTTLS`：表示服务器支持加密通信，可以通过 STARTTLS 命令启用。

客户端根据服务器返回的扩展项和功能信息，来判断服务器的能力，并相应地决定是否使用某些扩展功能或进行后续的操作。这种机制让客户端和服务器能够在建立连接时进行协商，以便在邮件传输过程中使用最合适的设置和功能。

### 简单的实际传输邮件内容的例子和过程

1. 客户端连接到邮件服务器：

```bash
S: 220 mail.example.com ESMTP Postfix
C: EHLO example.com
```

2. 服务器回复 EHLO 命令，并列出支持的扩展：

```bash
S: 250-mail.example.com Hello [192.168.1.100]
S: 250-SIZE 52428800
S: 250-AUTH PLAIN LOGIN
S: 250-STARTTLS
S: 250-ENHANCEDSTATUSCODES
S: 250-8BITMIME
S: 250-DSN
S: 250-SMTPUTF8
S: 250 CHUNKING
C: STARTTLS
```

3. 客户端发送 STARTTLS 命令，请求开始加密通信：

```bash
S: 220 2.0.0 Ready to start TLS
C: EHLO example.com
```

4. 服务器回复 EHLO 命令，确认已经启用加密通信：

```bash
S: 250-mail.example.com Hello [192.168.1.100]
S: 250-SIZE 52428800
S: 250-AUTH PLAIN LOGIN
S: 250-AUTH=PLAIN LOGIN
S: 250-ENHANCEDSTATUSCODES
S: 250-8BITMIME
S: 250-DSN
S: 250-SMTPUTF8
S: 250 CHUNKING
C: AUTH LOGIN
```

5. 客户端发送 AUTH LOGIN 命令，请求登录：

```bash
S: 334 VXNlcm5hbWU6
C: dXNlcm5hbWU=
S: 334 UGFzc3dvcmQ6
C: cGFzc3dvcmQ=
```

6. 服务器回复两次 334 挑战，分别请求用户名和密码的 Base64 编码。客户端发送经过 Base64 编码的用户名和密码。

7. 服务器回复认证成功：

```bash
S: 235 2.7.0 Authentication successful
C: MAIL FROM:<sender@example.com>
```

8. 客户端发送 MAIL FROM 命令，指定发件人：

```bash
S: 250 2.1.0 Ok
C: RCPT TO:<recipient@example.com>
```

9. 客户端发送 RCPT TO 命令，指定收件人：

```bash
S: 250 2.1.5 Ok
C: DATA
```

10. 客户端发送 DATA 命令，开始发送邮件内容：

```bash
S: 354 End data with <CR><LF>.<CR><LF>
C: From: sender@example.com
C: To: recipient@example.com
C: Subject: Test Email
C:
C: This is the body of the email.
C: .
```

11. 客户端发送邮件内容，并在结束时发送单独的一行 "." 表示邮件内容结束。

12. 服务器回复邮件发送成功：

```bash
S: 250 2.0.0 Ok: queued as ABCDEFGHIJKLMNOP
C: QUIT
```

13. 客户端发送 QUIT 命令，结束会话：

```bash
S: 221 2.0.0 Bye
```

以上是一个简单的 SMTP 邮件发送过程的示例。实际的邮件发送可能会涉及更多的步骤和扩展，但基本的过程是类似的。

### BDAT 和 DAT

BDAT（Binary Data）和 DAT（Data）是 SMTP（Simple Mail Transfer Protocol）中用于传输二进制数据的两种命令。

1. BDAT：BDAT 命令用于传输二进制数据块。它允许在单个消息中传输大型二进制数据，如图片、音频、视频等。BDAT 命令的语法如下：

```
BDAT <data size> [<data>]
```

其中 `<data size>` 是数据块的大小（以字节为单位），`<data>` 是数据块的内容。BDAT 命令通常与 CHUNKING 扩展一起使用，以支持将大型消息分成多个数据块进行传输。

2. DAT：DAT 命令用于传输普通文本数据。它类似于 BDAT 命令，但用于传输纯文本数据，而不是二进制数据。DAT 命令的语法如下：

```
DAT <data>
```

其中 `<data>` 是文本数据的内容。

总体来说，BDAT 和 DAT 命令都是用于在 SMTP 会话中传输数据的命令，区别在于 BDAT 用于传输二进制数据块，而 DAT 用于传输普通文本数据。它们的使用取决于具体的应用场景和需要传输的数据类型。

### RESET

在 SMTP（Simple Mail Transfer Protocol）中，RSET（Reset）是一种命令，用于重置当前会话的状态。它允许客户端在发送邮件的过程中取消之前的命令和数据，并将 SMTP 会话状态恢复到初始状态。

RSET 命令的使用场景包括但不限于以下情况：

1. 当客户端在发送邮件的过程中需要中止操作，可以使用 RSET 命令重置会话，取消之前的操作，重新开始新的操作。
2. 在一次邮件传输过程中，如果客户端发送了一些不完整或错误的命令或数据，可以使用 RSET 命令来清除这些不完整或错误的状态，然后重新发送正确的命令和数据。

RSET 命令的语法为：

```
RSET
```

当服务器接收到 RSET 命令时，它会清除任何未完成的邮件事务，并将 SMTP 会话状态重置为初始状态，以便客户端可以重新开始新的操作或传输邮件。
