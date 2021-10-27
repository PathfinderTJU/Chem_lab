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
import empty from '@/components/empty'

Vue.use(Router)

export default new Router({
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
                    path: 'announcement',
                    component: announcement
                },
                {
                    path: '*',
                    component: empty
                }
            ]
        },
        {
            path: '*',
            component: empty
        }
    ]
})