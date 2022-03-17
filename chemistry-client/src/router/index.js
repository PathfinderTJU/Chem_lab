import Vue from 'vue'
import Router from 'vue-router'
import empty from '@/components/empty'
import enter from '@/components/enter'
import index from '@/components/index'
import login from '@/components/login'
import mine from '@/components/mine'
import my_reserve from '@/components/my_reserve'
import reserve from '@/components/reserve'
import absorptionDesorption from '@/components/absorptionDesorption'
import conductHeat from '@/components/conductHeat'
import flowProcess from '@/components/flowProcess'
import rectification from '@/components/rectification'
import password from '@/components/password'

Vue.use(Router)

export default new Router({
    base: '/lab',
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
                    redirect: '/index/reserve'
                },
                {
                    path: 'reserve',
                    component: reserve
                },
                {
                    path: 'my_reserve',
                    component: my_reserve
                },
                {
                    path: 'enter',
                    component: enter
                },
                {
                    path: 'mine',
                    component: mine
                },
                {
                    path: 'password',
                    component: password
                },
                {
                    path: '*',
                    component: empty
                }
            ]
        },
        {
            path: '/absorptionDesorption',
            meta: {
                requireAuth: true
            },
            component: absorptionDesorption,
        },
        {
            path: '/conductHeat',
            meta: {
                requireAuth: true
            },
            component: conductHeat,
        },
        {
            path: '/flowProcess',
            meta: {
                requireAuth: true
            },
            component: flowProcess,
        },
        {
            path: '/rectification',
            meta: {
                requireAuth: true
            },
            component: rectification,
        },
        {
            path: '*',
            redirect: '/index'
        }
    ]
})