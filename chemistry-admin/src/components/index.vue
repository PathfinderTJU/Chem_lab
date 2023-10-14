<template>
    <div id="index">
        <el-container class="outside">
            <!-- 顶部 -->
            <el-header height="100px" class="header">
                <div class="logo_block">
                    <img id="logo" src="../assets/pictures/logo.png"/>
                </div>
                <div id="title">{{ webName }}</div>
                <el-button id="logout" @click="logout" type="text">退出登录</el-button>
            </el-header>
            <el-container class="container">
                <!-- 侧边栏 -->
                <el-aside width="20%" class="aside">
                    <el-menu :default-active="$route.path" class="el-menu-vertical-demo" router>
                        <el-menu-item index="/index/account">
                            <span slot="title">账户管理</span>
                        </el-menu-item>
                        <el-submenu index="/index/device">
                            <span slot="title">设备管理</span>
                            <el-menu-item index="/index/device">
                                <span slot="title">设备管理</span>
                            </el-menu-item>
                            <el-menu-item index="/index/init">
                                <span slot="title">初始值设置</span>
                            </el-menu-item>
                        </el-submenu>
                        <el-submenu index="/index/plan">
                            <span slot="title" >开放计划管理</span>
                            <el-menu-item index="/index/plan">
                                <span slot="title">开放情况</span>
                            </el-menu-item>
                            <el-menu-item index="/index/plan_reserve">
                                <span slot="title">预约情况</span>
                            </el-menu-item>
                            <el-menu-item index="/index/plan_day">
                                <span slot="title">日开放计划</span>
                            </el-menu-item>
                            <el-menu-item index="/index/plan_edit">
                                <span slot="title">管理开放时段</span>
                            </el-menu-item>
                        </el-submenu>
                        <!-- <el-menu-item index="/index/announcement">
                            <span slot="title">公告管理</span>
                        </el-menu-item> -->
                        <el-menu-item index="/index/password">
                            <span slot="title">修改密码</span>
                        </el-menu-item>
                    </el-menu>
                </el-aside>
                <!-- 主要路由块 -->
                <el-main class="main">
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
export default {
    name: 'index',
    data(){
        return{
            webName: this.webName
        }
    },
    methods: {
        logout(){
            localStorage.setItem("token", "");
            sessionStorage.setItem("userName", "");
            this.$message({
                message: "已退出",
                type: 'success'
            })
            this.$router.replace("/login");
        }
    }
}
</script>

<style scoped>
#index, .outside{
    height: 100%;
}

.header{
    width: 100%;
}

.logo_block{
    width: 20%;
    text-align: center;
}

#logout{
    margin-left: 30px;
}


#logo{
    height: 100px;
}

#title{
    font-size: 30px;
    padding-left: 30px;
}

.header{
    display: flex;
    align-items: center;
    padding: 0;
}

.container{
    height: 100%;
    overflow-y: auto;
}

.aside{
    overflow-x: hidden;
    height: 100%;
}

.main{
    padding: 0;
    height: 100%;
}
</style>