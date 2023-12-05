---
title: 基于Kubernetes的容器云平台实战
date: 2023-11-28 14:19:00
author: "moxi"
tags: ["K8S", "容器云平台"]
description: "基于Kubernetes的容器云平台实战"
---

# 基于 Kubernetes 的容器云平台实战

主要是 Spring Cloud, Serverless, Service Mesh, Docker 结合讲解。实践 DevOps。

## 安装

- `apt-get install docker-ce`
- `systemctl status docker`
- `docker info`

## Dokcerfile 特殊点

- ADD: 复制文件到容器，如果有压缩文件则自动解压
- COPY: 复制，不解压
- ENTRYPOINT: docker run 后面的参数不能覆盖
- CMD: 会被覆盖

构建: `docker build -t [name]:<tag>`

## 对容器安全加固规范

- 更改运行容器的用户权限

解决:

1. 非 root 用户执行容器
2. 如果已经定义用户，所以在 dockerfile 添加: `RUN useradd-d/home/<username>-m-s/bin/bash<username>USER<username>`

- 镜像中的 setuid, setgid

解决:

1. 添加: `RUN find/-perm 6000-type f-exec chmod a-s{}\;||true`，进行权限控制

- 数字签名

解决:

1. `dockerd --tlsverify --tlscacert=ca.pem --tlscert=server-cert.pem --tlskey=server-key.pem \ -H=10.47.40.110:2376`

- 内存限制配额: `docker run -it --rm --cpuset=0,1 -c 2`

- 日志审核: `docker run -v /dev/log:/dev/log <container_name> /bin/sh`

## 镜像仓库

主流方式: Docker Registry, Harbor

### 搭建私有镜像仓库

#### Docker Registry

上传镜像到私有镜像参考，在构建容器化应用时，可以快速地下载镜像文件使用.

在 Docker 1.12 以后的版本环境中搭建无认证的 Registry。Dockerd 的配置文件在`/etc/docker/daemon.json` 中，如果没有该文件，可以手动创建。

第一步：从 Docker 官方镜像仓库下载 Registry。

```bash
docker pull registry #不指定版本,表示 latest 版本
```

第二步：配置 `daemon.json`,去掉 Docker 默认的 https 的访问

```bash
vim /etc/docker/daemon.json
{
    "insecure-registries": ["10.47.43.100:5000"]
} # 增加 insecure-registries 的项目
```

第三步：重启 Docker,执行以下命令

`systemctl daemon-reload docker systemctl restart docker`

第四步：无认证方式启动 Registry 容器

`docker run -d --name registry -p 5000:5000 --restart=always -v /opt/registry/:/var/lib/registry/ registry`

第五步：测试是否启动容器

在浏览器中访问`http://10.47.43.100:5000/v2/_catalog`, 如果返回`{"repositories":[]}`,就代表启动成功了

第六步：上传镜像到镜像仓库测试 push 功能

`docker tag MySQL 10.47.43.100:5000/MySQL`, 必须带有`"10.47.43.100:5000/"`这个前缀,然后开始上传镜像到我们建立的私有 Registry

`docker push 10.47.43.100:5000/MySQL`

再在浏览器中访问`http://10.47.43.100:5000/v2/_catalog`，可以看到返回{"repositories": ["MySQL"]},说明已经上传成功

第七步：从镜像仓库下载镜像测试 pull 功能

首先删除本机存在的镜像 `10.47.43.100:5000/MySQL` (刚才通过 tag 重命名的):

d`ocker rmi 10.47.43.100:5000/MySQL`

然后执行 `docker images`,可以看到已经没有了 `10.47.43.100:5000/MySQL` 这个镜像

下面开始下载这个镜像:

`docker pull 10.47.43.100:5000/MySQL`

然后再执行 docker images,可以看到 10.47.43.100:5000/MySQL,说明下载成功了。

#### Harbor

支持身份验证。

步骤:

1. `git clone https://github.com/goharbor/harbor`
2. `tar xvf harbor-offline-installer-v2.9.1.tgz`
3. 配置 `harbor.cfg`
4. `./install.sh`

配置 HTTPS:

```bash
# vim harbor.cfg

hostname = myharbor
ui_url_protocol = https
harbor_admin_password =  123456
```

构建: `./prepare`

启动服务: `docker-compose up -d`

## Kubernetes

- kubectl 对 Pod 的操作
  - 创建: kubectl create -f [xx.yaml]
    - kubectl apply -f [pod.yaml]
  - 查询: kubectl get pod [name]
  - 名称: kubectl describe pod [name]
  - 删除: kubectl delete pod [name]
  - 更新: kubectl replace /path/xx.yaml

Pod 模板:

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:latest
      ports:
        - containerPort: 8082
```
