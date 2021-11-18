<template>
    <div id="login">
        <el-container height="100%">
            <el-header class="header" height="100px">
                <img src="../assets/logo.png"/>
            </el-header>
            <el-main class="main">
                <div class="title_block">
                    <div id="title">化工虚拟实验平台</div>
                    <div class="description">天津大学化工学院</div>
                    <div class="description">Xingyu Liu 2021.11</div>
                </div>
                <div class="form_block">
                    <div class="login_form_block" v-if="!changePass">
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
                                <el-button id="submit" type="primary" @click="onSubmit('form')" :disabled="isDisabled">登录</el-button>
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
            type: true, //登录类型，true为学生，false为教师
            form: { // 用户信息表单
                username: "",
                password: ""
            },
            isLoading: false, // 控制加载状态
            isDisabled: false, // 控制是否可用
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
            this.isDisabled = true;

            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                //恢复按钮
                that.isDisabled = false;
                //停止加载
                that.isLoading = false;
                //关闭表单
                that.editFormVisible = false; 

                } else {
                    //恢复按钮
                    that.isDisabled = false;
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
    }
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