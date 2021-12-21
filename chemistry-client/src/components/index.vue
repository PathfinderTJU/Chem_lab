<template>
    <div id="index">
        <el-container class="outside">
            <!-- 顶部 -->
            <el-header height="100px" class="header">
                <div class="logo_block">
                    <img id="logo" src="../assets/logo2.png"/>
                </div>
                <div id="title">化工虚拟实验平台</div>
                <el-button id="logout" @click="logout" type="text">退出登录</el-button>
            </el-header>
            <el-container class="container">
                <!-- 侧边栏 -->
                <el-aside width="20%" class="aside">
                    <el-menu :default-active="$route.path" class="el-menu-vertical-demo" router>
                        <el-menu-item index="/index/reserve">
                            <span slot="title" v-if="userInfo.userType">预约试验</span>
                            <span slot="title" v-else>预约情况</span>
                        </el-menu-item>
                        <el-menu-item index="/index/my_reserve" v-if="userInfo.userType">
                            <span slot="title">我的预约</span>
                        </el-menu-item>
                        <el-menu-item index="/index/enter">
                            <span slot="title">进入实验</span>
                        </el-menu-item>
                        <el-menu-item index="/index/mine">
                            <span slot="title" v-if="userInfo.userType">我的实验</span>
                            <span slot="title" v-else>学生实验</span>
                        </el-menu-item>
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
    methods: {
        logout(){
            localStorage.setItem("token", "");
            this.$message({
                message: "已退出",
                type: 'success'
            })
            this.$router.replace("/login");
        }
    },
}
</script>

<style scoped>
#index, .outside{
    height: 100%;
}

.header{
    width: 100%;
}

#logout{
    margin-left: 30px;
}

.logo_block{
    width: 20%;
    text-align: center;
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