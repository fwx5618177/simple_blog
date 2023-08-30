# 【FFmpeg-Node】视频切片服务端设计

最近在设计一个基于 Node 的 视频切片设计。这里记录一下设计思路。

在我的考虑中，视频切片服务端的设计应该包含以下几个部分：

1. 视频切片
2. 视频转码
3. 视频存储
4. 视频分发

此处主要是介绍视频切片的设计。

## 视频切片

### 1. 什么是视频切片？

视频切片是将视频文件分割成多个小片段的过程。这些小片段可以是相同的大小，也可以是不同的大小。视频切片的目的是为了更好地管理视频文件，以便在不同的网络环境下更好地传输视频。

### 2. 为什么要切片？

当视频文件很大时，我们需要将其切片，以便在不同的网络环境下更好地传输视频。例如，如果您想在移动网络上观看视频，可能需要将视频切片为较小的片段。

### 3. 如何切片？

这是重点。

#### 3.1. 传统切片

传统的视频切片是将视频文件分割成多个小片段的过程。有多种办法，比如：

- **FFmpeg**: FFmpeg 是一个开源的视频切片工具，可以将视频文件切片为多个小片段。
- **MediaLive**: MediaLive 是一个亚马逊的视频切片工具，可以将视频文件切片为多个小片段。
- **其他**: 还有其他的视频切片工具，比如 Wowza、Akamai 等等。
- **自定义**: 如果想自定义视频切片工具，可以使用 Node.js 或其他语言编写自己的视频切片工具。

切片也分很多种类型，比如：

- **HLS**: 使用 .m3u8 作为播放列表文件格式和 .ts (MPEG Transport Stream) 作为媒体片段格式。通常基于固定的时间间隔进行切片。
- **DASH**: 使用 .mpd (Media Presentation Description) 作为描述文件和 .m4s (基于 ISO 基础媒体文件格式) 作为媒体片段格式。允许更加灵活的切片策略，可以基于场景变化进行切片，这有助于减少码率切换时的可视性中断。
- **其他**: 还有其他的视频切片格式，比如 Smooth Streaming、HDS 等等。

#### 3.2. HLS 切片

我们此处主要介绍 HLS 切片。

我的思路是使用 FFmpeg 将视频切片为 HLS 格式，然后使用 Node.js 作为服务端，将切片后的视频文件存储到云存储中，然后使用 CDN 分发视频文件。

此处我们着重如何使用 FFmpeg 将视频切片为 HLS 格式。

但是在使用 HLS 之前，我们需要了解一点关于 m3u8 的知识。

```bash
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:11
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-KEY:METHOD=AES-128,URI="http://localhost:8000/key_info",IV=0xe95dde1420125aea3ec1f3a4c5d07c53
#EXTINF:10.541667,
list0.ts
#EXTINF:4.500000,
list1.ts
#EXT-X-ENDLIST
```

m3u8 文件是一个文本文件，它包含了视频切片的信息，比如切片的时长、切片的地址等等。如果我们要进行切片的加密，需要在 m3u8 文件中添加加密的信息，比如加密的方法、加密的地址等等。而对应的加密的地址，我们需要在 m3u8 文件中添加对应的 key_info 文件的地址或者可以获取数据的 URI 链接。

针对这个，首先我们要去考虑构造 key_info 文件。那么 key_info 文件是什么呢？

举个例子:

```bash
http://localhost:8000/key_info
video-service/test/conf/hls.key
442fc06f28ffc5648d3ed7f2ebcd7bcf
```

- 第一行是密钥文件的 URL。当客户端请求 HLS 流时，它会使用此 URL 来获取加密密钥。当客户端播放 HLS 列表时，它会看到这个 URL 并从这个 URL 下载密钥来解密流。
- 第二行是加密密钥文件的本地路径。FFmpeg 需要直接访问它来进行加密操作。它指向一个文件，该文件应包含 16 字节的数据，代表 AES-128 加密所需的密钥
- 如果版本支持第三行，则第三行是加密的 key 文件的 16 进制字符串

hls.key 文件的内容是一个 16 字节的随机字符串，用于加密视频切片。这个内容和第三行是一样的。

```bash
442fc06f28ffc5648d3ed7f2ebcd7bcf
```

如何生成这两个文件呢？

```typescript
// 生成加密密钥
    public static generateEncryptionKey(): string {
        return crypto.randomBytes(16).toString('hex') // 生成16字节的加密密钥
    }

    // 生成加密密钥文件 key_info
    public static generateEncryptionKeyFile(url: string, localPath: string, iv: string, output = './key_info'): void {
        // check if the file exists
        if (fs.existsSync(output)) {
            fs.unlinkSync(output)
        }

        const keyInfo = `${url}\n${localPath}\n${iv}`

        fs.writeFileSync(output, keyInfo, 'utf-8')
    }

    // 生成动态的hls.key文件
    public static generateHLSKeyFile(key: string, output = './hls.key'): void {
        // check if the file exists

        if (fs.existsSync(output)) {
            fs.unlinkSync(output)
        }

        fs.writeFileSync(output, key, 'utf-8')
    }
```

