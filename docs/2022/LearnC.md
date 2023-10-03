# GuideToC

## 简单介绍
- [ ] 算法
- [ ] 计算机网络
    - [ ] tcp/ip 协议栈
- [ ] 操作系统
    - [ ] 进程和线程 并发 和锁 内存分布调度
- [ ] 设计模式
- [ ] Linux OS
- [ ] CMake
- [ ] gcc, gdb, makefile
- [ ] OS API
- [ ] 多线程编程
    - 网络编程（unix环境高级编程）（Linux高性能服务器编程）（posix多线程程序设计）
- [ ] 网络编程

## 推荐书籍
C： C Primer Plus,  C和指针，C专家编程
C++：有专门的视频
基础四大件：
    1.数据结构与算法 《大话数据结构》c/c++  ，《算法第四版》 java ，《剑指offer》
    2.计算机网络《tcp/ip详解》
    3.操作系统  《深入理解操作系统》
    4.设计模式 《大话设计模式》
1.linux使用
    《linux就该这么学》
2.编译和调试
    GUN官方GCC和GDB文档
    《debugging  with gdb 》中文版
    《跟我一起写makefile》陈皓
3.linux环境编程
    《unix环境高级编程》
    《linux高性能服务器编程》
    《posix多线程程序设计》

## 推荐学习
### Modern C++
这应该是C++后台开发岗位的学习路线。C++本身推荐以下学习路线：
老三件C++ Primer 5th、effective c++，stl源码剖析
C++2.0：effect modern c++，c++模板编程第二版，工程上《深入应用C++11--代码优化与工程级应用》这本书基于C++11给了实践例子。现在vs默认都C++17了，里面有些东西在新标准下有改变。
C++14/C++17暂时没见到有比较好的书籍，cppreference和标准文档参考一起看比较好。之前摸了篇17的foler expression https://www.cnblogs.com/pusidun/p/13608761.html，其他的有空写
此外，C++的惯用法也要知道，常见的比如RAII，CRTP，PIMPL等。这需要对编译、链接过程有清楚的认识，才好理解这些惯用法的意义。
建议OS，network基础课一定要学扎实，不然到后期很难理解一些概念。
建议最少也要使用支持C++14的编译器开始学习，只学C98当然能找到工作，但据我观察modern c++一行不会写的同事水平比较一般，要么潜力一般要么热情一般吧。
上面这些能够让你入门C++。如果只是想找工作，不一定需要看。我写这些只是针对学习C++而言。毕竟C++岗位的工作，平时很可能是用Golang，而且很可能是GCC4.8以下的祖传编译器

### 操作系统 - 分布式
1.《深入理解计算机系统》，重点做完lab
2.MIT6.828 operating system engineering，重点做完lab，能构造一个简单的内核
3.MIT6.824 Distributed system，分布式系统课程，现在的版本是go语言实现的，老版本是c++
