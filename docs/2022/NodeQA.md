# 常见面试题

## 1. Node并发处理
在面试过程中，忽然遇到一些问题，还算蛮有趣，因此写下来记录。
以下为题目描述:
```js
/**
 * 
假设有个 
const request = function(id){
    return new Promise((resolve,reject)=>{
        //随机一个执行时间
        let time = Math.floor(1000*Math.random());
        console.log(`id为${id}开始请求,预计执行时间${time/1000}`)
        setTimeout(()=>{
            resolve(id);
        },time)
    }).then((id)=>{
        console.log(`id为${id}的请求进行逻辑处理`)
        return id;
    })
}

实现 requestQueue(limit, [0,1,2,3,4,5,6,7,8,9,10])
每次并发调用不超过 limit 个, 返回结果与 Promise.all 一致
 */
```

可以得到的条件:
1. 并发调用
2. 返回结果，与Promise.all方式相似

```js
const limitQueue = (limit, ids) => {
	let i = 0; // 完成任务数
	
	//填充执行
	for(let execCount = 0; execCount < limit; execCount++) {
		run()
	}
	
	const run = () => {
		// 任务执行
		// 执行完成后，如果还有没执行的，go on
		new Promise((resolve, reject) => {
			const id = ids[i]

			i++;

			resolve(request(id))
		}).then(()=> {
			if(i < ids.length) run()
		})
	}
}

```

```js
const allSetled = (promises) => {
	let results = []
	let promiseCount = 0
	let promiseLength = promises.length
	
	return new Promise((reslove, reject) => {
		for(let i of promises) {
			promiseCount++
			Promise.resolve(i).then(res => {
				results[i] = res
				
				//feedback
				if(promiseCount === promiseLength) {
					return resolve(results)
				}
			})
		}
		
	})
}

```