我们可以使用上面的代码生成 key_info 文件和 hls.key 文件。现在我们来看一下如何使用 FFmpeg 将视频切片为 HLS 格式。

以下是代码：

```typescript
public static async generateM3U8List(inputPath: string, output = 'test/m3u8/list.m3u8', keyInfo = 'test/conf/key_info'): Promise<string> {
    return new Promise((resolve, reject) => {
        // 使用 fluent-ffmpeg 创建 FFmpeg 命令
        const command = ffmpeg(inputPath)
            .addOption('-hls_time', '10') // 指定HLS切片的时长
            .addOption('-hls_list_size', '0') // 生成.m3u8文件
            .addOption('-c:v', 'libx264') // 使用H.264编码
            .addOption('-c:a', 'aac') // 使用AAC音频编码
            .addOption('-f', 'hls') // 输出格式为HLS
            .addOption('-hls_key_info_file', keyInfo) // 加载密钥信息文件
            .output(output) // 输出.m3u8文件

        // FFmpeg命令
        command
            .on('stderr', info => {
                console.log('开始处理', info)
            })
            .on('end', () => {
                console.log('处理完成')
                resolve('ok')
            })
            .on('error', err => {
                console.error('处理失败:', err)
                reject(err)
            })
            .run()
    })
}
```

此时将会生成一个 m3u8 文件，以及一系列的 ts 文件。

如果我们不想要文件，而是想要直接将视频切片为 HLS 格式的视频流，该怎么办？

视频流比生成文件方便快捷一些，可以节省 IO 的时间。但是需要注意的是，如果我们使用视频流的话，我们需要将视频流转发到客户端，这样客户端才能播放视频。

```typescript

    /**
     * 输出流式数据
     * @param inputPath
     * @param keyInfo
     * @returns
     */
    public static async streamingData(inputPath: string, keyInfo = 'test/conf/key_info'): Promise<Readable> {
        const streamReadable = new Readable({
            read() {},
        })
        const passThrough = new PassThrough()
        const command = ffmpeg(inputPath)
            .addOption('-hls_time', '10') // 指定HLS切片的时长
            .addOption('-hls_list_size', '0') // 生成.m3u8文件
            .addOption('-c:v', 'libx264') // 使用H.264编码
            .addOption('-c:a', 'aac') // 使用AAC音频编码
            .addOption('-f', 'hls') // 输出格式为HLS
            .addOption('-hls_key_info_file', keyInfo) // 加载密钥信息文件
            .pipe(passThrough, {
                end: true,
            }) // 使用 pipe 而不是写入文件

        // FFmpeg命令
        command.on('stderr', info => {
            console.log('Stream 处理:', info)
        })

        passThrough
            .on('data', chunk => {
                console.log('Received chunk of size:', chunk.length)
                streamReadable.push(chunk)
            })
            .on('end', () => {
                console.log('Stream 处理完成')
                streamReadable.push(null)
            })
            .on('error', err => {
                console.error('Stream 处理失败:', err)
                streamReadable.destroy(err)
            })

        return streamReadable
    }
```

此处的代码是将视频切片为 HLS 格式的视频流，然后将视频流转发到客户端。而我们使用了 PassThrough 流来接收视频流，然后将视频流转发到 Readable 流中。

- 使用 PassThrough 流是为了更好地控制流的传输和处理
- 使用 stream.Readable 类直接创建流，并将数据推送到此流。这样，你可以直接监听数据事件，并在数据到达时处理数据。

当我们在外部调用这个函数的时候，只能同时运行才能监听到数据事件，否则会报错。针对这个我们写个 test case 来测试一下。

```typescript
it("should return a stream", (done) => {
  // 创建一个模拟的 videoSlice 数据
  const videoSlice = path.join(__dirname, "w.mp4");

  const keyInfo = path.join(__dirname, "../test/conf", "key_info");
  const hlsKey = path.join(__dirname, "../test/conf", "hls.key");

  try {
    // 生成密钥
    const encryptController = new EncryptionController();
    // 生成文件
    encryptController.generateEncryptionKeyFile({
      remoteURI: "http://localhost:8000/key_info",
      keyInfoPath: keyInfo,
      hlsKeyPath: hlsKey,
      iv: encryptController.getIv,
    });

    console.log(chalkLog("Start to call streamingData...."));

    // 获取stream流
    FFmpegService.streamingData(videoSlice, keyInfo).then((stream) => {
      expect(stream).to.be.an("object");

      stream
        .on("data", (chunk) => {
          const dataString = chunk.toString();

          if (dataString.includes("#EXT-X-KEY")) {
            expect(dataString).to.include("METHOD=AES-128");
          }

          expect(chunk.length).to.be.greaterThan(0);
        })
        .on("end", () => {
          done();
        })
        .on("error", (err) => {
          done(err);
        });
    });
  } catch (error) {
    console.error(chalkError(error));
  }
});
```

