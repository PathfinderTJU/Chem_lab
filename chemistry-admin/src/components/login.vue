<template>
    <div id="login">
        <div class="outside_block">
            <div class="logo_block">
                <img src="../assets/pictures/logo.png" id="logo"/>
            </div>
            <div class="title">管理后台</div>
            <div class="form_block">
                <el-form ref="form" :model="form" :rules="rules">
                  <div class="el_title">密码：</div>
                  <el-form-item  prop="password">
                      <el-input v-model="form.password" clearable show-password></el-input>
                  </el-form-item>
                  <el-form-item id="submit_item">
                      <el-button id="submit" type="primary" @click="onSubmit('form')" :disabled="isDisabled">登录</el-button>
                  </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import JSEncrypt from 'jsencrypt'
export default {
    name: 'login',
    data(){
        return {
            isDisabled: false,
            form: {
                password: ""
            },
            rules: {
                password: [
                    {required: true, message: "请输入密码", trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
      onSubmit(formName){
        let that = this;

        //加密
        let encryptor = new JSEncrypt()
        encryptor.setPublicKey(that.PUBLICKEY);
        let encrypassword = encryptor.encrypt(this.form.password);



        let request = new FormData();
        request.append("username", "admin");
        request.append("password", encrypassword);


        this.$refs[formName].validate((valid) => {
          if (valid) {
            fetch(that.URL + 'login', {
              method: 'POST',
              body: request
            }).then(res => res.json()).then(res => {
              console.log(res);
              if (res.status === "succeed"){
                let token = res.message;
                localStorage.setItem("token", token);
                
                that.$message({
                  message: "登录成功",
                  type: 'success'
                })
                that.$router.push("/index");
              }else{
                that.$message({
                  message: "用户名与密码错误",
                  type: 'error'
                })
              }
            }).catch(err => {
              that.$message({
                message: "登录失败，服务器出错",
                type: 'error'
              })
            })
          }else{
            console.log("error");
            return false;
          }
        })
      }
    }
}
</script>

<style scoped>
#login{
  width: 100%;
  display: flex;
  justify-content: center;
}

.outside_block{
  width: 300px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

#logo{
  width: 300px;
}

.title{
    margin-top: 15px;
  font-size: 30px;
  font-weight:lighter;
}

.form_block{
  width: 90%;
  padding: 30px;
  margin-top: 15px;
}

.el_title{
  margin-bottom: 10px;
}

#submit_item{
  margin: 30px 0 0 0;
}

button{
  width: 100%;
}
</style>