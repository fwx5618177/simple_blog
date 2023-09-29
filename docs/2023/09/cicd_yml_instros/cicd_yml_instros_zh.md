# 阅读源码过程中对 Github 中 CI/CD 的 YML 的总结

梗概:

1. 测试的覆盖率
2. 漏洞检查
3. 新旧版本兼容检测
   1. 数据竞争检查的 Go 测试
4. CodeQL 代码扫描
5. Docker 的构建、测试、代码覆盖率收集和发布 hub 操作
6. 矩阵排除、多个操作系统上进行构建和测试，并在成功后收集代码覆盖率数据、发布到 GitHub Releases
7. 发布到 NPM, 更新 package.json, 创建 release 代码, 发送邮件, 发送 slack

## 1. 测试的覆盖率

`.travis.yml` 文件中的配置如下:

```yml
language: go

go:
  - "1.12"
  - tip

notifications:
  email: false

env:
  global:
    # Coveralls.io token.
    - secure: ""

install:
  - go get -t ./...

before_script:
  - wget https://github.com/mewmew/ci/raw/master/get_tools.sh
  - chmod +x get_tools.sh
  - ./get_tools.sh
  - wget https://github.com/mewmew/ci/raw/master/ci_checks.sh
  - chmod +x ci_checks.sh

script:
  - ./ci_checks.sh
```

## 2. 漏洞检查

`govulncheck.yml` 文件中的配置如下:

```yml
name: "govulncheck"

on:
  push:
    branches: ["master", "next"]
  pull_request:
    # The branches below must be a subset of the branches above
    branches: ["master", "next"]
  schedule:
    - cron: "29 21 * * 6"

jobs:
  govulncheck:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v3
        with:
          go-version: ">=1.19.2"
          check-latest: true
      - name: install govulncheck
        run: go install golang.org/x/vuln/cmd/govulncheck@latest
      - name: run govulncheck
        run: govulncheck ./...
```

## 3. 新旧版本兼容检测

`gotests.yml` 文件中的配置如下:

```yml
name: "gotests"

on:
  push:
    branches: ["master", "next"]
  pull_request:
    # The branches below must be a subset of the branches above
    branches: ["master", "next"]
  schedule:
    - cron: "29 21 * * 6"

jobs:
  oldest_supported:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v3
        with:
          go-version-file: "go.mod"
      - name: normal tests
        run: go test ./...
      - name: race tests
        run: go test -race ./...

  latest:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v3
        with:
          go-version: "1.x"
          check-latest: true
      - name: normal tests
        run: go test ./...
      - name: race tests
        run: go test -race ./...
```

### 数据竞争检查的 Go 测试

执行带有数据竞争检查的 Go 测试是指在运行 Go 语言的测试时，开启 Go 的数据竞争检测器来查找程序中的数据竞争问题。

数据竞争（race condition）是多个并发执行的线程或进程在不适当的同步下访问共享数据时发生的一种问题。如果至少有一个线程或进程写入数据，而其他线程或进程可能读写，那么就存在数据竞争的风险。在数据竞争的存在下，程序的输出可能会依赖于线程或进程的执行顺序，这通常是不可预测和不确定的，导致程序行为不稳定或错误。

Go 提供了一个内置的数据竞争检测器，可以在测试和构建时使用。要在测试时启用数据竞争检测器，你只需添加 `-race` 标志，如下所示：

```bash
go test -race ./...
```

当数据竞争检测器检测到数据竞争时，它会打印关于竞争的详细信息，并使测试失败。这可以帮助开发者识别和修复代码中的并发问题。

需要注意的是，启用 `-race` 标志会使程序运行得慢一些，并使用更多的内存，因为它在运行时进行额外的检查。因此，一般建议仅在测试或特定的调试场景中使用数据竞争检测器，而不是在生产环境中使用。

### 来源

