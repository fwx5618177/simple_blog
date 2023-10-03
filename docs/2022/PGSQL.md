# PGSQL修炼之道

## 本书内容
1. 提前准备
2. 基础知识
3. 高级提高
4. 数据库架构

## 目录结构
一 准备
1. 简介与对比
2. 入门

二 基础
1. 工具
2. 数据类型
3. 14种类型: 9种基础类型, 2类json/xml，3类复杂类型
    - 布尔类型
    - 数值类型
    - 字符串类型
    - 二进制
    - 位串类型
    - 日期 / 时间类型
    - 枚举类型
    - 几何类型
    - 网络地址类型
    - 复合类型
    - xml
    - JSON
    - Range
    - 数组类型
    - 伪类型
    - 其他类型
4. 数据库逻辑结构管理
    - 内核
    - 权限管理
5. 架构与服务

三 提高
1. 计划、内幕
2. 特色功能
3. 优化
4. 搭建

四 架构
1. 集群
2. 高可用
3. 设计


## 准备
### 0. 搭建环境
1. 利用`docker`搭建环境
```yml
# Use postgres/example user/password credentials
version: '3.1'

services:

  db:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: example

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080
```

开启: `docker-compose -f stack.yml up`

### 1. 常见命令
1. 创建数据库实例: `/usr/pgsql-12/bin/postgresql-12-setup initdb`
2. 开机自启动: `systemctl enable postgresql-12`
3. service管理服务: `service postgresql-12 start`
4. 查看状态: `systemctl status postgresql-12`
5. 停止: `systemctl stop postgresql-12`
6. 环境配置:
```shelll
export PATH=/usr/local/pgsql/bin:$PATH
```
7. 启动数据库: `pg_ctl start -D $PGDATA`
8. 停止数据库: `pg_ctl stop -D $PGDATA -m [smart|fast|immediate]`
9. 进入数据库:
```shell
su - postgres
psql
```
10. 数据库内退出:
```shell
\q - 退出
\d - 查看表
\d [tableName] - 查看表的定义
\dn - 查看所有schema
\timing - 显示sql执行的时间
\pset border 2 - 格式化输出
\i [文件名] 执行存储在外部文件中的SQL语句或命令
```
11. 倒入文件: `psql -x -f [filename]`
12. 数据类型转换函数CAST: `select CAST('5', int);`
13. 转换类型：`select '5'::int;`


### 2. 简单配置文件
- 远程连接: `pg_hba.conf`
- 监听IP和端口: `postgresql.conf`
- 日志开启: `logging_collector = on`
- 日志目录: `log_directory = 'pg_log'`

1. 每天生成一个日志文件
```shell
log_filename = 'pg-%Y-%m-%d_%H%M%S.log'
log_truncate_on_rotation = off
log_rotation_age = 1d
log_rotation_size = 0
```

2. 写满大小则切换日志
```shell
...
log_rotation_size = 10M
```

3. 只保留最近7天
```shell
log_filename = 'pg-%a.log'
log_truncate_on_rotation = on
log_rotation_age = 1d
log_rotation_size = 0
```

### 3. 内存参数
- shared_buffers: 共享内存大小，共享数据块
- work_mem: 执行后内存释放

## SQL入门
### sql命令分类
1. DQL: 查询, select
2. DML: 数据操纵, insert, update
3. DDL: 数据定义, create, drop

### 基础
#### 子查询:
    - 标量子查询: 不能返回多行的子查询
    - in, exists, any / all, >/</=/!=
#### 备份表:
```sql
INSERT INTO back SELECT * FROM score;
```
#### 3. UNION
`SELECT * FROM t1 UNION SELECT * FROM t2;`
- 两张表的数据合在一个结果集下时使用
- 相同就会合并为一条
- 不想合并需要使用`UNION ALL`

#### 4. 货币类型
- `SELECT '12.3111'::money;`

#### 5. 枚举类型
- 查看枚举类型的定义: `\dT+ [enumName]`
- 创建枚举:
```sql
CREATE 
```

