<template>
    <div id="announcement">
        <div id="title">
            编辑公告
            <el-button id="edit_button" type="text" @click="openEdit">编辑</el-button>
        </div>
        <p id="content" v-html="content"> </p>
        <el-dialog title="编辑关于我们信息" :visible.sync="editFormVisible">
            <el-form ref="editForm" :model="editForm" :rules="rules">
                <el-form-item prop="content">
                    <el-input rows="15" v-model="editForm.content" type="textarea" clearable></el-input>
                </el-form-item>
                <div class="add_footer">
                    <el-button type="primary" @click="editSubmit('editForm')">确定</el-button>
                    <el-button @click="editFormVisible = false">取消</el-button>
                </div>
            </el-form>
        </el-dialog>
    </div>  
</template>

<script>
export default {
    name: 'announcement',
    data(){
        return{
            content: "xxxxxxxxxxxxxxxxxxx\nxxxxxxxx\n\nxxxx",
            editForm: {},
            editFormVisible: false,
            rules: {
                content: [
                    {required: true, message: "内容不能为空", trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        openEdit(){
            this.editForm = {
                content: this.content
            };
            this.editFormVisible = true;
        },
        editSubmit(formName){
            let that = this;
            let value = this.editForm.content;

            this.$refs[formName].validate((valid) => {
                //检查内容不为空
                if (valid){ 
                    console.log("pass")
                    // 【网络请求】修改公告内容，返回修改后的结果
                    // 请求类型：POST
                    // 参数：token：string，value：string
                    // 返回值：data：string

                }else{
                    console.log("reject")
                    return false    
                }
            })
        }
    },
    created(){
        // 【网络请求】请求公告内容
        // 请求类型：GET
        // 参数：无
        // 返回值：data: string
    }
}
</script>

<style scoped>
#announcement{
    padding: 10px 30px 10px 30px;
}

#title{
    margin-bottom: 20px;
    font-size: 25px;
}

#content{
    width: 70%;
    white-space: pre-line;
}

#edit_button{
    position: relative;
    left: 10px;
}
</style>