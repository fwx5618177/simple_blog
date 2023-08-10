# High Concurrency: What I Learned from a System Design Interview with Agoda

Share an interview with Senior Full Stack Engineer. For my limited oral english, it's a tough time for my interviewer.
I knew I was in for a challenge when I stepped into the room of the interview. It's round 2.
As I embarked on the journey of interviewing for the Senior Full Stack position, I was well aware that the path ahead would be demanding and intricate. The role's emphasis on depth and breadth across both front-end and back-end technologies meant that the interview process would naturally elevate complexity and design expectations.
This reflection delves into the immersive experience of my Senior Full Stack interview, offering insights into the heightened technical demands and the intricate design aspects that shaped the assessment. Navigating through this process not only tested my technical proficiency but also underscored the significance of well-rounded expertise at a senior level.
But the important thing is that my spoken English is not good enough, and it cost me the offer. The next step involves not only honing my technical skills but also focusing on improving and enhancing my communication skills and soft abilities.

## The Interview Process

Task 1. Just be a simple Front end task. It mainly described the basic knowledge of React, useState, useEffect, and debounce. I think it is easy for me.
Task 2. High Concurrency System Design: How to display and store user counts? Especially when there are 1 million users and 200K are accessing a product detail page simultaneously. How to design the front and back end to display the number on the detail page.
When I get this question, I realized that designing a system handle such as high concurrency is a multifaceted endeavor that requires careful consideration of various aspects.
So I described the following steps to solve this problem from 2 aspects:

1. Front-End
   In the front end, the key point is to provide real-time updates to users about the number of individuals currently viewing a product detail page. To achieve this, I proposed 2 strategies:

- CDN static resources. Put all resources in CDN, such as js, CSS, images, etc. This can reduce the pressure on the server and improve the user experience. If we want to reduce the size of the resource, we also can use sprites to combine the images. But it just is a simple way to improve the performance of the website, not the key point.
- Websocket and SSE(Event-Source). Directly upgrade HTTP protocol to ws protocol. So implement ws protocol or SSE connections to facilitate real-time communication between the front and backend. It ensures users receive instant updates on user counts as they occur.

2. Back-End
   The backend is at the core of handling user counts and serving real-time data efficiently. To address the high concurrency challenges, I proposed the following strategies:

- Load balance and API Gateway. Utilize load balancers and an API gateway to distribute incoming traffic across multiple servers and backend instances. This ensures that the backend can handle the high volume of requests and serve them efficiently, besides preventing any single components from becoming a bottleneck.
- It looks like we could set Rate-Limiting in API Gateway to prevent the backend from being overwhelmed by too many requests. I think it could keep the backend stable.
- Microservices architect.
- Caching mechanism. Integrate an in-memory caching mechanism to store the user counts. Like Redis, it could retrieve count data quickly and efficiently. It could reduce the load on the database and enhance the response times.
- **After discussing with a friend, Redis also supports persistence mechanisms. Such as Append-Only File(AOF) and Redis Database(RDB) snapshots. In the event of a server failure, we can recover data by reading the log files.**
- DB for historical Data. Directly using a database to store historical user count data, allowing for analysis and insights into user behavior trends.
- Restful API + MQ. Utilizing a combination of restful APIs and a message queue(MQ) to handle the front requests. Effectively interact with the backend services and ensure asynchronous communication for broadcasting updates. This approach is beneficial for handling high concurrency and large volumes of requests. And it also allows for scalability and flexibility in handling the requests. Actually, it's user counts.
- RPC ProtoBuf. Using RPC ProtoBuf to communicate between microservices. But in the period of the interview, I forget the exact name of `ProtoBuf`, eventually I just described it as `binary buffer protocol`. I think it's a big mistake. Set a temporary database to store the ProtoBuf data, along with a flag status variable to indicate the readiness of consumption or if data has already been consumed, enhances data consistently and helps manage the data flow efficiently. **This method which adds a flag in the context of RPC is typically well-suited for event-driven architecture. It supports asynchronous communications and flexibility. Flag status is particularly suitable for scenarios where multiple actions occur concurrently. It can signify various states, like `ready for`, `consumption`, `processing`, and `consumed`.**

## Overlook

In conclusion, I have overlooked several critical considerations.

1. Ensure data consistency and concurrent operation correctness. I need to explain mechanisms such as locks, transactions, and isolation levels to address these challenges would have further strengthened my evidence.
2. Thorough Consideration of Load Balancing Algorithms, Cache Strategies, API Design, and Message Queue Selection. Addressing different load-balancing algorithms, discussing cache eviction policies, elaborating on RESTful API design principles, and comparing various message queue options would demonstrate a more comprehensive understanding of system design intricacies.
3. WebSocket Connection Management and Resource Management in High Concurrency. Not elaborate on how effectively manage WebSocket connections and handle resource utilization during periods of high concurrency. Discussing techniques like connection pooling, throttling, and resource monitoring would highlight proficiency in handling practical challenges.

# Conclusion

In the end, I think I don't have a good performance in the interview. So I still need to improve my spoken English. And I also need to learn more about system design. I think it's a good way to improve my ability to solve problems.
