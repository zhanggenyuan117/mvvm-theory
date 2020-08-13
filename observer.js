
/*
*   author:zhanggenyuan
*   data:2020-08
*   本文参考  vue源码系列 - vue中文社区
*   点个star
*/

/*************  Observer类使数据变得可观测  ****************/
class Observer {
    constructor(value) {
        //声明
        this.value = value;
        //判断如果是数组的话  返回  因为data是一个对象  数组暂时不进行操作
        if (Array.isArray(value)) {
            return
        } else {
            //如果是对象  执行walk函数
            this.walk(value)
        }
    }
    // walk函数 遍历data对象   Object.keys(obj) 遍历对象   返回该对象内属性名的集合   即为数组
    walk(obj) {
        const keys = Object.keys(obj);
        //遍历每一个属性名  针对每一个属性名和值进行监测
        keys.forEach(key => {
            this.defineReactive(obj, key, obj[key])
        })
    }
    defineReactive(obj, key, val) {
        if (arguments.length === 2) {
            val = obj[key]
        }
        //判断  如果传入的属性值还是一个object   递归执行Observer函数
        if (typeof val === 'object') {
            new Observer(val)
        }
        Object.defineProperty(obj, key, {
            enumerable: true,  //es6   是否可枚举
            configurable: true, // 是否可配置
            //将每一个属性转换成 getter / setter 来监测数据的变化
            get() {
                console.log(`${key}属性被读取了`)
                dep.depend(); //收集依赖
                return val
            },
            set(newVal) {
                if (val == newVal) {
                    return
                }
                console.log(`${key}属性被改写了`)
                val = newVal;
                dep.notify();  //通知更新
            }
        })
    }
}

/**************  收集依赖  ***********************/

class Dep {
    constructor() {
        this.subs = [];
    }
    addSub(sub) {
        this.subs.push(sub)
    }
    //添加一个依赖
    depend() {
        if (window.target) {
            this.addSub(window.target)
        }
    }
    //删除一个依赖
    removeSub() {
        this.remove(this.subs, sub)
    }
    //通知
    notify() {
        const subs = this.subs.slice()
        for(let i=0;i<subs.length;i++){
            subs[i].update()
        }
    }
    //删除一个依赖的方法
    remove(arr, item) {
        if (arr.length) {
            const index = arr.indexOf(item);
            if (index > -1) {
                this.subs.splice(index, 1)
            }
        }
    }
}


/*************  创建wacther示例  *****************/

class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        this.cb = cb;
        this.getter = parsePath(expOrFn)
        this.value = this.get()
    }
    get() {
        window.target = this;
        const vm = this.vm
        let value = this.getter.call(vm, vm)
        window.target = undefined;
        return value
    }
    update() {
        const oldValue = this.value
        this.value = this.get()
        this.cb.call(this.vm, this.value, oldValue)
    }
}

const bailRE = /[^\w.$]/
function parsePath(path) {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            obj = obj[segments[i]]
        }
        return obj
    }
}