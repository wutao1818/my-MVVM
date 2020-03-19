function MVVM(options) {
    this.$options = options || {};
    var data = this._data = this.$options.data;
    var me = this;

    // 数据代理，将实例的参数data中的数据代理给vue自身
    // 实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function(key) {
        me._proxyData(key);
    });

    // 对计算属性进行数据劫持
    this._initComputed();

    // 对挂载的属性、以及属性的属性，进行递归遍历劫持，并存放于一个依赖收集器中。
    // 如果有人订阅了该属性，属性变化，通知订阅者，以达到数据变更，视图更新。
    observe(data, this); // 本质上就是监听器->发布订阅->订阅者收到数据更新

    // 编译挂载的DOM或者模板为js
    this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
    constructor: MVVM,
    $watch: function(key, cb, options) {
        new Watcher(this, key, cb);
    },

    _proxyData: function(key, setter, getter) {
        var me = this;
        setter = setter || 
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return me._data[key];
            },
            set: function proxySetter(newVal) {
                me._data[key] = newVal;
            }
        });
    },

    _initComputed: function() {
        var me = this;
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(me, key, {
                    get: typeof computed[key] === 'function' 
                            ? computed[key] 
                            : computed[key].get,
                    set: function() {}
                });
            });
        }
    }
};