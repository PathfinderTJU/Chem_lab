<template>
    <div id="login">
        <div class="outside_block">
            <div class="logo_block">
                <img src="../assets/pictures/logo.png" id="logo"/>
            </div>
            <div class="title">管理后台</div>
            <div class="form_block">
                <el-form ref="form" :model="form" :rules="rules">
                  <div class="el_title">用户名：</div>
                  <el-form-item  prop="username">
                      <el-input v-model="form.username" clearable></el-input>
                  </el-form-item>
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
export default {
    name: 'login',
    data(){
        return {
            isDisabled: false,
            form: {
                username: "",
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
        let request = this.form;

        this.$refs[formName].validate((valid) => {
          	if (valid) {
				fetch(this.URL + "api/auth/login", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                }).then(res => res.json()).then(res => {
                    if (res.success){
                        if (res.data.Role === "ROLE_admin"){
                            localStorage.setItem("token", res.data.token);
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
                    this.$message({
                        message: "加载失败，服务器出错" + err,
                        type: 'error'
                    })
                    return false;
                });  
          	}else{
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