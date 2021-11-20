<template>
    <div id="password">
        <div class="title_block">
            <div class="title">修改密码</div>
        </div>
        <div class="table_block">
            <el-form class="form" ref="passForm" :model="passForm" label-width="100px" label-position="left" :rules="passRules" v-loading="isLoading">
                <el-form-item label="新密码" prop="password">
                    <el-input v-model="passForm.password" maxLength="20" type="password"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirm">
                    <el-input v-model="passForm.confirm" maxLength="20" type="password"></el-input>
                </el-form-item>
                <div class="add_footer">
                    <el-button type="primary" @click="changePass('passForm')">确定</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'password',
    data(){
        //导入表单，确认密码的验证
        var confirmPasswordRule = (rule, value, callback) => {
            if (value !== this.passForm.password){
                callback(new Error('两次输入的密码不一致'));
            }else{
                callback();
            }
        };

        return{
            isLoading: false,
            passForm: {
                password: "",
                confirm: ""
            },
            passRules:{
                password: [
                    {required: true, message: "请输入密码", trigger: 'blur'},
                    {min: 6, message: "密码长度不能少于6位", trigger: 'blur'}
                ],
                confirm:[
                    {required: true, message: "请确认密码", trigger: 'blur'},
                    {validator: confirmPasswordRule, trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        changePass(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    alert(this.userName)
                }else{

                }
            })
        }
    }
}
</script>

<style scoped>
div {
  box-sizing: border-box;
}

#password{
  padding: 10px 30px 10px 30px;
  height: 100%;
}

.title_block{
  display: flex;
  align-items: center;
  width: 100%;
  height: 10%;
  padding-bottom: 20px;
}

.title{
  font-size: 25px;
  margin-right: 20px;
}

.form{
    width: 50%;
}

.table_block{
  height: 70%;
  padding-top: 20px;
}

.add_footer{
    padding-top: 30px;
}
</style>