当切片结束时，我们的收听也会同时结束。

## 扩展

对于多个用户的访问，选择在每次请求时切视频还是预先切好视频取决于多种因素，例如内容的流行度、资源的可用性、延迟要求等。如果我们设计每次请求时切视频 或者 预先切好视频，这两种策略各有优缺点：

### 1. **每次请求时切视频**:

#### 优点:

- **实时性**: 对于直播或实时事件，您必须实时进行视频切片。
- **动态配置**: 可以根据用户的需求或设备能力进行特定的转码或切片。

#### 缺点:

- **高资源消耗**: 对于热门内容，可能会有大量的冗余计算。每个用户请求都需要使用转码资源。
- **延迟**: 用户可能会遇到更长的缓冲时间，因为视频需要实时处理。

### 2. **预先切好视频**:

#### 优点:

- **快速响应**: 视频已经准备好，可以直接为用户提供，减少了加载时间。
- **资源效率**: 对于流行或常被请求的内容，预先处理可以确保资源只被使用一次。
- **预测性**: 由于所有的处理都是预先完成的，所以可以更好地预测和管理资源使用。

#### 缺点:

- **存储**: 保存多种格式和分辨率的视频可能需要更多的存储空间。
- **可能的资源浪费**: 如果某些内容很少被请求，预处理可能会浪费计算资源。

### 建议:

- 对于**流行的、常被访问的内容**（例如热门电影或节目），预先切片是更好的选择。这可以减少计算资源的使用，并为用户提供快速的响应。
- 对于**长尾内容**（即那些偶尔被访问的内容）或**实时内容**，可以考虑按需切片或转码。

- 使用**混合策略**也是一个好选择。例如，预先处理流行内容，而对于不太流行或实时内容，则按需处理。

许多现代的流媒体解决方案都支持“**热切片**”，这意味着它们会按需切片，但一旦切片完成，切片的内容就会被缓存一段时间，这样后续的请求可以直接从缓存中提取，而不需要重新切片。

## 热切片

“热切片”（或称为“on-the-fly packaging”）在许多现代流媒体解决方案中是一种受欢迎的策略。它结合了预先切片和按需切片的优点，旨在为用户提供最佳的流体体验，同时优化资源使用。

### 热切片的工作原理：

1. **首次请求**: 当内容第一次被请求时，内容不是预先切片的。在这种情况下，流媒体服务器会开始按需进行切片和封装。

2. **缓存**: 一旦一个切片被创建，它被存储在一个缓存中，以备后续请求使用。

3. **后续请求**: 如果其他用户请求同一内容和切片，服务器不再重新进行切片操作，而是直接从缓存中提供切片。

4. **过期和更新**: 为了防止缓存膨胀，旧的或很少使用的切片可能会从缓存中移除。对于实时或直播内容，新的切片会持续添加到缓存中，而旧的切片则会被移除。

### 热切片的设计和实施：

1. **转码和切片**: 使用如 FFmpeg、MediaLive 或其他转码解决方案将原始内容转码为所需的编解码器和分辨率。这些内容可以按需切片或预先切片。

2. **缓存策略**: 选择适当的缓存策略和过期时间是关键。例如，您可能想要为热门内容使用更长的缓存时间。

3. **缓存无效**: 对于直播或有大量内容更新的场景，需要一个有效的缓存无效策略，以确保用户始终获得最新的内容。

4. **分发**: 使用内容分发网络（CDN）可以进一步提高热切片的效率，因为 CDN 的边缘位置会缓存内容，为用户提供更快的响应时间。

5. **监控和日志**: 通过监控和日志可以了解哪些内容最受欢迎、何时需要更多的资源以及缓存效率如何。

6. **容错和冗余**: 如果一部分系统或缓存出现故障，确保有策略可以从其他地方提取或生成切片。

### 主流的使用：

很多流媒体服务商，如 AWS Media Services、Akamai 或 Wowza，都提供了热切片的能力。大型 OTT（Over-the-Top）提供商，如 Netflix、YouTube 或 Hulu，也使用类似的策略来为全球数亿用户提供内容。对于这些公司，热切片和其他高级优化策略是确保用户满意度和资源有效利用的关键。
