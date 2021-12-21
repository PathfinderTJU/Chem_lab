// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

const URL = "http://localhost:8080/";

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.prototype.URL = URL;
Vue.prototype.PUBLICKEY = "";
Vue.prototype.userInfo = { // 挂载在原型上的全局变量是只读的，但可以绑定一个引用类型，内容可以改变
    userName: "",
    userType: ""
};

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})