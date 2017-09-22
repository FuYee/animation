(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["animation"] = factory();
	else
		root["animation"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var loadImage = __webpack_require__(1);
var Timeline = __webpack_require__(2);
// 初始化状态
var STATE_INTIAL = 0;
// 开始状态
var STATE_START = 1;
// 停止状态
var STATE_STOP = 2;

// 同步任务
var TASK_SYNC = 0;
// 异步任务
var TASK_ASYNC = 1;
/**
 * 简单的函数封装，执行callback
 * @param callback执行函数
 */
function next(callback) {
  callback && callback();
}
/**
 *帧动画库类
 * @constructor
 */
function Animation() {
  // 创建任务队列
  this.taskQueue = [];
  // 当前任务
  this.index = 0;
  this.timeline = new Timeline();
  this.state = STATE_INTIAL;
}
/**
 * 添加一个同步任务，去预加载图片
 * @param imgList 图片数组
 */
Animation.prototype.loadImage = function (imgList) {
  var taskFn = function (next) {
    // slice()浅拷贝相當於imgList.slice(0，end)
    loadImage(imgList.slice(), next);
  };
  var type = TASK_SYNC;
  // return this用于链式调用
  return this._add(taskFn, type)
};
/**
 * 添加一个异步定时任务，通过定时改变图片的背景，实现帧动画
 * @param ele dom对象
 * @param positions 背景位置数组
 * @param imageUrl 图片地址
 */
Animation.prototype.changePosition = function (ele, positions, imageUrl) {
  var len = positions.length;
  var taskFn;
  var type;
  if (len) {
    var me = this;
    taskFn = function (next, time) {
      if (imageUrl) {
        ele.style.backgroundImage = 'url(' + imageUrl + ')';
      }
      // |0或0表示向下取整Math.floar
      // 获得当前背景图片的位置索引
      var index = Math.min(time / me.interval | 0, len - 1);
      var position = positions[index].split(' ');
      // 改变dom对象的比较图片位置
      ele.style.backgroundPosition = position[0] + 'px ' + position[1] + 'px';
      if (index === len - 1) {
        next();
      }
    };
    type = TASK_ASYNC;
  } else {
    taskFn = next;
    type = TASK_SYNC;
  }
  return this._add(taskFn, type)
};
/**
 *添加一个异步定时任务，通过改变图片的src属性，实现帧动画
 * @param ele dom对象
 * @param imgList 图片地址数组
 */
Animation.prototype.changeSrc = function (ele, imgList) {
  var len = imgList.length;
  var taskFn;
  var type;
  if (len) {
    var me = this;
    taskFn = function (next, time) {
      // 获得当前图片索引
      var index = Math.min(time / me.interval | 0, len - 1);
      // 改变image对象的图片地址
      ele.src = imgList[index];
      if (index === len - 1) {
        next();
      }
    };
    type = TASK_ASYNC;
  } else {
    taskFn = next;
    type = TASK_SYNC;
  }
  return this._add(taskFn, type)
}
/**
 * 高级用法，添加一个异步定时执行的任务
 * 改任务是自定义动画每帧执行的任务函数
 * @param taskFn
 */
Animation.prototype.enterFrame = function (taskFn) {
  return this._add(taskFn, TASK_ASYNC);
}
/**
 * 添加一个同步任务，可以在上一个任务完成后执行回调函数
 * @param callback 回调函数
 */
Animation.prototype.then = function (callback) {
  var taskFn = function (next) {
    callback();
    next();
  };
  var type = TASK_SYNC;
  return this._add(taskFn, type);
}
/**
 * 开始执行任务，异步定义任务执行的间隔
 * @param interval
 */
Animation.prototype.start = function (interval) {
  if (this.state === STATE_START) {
    return this;
  }
  // 如果任务链中没有任务，则返回
  if (!this.taskQueue.length) {
    return this;
  }
  this.state = STATE_START;
  this.interval = interval;
  this._runTask();
  return this;
}
/**
 * 添加一个同步任务，该任务就是回退到上一个任务中，
 * 实现重复上一个任务的效果，可以定义重复的次数
 * @param times 重复次数
 */
Animation.prototype.repeat = function (times) {
  var me = this;
  var taskFn = function () {
    if (typeof times === 'undefined') {
      // 无限回退到上一个任务
      me.index--;
      me._runTask();
      return;
    }
    if (times) {
      times--;
      // 回退
      me.index--;
      me._runTask();
    } else {
      // 达到重复次数，跳转到下一个任务
      var task = me.taskQueue[me.index];
      me._next(task);
    }
  }
  var type = TASK_SYNC;
  return this._add(taskFn, type);
}
/**
 * 添加一个同步任务，相当于repeat（）更友好的接口，无限循环上一次任务
 */
Animation.prototype.repeatForever = function () {
  return this.repeat();
}
/**
 * 设置当前任务执行结束后到下一个任务开始前的等待时间
 * @param time 等待时长
 */
Animation.prototype.wait = function (time) {
  if (this.taskQueue && this.taskQueue.length > 0) {
    this.taskQueue[this.taskQueue.length - 1].wait = time;
  }
  return this;
};
/**
 * 暂停当前异步定时任务
 */
Animation.prototype.pause = function () {
  if (this.state === STATE_START) {
    this.state = STATE_STOP;
    this.timeline.stop();
    return this;
  }
  return this;
}
/**
 * 重复执行上一次暂停的异步任务
 */
Animation.prototype.restart = function () {
  if (this.state === STATE_STOP) {
    this.state = STATE_START;
    this.timeline.restart();
    return this;
  }
  return this;
}
/**
 * 释放资源
 */
Animation.prototype.dispose = function () {
  if (this.state !== STATE_INTIAL) {
    this.state = STATE_INTIAL;
    this.taskQueue = null;
    this.timeline.stop();
    this.timeline = null;
    return this;
  }
  return this;
}
/**
 * 添加一个任务到任务队列中
 * @param taskFn任务方法
 * @param type任务类型
 * @private
 */
Animation.prototype._add = function (taskFn, type) {
  this.taskQueue.push({
    taskFn: taskFn,
    type: type
  });
  // 用于链式调用
  return this;
};
/**
 * 执行任务
 * @private
 */
Animation.prototype._runTask = function () {
  if (!this.taskQueue || this.state !== STATE_START) {
    return;
  }
  // 任务执行完毕
  if (this.index === this.taskQueue.length) {
    this.dispose();
    return;
  }
  // 获得任务链上的当前任务
  var task = this.taskQueue[this.index];
  if (task.type = TASK_SYNC) {
    this._syncTask(task);
  } else {
    this._asyncTask(task);
  }
};
/**
 * 同步任务
 * @param task执行的任务对象
 * @private
 */
Animation.prototype._syncTask = function (task) {
  var me = this;
  var next = function () {
    // 切换到下一个任务
    me._next(task);
  };
  var taskFn = task.taskFn;
  taskFn(next);
};
/**
 * 切换到下一个任务,支持如果当前任务需要等待，则延时执行
 * @param task 当前任务
 * @private
 */
Animation.prototype._next = function (task) {
  this.index++;
  var me = this;
  task.wait ? setTimeout(function () {
    me._runTask();
  }, task.wait) : this._runTask();
};
/**
 * 异步任务
 * @param task执行的任务对象
 * @private
 */
Animation.prototype._asyncTask = function (task) {
  var me = this;
  // 定义每一帧执行的回调函数
  var enterFrame = function (time) {
    var taskFn = task.taskFn;
    var next = function () {
      // 停止当前任务
      me.timeline.stop();
      // 执行下一个任务
      me._next(task);
    };
    taskFn(next, time);
  };
  this.timeline.onenterframe = enterFrame;
  this.timeline.start(this.interval);
};
module.exports = function () {
  return new Animation();
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __id = 0;

/**
 * 动态创建id
 * @returns {number}
 */
function getId() {
  return ++__id;
}

/**
 * 预加载图片函数
 * @param images 加载的图片数组或对象
 * @param callback 全部图片加载完毕后调用的回调函数
 * @param timeout 加载超时的时长
 */
function loadImage(images, callback, timeout) {
  //加载完成图片的计数器
  var count = 0;
  //全部图片成功加载完图片的标志位
  var success = true;
  //超时timer的id
  var timeoutId = 0;
  //是否加载超时的标志位
  var isTimeout = false;
  //对图片数组（或对象）进行遍历
  for (var key in images) {
    //过滤掉prototype的属性
    if (!images.hasOwnProperty(key))
      continue;
    //获得每个图片元素
    //期望格式是个object： {src:xxx}
    var item = images[key];

    // 如果item是个字符串，则构造object
    if (typeof item === 'string') {
      item = images[key] = {
        src: item
      };
    }

    //如果格式不满足期望，则丢弃此条数据进行下一次遍历
    if (!item || !item.src)
      continue;

    //计数+1
    count++;
    //设置图片元素的id
    item.id = "__img_" + key + getId();
    //设置图片元素的img，是一个Image对象
    item.img = window[item.id] = new Image();

    doLoad(item);
  }

  //遍历完成如果计数为0，则直接调用
  if (!count) {
    callback(success);
  }
  //如果设置了加载时长，则设置超时函数计时器
  else if (timeout) {
    timeoutId = setTimeout(onTimeout, timeout);
  }

  /**
   * 真正进行图片加载的函数
   * @param item 图片元素对象
   */
  function doLoad(item) {
    item.status = "loading";

    var img = item.img;
    //定义图片加载成功的回调函数
    img.onload = function () {
      //如果每张图片都成功才算成功
      success = success && true;
      item.status = "loaded";
      done();
    };
    img.onerror = function () {
      //若有一张图片加载失败，则为失败
      success = false;
      item.status = "error";
      done();
    };
    //发起一个http(s)请求加载图片
    img.src = item.src;

    /**
     * 每张图片加载完成的回调函数
     */
    function done() {
      //事件清理
      img.onload = img.onerror = null;

      try {
        //删除window上注册的属性
        delete window[item.id];
      }
      catch (e) {

      }
      //每张图片加载完成，计数器减一，当所有图片加载完毕且没有超时的情况下，
      //清除超时计时器，且执行回调函数
      if (!--count && !isTimeout) {
        clearTimeout(timeoutId);
        callback(success);
      }
    }
  }

  /**
   * 超时函数
   */
  function onTimeout() {
    isTimeout = true;
    callback(false);
  }
}

module.exports = loadImage;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DEFAULT_INTERVAL = 1000 / 60;

//初始化状态
var STATE_INITIAL = 0;
//开始状态
var STATE_START = 1;
//停止状态
var STATE_STOP = 2;

/**
 * Timline时间轴类
 * @constructor
 */
function Timeline() {
  this.animationHandler = 0;
  this.state = STATE_INITIAL;
}

/**
 * 时间轴上每一次回调执行的函数
 * @param time 从动画开始到当前执行的时间
 */
Timeline.prototype.onenterframe = function (time) {
};

/**
 * 动画开始
 * @param interval 每一次回调的间隔时间
 */
Timeline.prototype.start = function (interval) {
  if (this.state === STATE_START)
    return;
  this.state = STATE_START;

  this.interval = interval || DEFAULT_INTERVAL;
  startTimeline(this, +new Date());
};

/**
 * 重新开始动画
 */
Timeline.prototype.restart = function () {
  if (this.state === STATE_START)
    return;
  if (!this.dur || !this.interval)
    return;

  this.state = STATE_START;

  //无缝连接停止动画的状态
  startTimeline(this, +new Date() - this.dur);
};

/**
 * 动画停止
 */
Timeline.prototype.stop = function () {
  if (this.state !== STATE_START)
    return;
  this.state = STATE_STOP;

  //如果动画开始过，则记录动画从开始到当前所经历的时间
  if (this.startTime) {
    this.dur = +new Date() - this.startTime;
  }
  cancelAnimationFrame(this.animationHandler);
};

/**
 * 时间轴动画启动函数
 * @param timeline 时间轴实例
 * @param startTime 动画开始时间戳
 */
function startTimeline(timeline, startTime) {
  //记录上一次回调的时间戳
  var lastTick = +new Date();

  timeline.startTime = startTime;
  nextTick.interval = timeline.interval;
  nextTick();

  /**
   * 每一帧执行的函数
   */
  function nextTick() {
    var now = +new Date();

    timeline.animationHandler = requestAnimationFrame(nextTick);

    //如果当前时间与上一次回调的时间戳相差大于我们设置的间隔时间，表示可以执行一次回调函数。
    if (now - lastTick >= timeline.interval) {
      timeline.onenterframe(now - startTime);
      lastTick = now;
    }
  }
}

/**
 * raf
 */
var requestAnimationFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    //所有都不支持，用setTimeout兼容
    function (callback) {
      return window.setTimeout(callback, (callback.interval || DEFAULT_INTERVAL)); // make interval as precise as possible.
    };
})();

/**
 * cancel raf
 */
var cancelAnimationFrame = (function () {
  return window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.oCancelAnimationFrame ||
    function (id) {
      window.clearTimeout(id);
    };
})();

module.exports = Timeline;

/***/ })
/******/ ]);
});