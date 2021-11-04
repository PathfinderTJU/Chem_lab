<template>
    <div id="plan_day">
        <!-- 标题 -->
        <div class="title_block">
            <div class="title">日开放计划</div>
        </div>
        <!-- 新增 -->
        <div class="option_block">
            <div class="add_block">
                <el-input v-model="newName" placeholder="请输入新计划名称"></el-input>
                <el-button id="add_button" type="primary" @click="addPlan">新增</el-button>
            </div>
        </div>
        <!-- 表格 -->
        <div class="table_block">
            <el-table :data="planData" height="100%" border stripe>
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column v-for="item in time" :key="item.value" :prop="item.plan" :label="item.label">
                    <template slot-scope="scope">
                        <el-switch :disabled="scope.row.id < 2 || isDisabled" v-model="scope.row.plan[item.value]" @change="changePlan"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.id > 1" type="text" size="small" @click="openEdit(scope)">编辑</el-button>
                        <template v-if="scope.row.id > 1">
                            <el-popconfirm title="确定删除吗?" @confirm="deleteData(scope)">
                                <el-button type="text" size="small" slot="reference">删除</el-button>
                            </el-popconfirm>
                        </template>
                        <template v-else>已锁定</template>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 编辑名称弹窗 -->
        <el-dialog title="编辑名称" :visible.sync="editFormVisible">
            <el-form ref="editForm" :model="editForm" label-width="100px" label-position="left" :rules="editRules" v-loading="isLoading">
                <el-form-item label="用户名" prop="name">
                    <el-input v-model="editForm.name" maxLength="20"></el-input>
                </el-form-item>
                    <div class="add_footer">
                        <el-button type="primary" @click="editSubmit('editForm')" :disabled="isDisabled">确定</el-button>
                        <el-button @click="editCancel">取消</el-button>
                    </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'plan_day',
    data(){
        return{
            planData: [
                // 【数据结构】日开放计划数据
                // {
                //   name：string
                //   plan: boolean array(10)
                // }
                {
                    id: 0,
                    name: "全天开放",
                    plan: [true, true, true, true, true, true, true, true, true, true]
                },
                {
                    id: 1,
                    name: "不开放",
                    plan: [false, false, false, false, false, false, false, false, false, false]
                }
                ,
                {
                    id: 2,
                    name: "晚上开放",
                    plan: [false, false, false, false, false, true, true, true, true, true]
                }
            ],
            time: [
                {value: 0, label:"第一节\n8:30-10:00"},
                {value: 1, label:"第二节\n10:25-11:55"},
                {value: 2, label:"第三节\n12:00-13:30"},
                {value: 3, label:"第四节\n13:35-15:05"},
                {value: 4, label:"第五节\n15:25-16:55"},
                {value: 5, label:"第六节\n18:30-20:00"},
                {value: 6, label:"第七节\n20:25-21:55"}
            ],
            newName: "", //新名称,
            editFormVisible: false,
            editForm: {},
            isLoading: false,
            isDisabled: false,
            editRules: {
                name: [
                    {required: true, message: "请输入名称", trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        // 新增日开放计划
        addPlan(){
            let that = this;
            let name = this.newName;

            // 验证合法性
            if (name === ""){
                return false;
            }
            
            // 拼接请求数据结构
            let request = {};
            request.name = name;
            request.items = new Array(10);
            for (let i = 0 ; i < 10 ; i++){
                request.items.push(false);
            }

            // 网络请求
            fetch(this.URL + "api/daily-open-plans/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            }).then(res => {
                if (res.status === 200){
                    return res.json();
                }else if (res.status === 401){
                    return Promise.reject(0);
                }else{
                    return Promise.reject(res.status);
                }
            }).then(res => {
                console.log(res);
            }).catch(code => {
                if (code === 0){ // 登录验证过期
                    that.$message({
                    message: "登录已过期，请重新登录",
                    type: 'error'
                    })
                    that.$router.push("/login");
                    return false;
                }else {
                    that.$message({
                    message: "未知错误，错误码：" + code,
                    type: 'error'
                    })
                    return false;
                } 
            })
        },
        // 修改日开放计划
        changePlan(){
            this.isDisabled = true;
        },
        // 删除日开放计划
        deleteData(scope){
            let id = scope.row.id;
        },
        // 向编辑表单中填充数据
        openEdit(scope){
            //填充数据
            let index = scope.$index;
            this.editForm = JSON.parse(JSON.stringify(this.planData[index]));
            this.editFormVisible = true;
        },
        // 提交编辑表单
        editSubmit(formName){
            //禁用按钮
            this.isDisabled = true;
            let that = this;
            let data = this.editForm;

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
        // 取消提交编辑表单
        editCancel(){
            this.editFormVisible = false;
            this.$refs["editForm"].resetFields();
        },  
    },
    created() {
        let that = this;

        fetch(this.URL + "api/daily-open-plans/").then(res => {
            if (res.status === 200){
                return res.json();
            }else if (res.status === 401){
                return Promise.reject(0);
            }else{
                return Promise.reject(res.status);
            }
        }).then(res => {
            console.log(res); 
        }).catch(code => {
            if (code === 0){ // 登录验证过期
                that.$message({
                  message: "登录已过期，请重新登录",
                  type: 'error'
                })
                that.$router.push("/login");
                return false;
            }else {
                that.$message({
                  message: "未知错误，错误码：" + code,
                  type: 'error'
                })
                return false;
            } 
        })
    },
}
</script>

<style>
.el-table .cell{
  white-space: pre-line;
}
</style>

<style scoped>
div {
  box-sizing: border-box;
}

#plan_day{
  padding: 10px 30px 10px 30px;
  height: 100%;
}

.title_block, .option_block, .add_block{
  display: flex;
  align-items: center;
}

.title_block, .option_block{
  width: 100%;
  height: 10%;
  padding-bottom: 20px;
}

.title{
  font-size: 25px;
}

#add_button{
  margin-left: 20px;
}

.table_block{
  height: 70%;
}
</style>