Go 的数据竞争检测器（race detector）是基于一个名为 "ThreadSanitizer" （简称 "tsan"）的工具构建的。ThreadSanitizer 是一个由 Google 为 C++和 Go 开发的数据竞争检测器，是一个强大的工具，可以帮助开发者发现并修复并发程序中的竞争条件。然而，它并不是万能的。例如，它不能检测到所有的并发错误，如死锁或活锁。但是，对于数据竞争，它是一个非常有效的工具。让我们深入了解其设计和工作原理：

1. **动态分析**:

   - Go 的数据竞争检测器是一个动态分析工具，意味着它在程序运行时检测数据竞争，而不是在编译或静态分析时。

2. **Happens-before 关系**:

   - 检测器的核心思想是跟踪程序中的"happens-before"关系并使用这些信息来确定两个操作之间是否存在数据竞争。
   - 例如，当一个 goroutine 释放一个互斥锁并且另一个 goroutine 稍后获取该互斥锁时，释放操作发生在获取操作之前。

3. **Shadow Memory**:

   - 检测器使用一个称为"shadow memory"的结构来跟踪每个内存位置的访问信息。对于程序中的每个字节，都有一个对应的 shadow memory，用于存储最近两次对该字节的访问（例如，goroutine ID、访问类型、操作堆栈等）。

4. **内存读取和写入检测**:

   - 当程序进行内存读取或写入时，检测器会检查 shadow memory 中的信息以确定是否存在数据竞争。

5. **性能考虑**:

   - 尽管数据竞争检测引入了一些运行时开销，但 ThreadSanitizer 和 Go 的实现被高度优化，以尽量减少这种开销。
   - 但是，开启数据竞争检测仍然会使程序运行得慢一些，并使用更多的内存。

6. **报告**:

   - 当检测到数据竞争时，检测器会提供详细的报告，包括导致竞争的操作、涉及的 goroutines 以及堆栈跟踪。

7. **编译和链接**:
   - 要使用数据竞争检测器，Go 程序必须使用特定的编译和链接标志（例如，`-race`）。

## 4. CodeQL 代码扫描

`codeql-analysis.yml` 文件中的配置如下:

```yml
name: "CodeQL"

on:
  push:
    branches: ["master", "next"]
  pull_request:
    # The branches below must be a subset of the branches above
    branches: ["master", "next"]
  schedule:
    - cron: "29 21 * * 6"

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ["go", "python"]
        # CodeQL supports [ 'cpp', 'csharp', 'go', 'java', 'javascript', 'python', 'ruby' ]
        # Learn more about CodeQL language support at https://aka.ms/codeql-docs/language-support

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      # Initializes the CodeQL tools for scanning.
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}
          # If you wish to specify custom queries, you can do so here or in a config file.
          # By default, queries listed here will override any specified in a config file.
          # Prefix the list here with "+" to use these queries and those in the config file.

          # Details on CodeQL's query packs refer to : https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning#using-queries-in-ql-packs
          # queries: security-extended,security-and-quality

      # Autobuild attempts to build any compiled languages  (C/C++, C#, or Java).
      # If this step fails, then you should remove it and run the build manually (see below)
      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      # ℹ️ Command-line programs to run using the OS shell.
      # 📚 See https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsrun

      #   If the Autobuild fails above, remove it and uncomment the following three lines.
      #   modify them (or add more) to build your code if your project, please refer to the EXAMPLE below for guidance.

      # - run: |
      #   echo "Run, Build Application using script"
      #   ./location_of_script_within_repo/buildscript.sh

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

## 5. Docker 的构建、测试、代码覆盖率收集和发布 hub 操作

`docker.yml` 文件中的配置如下:

```yml
name: "docker"

on:
  push:
    branches: ["master", "next"]
  pull_request:
    # The branches below must be a subset of the branches above
    branches: ["master", "next"]
  schedule:
    - cron: "29 21 * * 6"

env:
  HAS_DOCKER: ${{ secrets.DOCKER_REGISTRY_USER != '' }}
  HAS_GITLAB: ${{ secrets.GITLAB_REGISTRY_USER != '' }}