#### 6. 几何类型
- `select '1,1'::point;`
- `select '<(1,1),5>'::circle;`

#### 7.JSONB
- 创建索引


```sql
CREATE table jtest01 {
    id int,
    jdoc json
};

create or replace function random_string(integer) 
returns text as
$bobdy$
select array_to_string(
    array(
        select substring(
            '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
            from (ceil(random() *62))::int for 1
        )
        from generate_series(1, $1)
    ),
    ''
)
$body$
LANGUAGE sql volatile;


insert into jtest01 select t.seq, ('{"a": 1, "name": "'||random_string(10)||'"}')::json from generate_series(1, 1000000) as t(seq);
```


### 总结
#### 测试

测试:
```sql
-- Select rows from a Table or View 'TableOrViewName' in schema 'SchemaName'
SELECT * FROM SchemaName.TableOrViewName
WHERE 	/* add search conditions here */
group by

-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists
IF OBJECT_ID('SchemaName.TableName', 'U') IS NOT NULL
DROP TABLE SchemaName.TableName
GO
-- Create the table in the specified schema
CREATE TABLE score
(
    id INT NOT NULL PRIMARY KEY, -- primary key column
    student_name VARCHAR(50) NOT NULL,
    age VARCHAR(50) NOT NULL
    -- specify more columns here
);
GO

-- Insert rows into table 'TableName'
INSERT INTO score
(
 id, student_name, age
)
VALUES
(
 1,'fwx','13'
),
(
 2, 'moxi', '22'
);


CREATE TYPE week as ENUM('Sun', 'Mon');
CREATE TABLE duty(
    person text,
    weekday week
);


CREATE table jtest01 {
    id int,
    jdoc json
};

create or replace function random_string(integer) 
returns text as
$bobdy$
select array_to_string(
    array(
        select substring(
            '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
            from (ceil(random() *62))::int for 1
        )
        from generate_series(1, $1)
    ),
    ''
)
$body$
LANGUAGE sql volatile;


insert into jtest01 select t.seq, ('{"a": 1, "name": "'||random_string(10)||'"}')::json from generate_series(1, 1000000) as t(seq);

create schema osbda
    create table t1 (id int, title text)
    create table t2 (id int, content text)
    create view v1 as
        select a.id, a.title, b.content from t1 a, t2 b where a.id = b.id;
-- Select rows from a Table or View 'TableOrViewName' in schema 'SchemaName'
SELECT * FROM SchemaName.TableOrViewName
WHERE 	/* add search conditions here */
group by


-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists
IF OBJECT_ID('SchemaName.TableName', 'U') IS NOT NULL
DROP TABLE SchemaName.TableName
GO
-- Create the table in the specified schema
CREATE TABLE score
(
    id INT NOT NULL PRIMARY KEY, -- primary key column
    student_name VARCHAR(50) NOT NULL,
    age VARCHAR(50) NOT NULL
    -- specify more columns here
);
GO

-- Insert rows into table 'TableName'
INSERT INTO score
(
 id, student_name, age
)
VALUES
(
 1,'fwx','13'
),
(
 2, 'moxi', '22'
);


CREATE TYPE week as ENUM('Sun', 'Mon');
CREATE TABLE duty(
    person text,
    weekday week
);


CREATE table jtest01 {
    id int,
    jdoc json
};

create or replace function random_string(integer) 
returns text as
$bobdy$
select array_to_string(
    array(
        select substring(
            '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
            from (ceil(random() *62))::int for 1
        )
        from generate_series(1, $1)
    ),
    ''
)
$body$
LANGUAGE sql volatile;


insert into jtest01 select t.seq, ('{"a": 1, "name": "'||random_string(10)||'"}')::json from generate_series(1, 1000000) as t(seq);

create schema osbda
    create table t1 (id int, title text)
    create table t2 (id int, content text)
    create view v1 as
        select a.id, a.title, b.content from t1 a, t2 b where a.id = b.id;

```

