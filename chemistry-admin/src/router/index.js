import Vue from 'vue'
import Router from 'vue-router'
import login from '@/components/login'
import index from '@/components/index'
import account from '@/components/account'
import device from '@/components/device'
import plan from '@/components/plan'
import plan_day from '@/components/plan_day'
import plan_edit from '@/components/plan_edit'
import announcement from '@/components/announcement'
import init from '@/components/init'
import close from '@/components/close'
import empty from '@/components/empty'
import plan_reserve from '@/components/plan_reserve'
import password from '@/components/password'

Vue.use(Router)

export default new Router({
    base: "/admin",
    mode: 'hash',
    routes: [{
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            component: login
        },
        {
            path: '/index',
            meta: {
                requireAuth: true
            },
            component: index,
            children: [{
                    path: '/',
                    redirect: '/index/account'
                },
                {
                    path: 'account',
                    component: account
                },
                {
                    path: 'device',
                    component: device
                },
                {
                    path: 'plan',
                    component: plan
                },
                {
                    path: 'plan_day',
                    component: plan_day
                },
                {
                    path: 'plan_edit',
                    component: plan_edit
                },
                {
                    path: 'plan_reserve',
                    component: plan_reserve
                },
                // {
                //     path: 'announcement',
                //     component: announcement
                // },
                {
                    path: 'password',
                    component: password
                },
                {
                    path: 'init',
                    component: init
                },
                // {
                //     path: 'close',
                //     component: close
                // },
                {
                    path: '*',
                    component: empty
                }
            ]
        },
        {
            path: '*',
            redirect: '/index'
        }
    ]
})