jobs:
  integration:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      - name: Docker info (for debugging)
        run: docker info
      - name: Build test image
        run: docker build -t chasquid-test -f test/Dockerfile .
      - name: Run tests
        run: docker run --name test1 chasquid-test  make test

  coverage:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v3
        with:
          go-version: ">=1.20"
      - name: Install goveralls
        run: go install github.com/mattn/goveralls@latest
      - name: Docker info (for debugging)
        run: docker info
      - name: Build test image
        run: docker build -t chasquid-test -f test/Dockerfile .
      - name: Run coverage tests
        run: docker run --name test1 chasquid-test  test/cover.sh
      - name: Extract coverage results
        run: >
          docker cp
          test1:/go/src/blitiri.com.ar/go/chasquid/.coverage/final.out
          .
      - name: Upload coverage results
        run: >
          goveralls
          -coverprofile=final.out
          -repotoken=${{ secrets.COVERALLS_TOKEN }}

  public-image:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [integration, coverage]
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: docker build -t chasquid -f docker/Dockerfile .

      # Push it to Dockerhub.
      - name: Dockerhub login
        if: env.HAS_DOCKER
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_REGISTRY_USER }}
          password: ${{ secrets.DOCKER_REGISTRY_TOKEN }}
      - name: Dockerhub push
        if: env.HAS_DOCKER
        run: |
          docker tag chasquid index.docker.io/${{ secrets.DOCKER_REGISTRY_USER }}/chasquid:$GITHUB_REF_NAME
          docker push index.docker.io/${{ secrets.DOCKER_REGISTRY_USER }}/chasquid:$GITHUB_REF_NAME
      - name: Dockerhub tag latest
        if: env.HAS_DOCKER && env.GITHUB_REF_NAME == 'master'
        run: |
          docker tag chasquid index.docker.io/${{ secrets.DOCKER_REGISTRY_USER }}/chasquid:latest
          docker push index.docker.io/${{ secrets.DOCKER_REGISTRY_USER }}/chasquid:latest

      # Push it to Gitlab.
      - name: Gitlab login
        if: env.HAS_GITLAB
        uses: docker/login-action@v2
        with:
          registry: registry.gitlab.com
          username: ${{ secrets.GITLAB_REGISTRY_USER }}
          password: ${{ secrets.GITLAB_REGISTRY_TOKEN }}
      - name: Gitlab push
        if: env.HAS_GITLAB
        run: |
          docker tag chasquid registry.gitlab.com/albertito/chasquid:$GITHUB_REF_NAME
          docker push registry.gitlab.com/albertito/chasquid:$GITHUB_REF_NAME
      - name: Gitlab tag latest
        if: env.HAS_GITLAB && env.GITHUB_REF_NAME == 'master'
        run: |
          docker tag chasquid registry.gitlab.com/albertito/chasquid:latest
          docker push registry.gitlab.com/albertito/chasquid:latest
```

## 6. 矩阵排除、多个操作系统上进行构建和测试，并在成功后收集代码覆盖率数据、发布到 GitHub Releases

`matrix.yml` 文件中的配置如下:

```yml
sudo: required
language: rust

os:
  - linux
  - osx

env:
  global:
    - CRATE_NAME=kytan
    - DEPLOY_VERSION=stable
  matrix:
    - TARGET=x86_64-apple-darwin
    - TARGET=x86_64-unknown-linux-gnu

matrix:
  exclude:
    - os: linux
      env: TARGET=x86_64-apple-darwin
    - os: osx
      env: TARGET=x86_64-unknown-linux-gnu

addons:
  apt:
    packages:
      - libcurl4-openssl-dev
      - libelf-dev
      - libdw-dev
      - cmake
      - gcc
      - binutils-dev
      - gcc-multilib

script:
  - cargo build --release --verbose
  - RUSTFLAGS='-C link-dead-code' cargo test --verbose --no-run
  - shopt -s extglob
  - for file in target/debug/deps/$CRATE_NAME-!(*.*); do sudo ./$file; done

