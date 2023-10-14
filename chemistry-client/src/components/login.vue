<template>
    <div id="login">
        <el-container height="100%">
            <el-header class="header" height="100px">
                <img src="../assets/logo.png"/>
            </el-header>
            <el-main class="main">
                <div class="title_block">
                    <div id="title">{{webName}}</div>
                    <div class="description"></div>
                    <div class="description"></div>
                </div>
                <div class="form_block">
                    <div class="login_form_block">
                        <div class="option_block">
                            <span id="student_option" :class="[type ? 'chosed' : 'not_chosed']" @click="changeType(true)">学生登录</span>
                            <span>|</span>
                            <span id="teacher_option" :class="[type ? 'not_chosed' : 'chosed']" @click="changeType(false)">教师登录</span>
                        </div>
                        <el-form ref="form" :model="form" :rules="rules" label-width="100px" label-position="top" v-loading="isLoading">
                            <el-form-item prop="username">
                                <div class="form_item_title">用户名</div>
                                <el-input v-model="form.username" clearable></el-input>
                            </el-form-item>
                            <el-form-item prop="password">
                                <div class="form_item_title">密码</div>
                                <el-input v-model="form.password" clearable show-password></el-input>
                            </el-form-item>
                            <el-form-item id="submit_item">
                                <el-button id="submit" type="primary" @click="onSubmit('form')">登录</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script>
export default {
    name: 'login',
    data(){
        return{
            webName: this.webName,
            type: true, //登录类型，true为学生，false为教师
            form: { // 用户信息表单
                username: "",
                password: ""
            },
            isLoading: false, // 控制加载状态
            rules: {
                username: [
                    {required: true, message: "请输入用户名", trigger: 'blur'}
                ],
                password: [
                    {required: true, message: "请输入密码", trigger: 'blur'}
                ]
            } // 登录表单验证规则
        }
    },
    methods: {
        onSubmit(formName){
            let that = this;
            let request = this.form;

            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                    // 开始加载
                    this.isLoading = true;

                    fetch(this.URL + "api/auth/login", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(request)
                    }).then(res => res.json()).then(res => {
                        // 停止加载
                        that.isLoading = false;
                        if (res.success){
                            if (that.type && res.data.Role === "ROLE_stu"){
                                localStorage.setItem("token", res.data.token);
                                sessionStorage.setItem("userName", request.username);
                                sessionStorage.setItem("userId", res.data.id);
                                localStorage.setItem("userType", true); // 不能被用户修改的地方

                                this.$message({
                                    message: "登录成功",
                                    type: 'success'
                                })
                                this.$router.push("/index");
                            }else if (!that.type && res.data.Role === "ROLE_teacher"){
                                console.log(1);
                                localStorage.setItem("token", res.data.token);
                                sessionStorage.setItem("userName", request.username);
                                sessionStorage.setItem("userId", res.data.id);
                                localStorage.setItem("userType", false);

                                this.$message({
                                    message: "登录成功",
                                    type: 'success'
                                })
                                this.$router.push("/index");
                            }else{
                                this.$message({
                                    message: "无效的用户类型",
                                    type: 'error'
                                })
                            }
                        }else{
                            if (res.status === 403){
                                this.$message({
                                    message: "用户名或密码错误",
                                    type: 'error'
                                })
                            }else{
                                this.$message({
                                    message: "未知错误" + res.status,
                                    type: 'error'
                                })
                            }
                        }
                    }).catch(err => {
                        that.isLoading = false;
                        this.$message({
                            message: "加载失败，服务器出错" + err,
                            type: 'error'
                        })
                        return false;
                    });                  
                } else {
                    return false;
                }
            })
        },
        // 改变登录用户类型
        changeType(now){
            if (this.type !== now){
                this.type = !this.type
            }
        }
    },
    mounted() {
        // 检查是否已经登录过了
        fetch(this.URL + "api/auth/whoami", {
            method: 'GET',
            headers: {
                Authorization: 'Bearer  ' + localStorage.getItem("token")
            }
        }).then(res => res.json()).then(res => {
            if (res.success){
                // 必须是学生或教师账户，防止用户通过修改token绕过登录
                if (res.data.authorities[0].authority === "ROLE_stu" || res.data.authorities[0].authority === "ROLE_teacher"){
                    this.$message({
                        message: "已登录",
                        type: 'success'
                    })
                    // 一次会话后session会被清空，需要重新设置
                    sessionStorage.setItem("userName", res.data.principal.user.username);
                    this.$router.push("/index");
                }else{
                    this.$message({
                        message: "无效的用户类型",
                        type: 'error'
                    })
                }
            }else{
                return false;
            }
        }).catch(err => {
            this.$message({
                message: "加载失败，服务器出错" + err,
                type: 'error'
            })
            return false;
        });  
    },
}
</script>

<style scoped>
#login{
    background-image: url("../assets/bg.jpg");
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    background-attachment: fixed;
    width: 100%;
    height: 100%;
}

.header{
    height: 100px;
    display: flex;
    align-items: center;
}

.el-container{
    height: 100%;
}

.main{
    height: 100%;
    display: flex;
    flex-wrap: wrap;
}

.title_block, .form_block{
    height: 100%;
    text-align: center;
}

.title_block{
    width: 55%;
    display: flex;
    flex-wrap: wrap;
    align-content: center;
}

#title{
    font-size: 40px;
    color: white;
    margin-bottom: 30px;
    width: 100%;
}

.description{
    color: #ffbe3a;
    width: 100%;
}

.form_block{
    width: 45%;
    display: flex;
    align-items: center;
}

.login_form_block{
    box-sizing: border-box;
    background-color: white;
    width: 75%;
    height: 100%;
    border-radius: .5em;
    padding: 50px 60px;
    display: flex;
    flex-wrap: wrap;
    align-content: space-around;
    align-items: center;
    justify-content: center;
}

.option_block{
    width: 100%;
    text-align: center;
}

.option_block span{
    font-size: 35px;
    cursor: pointer;
    padding-bottom: 10px;
    user-select: none;
}

.chosed{
    color: black;
    border-bottom-style: solid;
    border-bottom-width: 2px;
    border-bottom-color: #409EFF;
}

.not_chosed{
    color: rgb(128, 127, 127);
    border-bottom-style: none;
}

.el-form{
    width: 100%;
}

.form_item_title{
    text-align: left;
}

#submit, #change_button{
    width: 100%;
}

#submit{
    margin-top: 20px;
}
</style>