// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

const URL = "http://localhost:8080";
// var userType = true;
var userType = false;

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.prototype.URL = URL;
Vue.prototype.PUBLICKEY = "";
Vue.prototype.userType = userType;
Vue.prototype.userName = "default";

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})

// 页面跳转token检查
// router.beforeEach((to, from, next) => {
//     if (to.matched.some(record => record.meta.requireAuth)) { //遍历路由（所有匹配的路由）中是否有需要登录验证的
//         //请求token是否存在
//         let token = localStorage.getItem("token");
//         //无登录信息
//         if (token === null) {
//             console.log("需要登录");
//             next({
//                 path: '/login'
//             })
//             return false;
//         } else {
//             //验证是否过期
//             let request = new FormData();
//             request.append("token", localStorage.getItem("token"));

//             fetch(URL + "ping", {
//                 method: 'POST',
//                 body: request
//             }).then(res => res.json()).then(res => {
//                 console.log(res);
//                 if (res.status === "failed" && (res.error === "token解析失败" || res.error.split("expired").length === 2)) {
//                     console.log("需要登录");
//                     alert("登录已过期，请重新登录")
//                     next({
//                         path: '/login'
//                     })
//                     return false;
//                 } else {
//                     next();
//                 }
//             }).catch(err => {
//                 console.log(err);
//                 alert("网络错误，请检查你的网络设置")
//             })
//         }
//     } else {
//         next();
//     }
// })