after_success: |
  if [ "${TRAVIS_OS_NAME}" = "linux" ]; then
  wget https://github.com/SimonKagstrom/kcov/archive/master.tar.gz &&
  tar xzf master.tar.gz &&
  cd kcov-master &&
  mkdir build &&
  cd build &&
  cmake .. &&
  make &&
  sudo make install &&
  cd ../.. &&
  rm -rf kcov-master &&
  for file in target/debug/deps/$CRATE_NAME-*[^.d]; do mkdir -p "target/cov/$(basename $file)"; sudo kcov --exclude-pattern=/.cargo,/usr/lib --verify "target/cov/$(basename $file)" "$file"; done &&
  sudo chown -R $USER . &&
  bash <(curl -s https://codecov.io/bash) &&
  echo "Uploaded code coverage"; fi

before_deploy:
  - cp target/release/$CRATE_NAME $CRATE_NAME-$TRAVIS_TAG-$TARGET

deploy:
  provider: releases
  api_key:
    secure: "..."
  file: $CRATE_NAME-$TRAVIS_TAG-$TARGET
  on:
    condition: $TRAVIS_RUST_VERSION = $DEPLOY_VERSION
    tags: true
  skip_cleanup: true

notifications:
  email:
    on_success: never
```

## 7. 发布到 NPM, 更新 package.json, 创建 release 代码, 发送邮件, 发送 slack

`semantic-release.yml` 文件中的配置如下:

```yml
name: Release Workflow

on:
  push:
    branches:
      - master # Trigger the workflow on push to master branch

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
        with:
          token: ${{ secrets.TOKEN }}
          fetch-depth: 0 # Fetch all history so that semantic-release can generate changelogs correctly

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 20.6.1

      - name: Setup Pnpm
        run: npm install -g pnpm@latest

      - name: Cache Dependencies
        uses: actions/cache@v2
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

      - name: Install Dependencies
        run: pnpm install

      - name: Build Project # Optionally build your project, if required
        run: pnpm run build

      - name: Release and Publish
        env:
          GITHUB_TOKEN: ${{ secrets.TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: pnpm run release

      - name: Get version from package.json
        id: version
        run: echo "::set-output name=version::$(node -p "require('./package.json').version")"

      - name: Send Email Notification
        if: success() # Only send email if the previous steps were successful
        uses: dawidd6/action-send-mail@v2
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: New Release Published for ${{ github.repository }}
          body: |
            <h1>New Release Published</h1>
            <p>A new release has been published on <a href="${{ github.event.repository.html_url }}/releases/tag/v${{ env.RELEASE_VERSION }}">GitHub</a>.</p>
            <p>Here are the details:</p>
            <ul>
              <li><b>Tag:</b> v${{ env.RELEASE_VERSION }}</li>
              <li><b>Name:</b> Operculum</li>
            </ul>
            <p>You can view the full changelog <a href="${{ github.event.repository.html_url }}/blob/master/CHANGELOG.md">here</a>.</p>
          to: ${{ secrets.EMAIL_TO }}
          from: ${{ secrets.EMAIL_FROM }}
          content_type: text/html
          attachments: |
            ./CHANGELOG.md
      - name: Notify on Discord
        if: success()
        run: |
          DISCORD_WEBHOOK_URL=${{ secrets.DISCORD_WEBHOOK_URL }}
          MESSAGE="Operculum: NEW Release: v${{ steps.version.outputs.version }} is published! Check it out at ${{ github.event.repository.html_url }}/blob/master/CHANGELOG.md"
          curl -H "Content-Type: application/json" -X POST -d '{"content": "'"$MESSAGE"'"}' $DISCORD_WEBHOOK_URL

      - name: Notify on Slack or Discord # Optionally notify team members on release, customize as per your needs
        if: success() # Only notify if the previous steps were successful
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          fields: job,ref
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```
