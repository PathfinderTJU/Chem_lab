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
            <el-table :data="planData" height="100%" border stripe @header-click="changeTime" :header-cell-class-name="setPointer">
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column v-for="(item, index) in time" :key="item.value" :prop="item.plan" :label="item.label + '\n' + item.start + '-' + item.end" :index="index">
                    <template slot-scope="scope">
                        <el-switch :disabled="scope.row.id <= 2 || isDisabled" v-model="scope.row.items[item.value]" @change="changePlan(scope)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.id > 2" type="text" size="small" @click="openEdit(scope)">编辑</el-button>
                        <template v-if="scope.row.id > 2">
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
        <el-dialog title="编辑名称" :visible.sync="editFormVisible" @close="closeDialog('editForm')">
            <el-form ref="editForm" :model="editForm" label-width="100px" label-position="left" :rules="editRules" v-loading="isLoading">
                <el-form-item label="计划名称" prop="name">
                    <el-input v-model="editForm.name" maxLength="20"></el-input>
                </el-form-item>
                    <div class="add_footer">
                        <el-button type="primary" @click="editSubmit('editForm')" :disabled="isDisabled">确定</el-button>
                        <el-button @click="editCancel">取消</el-button>
                    </div>
            </el-form>
        </el-dialog>
        <!-- 编辑时间弹窗 -->
        <el-dialog title="编辑时段起止时间" :visible.sync="timeFormVisible" @close="closeDialog('timeForm')">
            <el-form ref="timeForm" :model="timeForm" label-width="100px" label-position="left" :rules="timeRules" v-loading="isLoading">
                <div style="padding-bottom: 30px">{{timeForm.label}}</div>
                <el-form-item label="开始时间" prop="start">
                    <el-input v-model="timeForm.start" maxLength="20"></el-input>
                </el-form-item>
                <el-form-item label="结束时间" prop="end">
                    <el-input v-model="timeForm.end" maxLength="20"></el-input>
                </el-form-item>
                    <div class="add_footer">
                        <el-button type="primary" @click="timeSubmit('timeForm')" :disabled="isDisabled">确定</el-button>
                        <el-button @click="timeCancel">取消</el-button>
                    </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'plan_day',
    data(){
        // 起始时间检查函数
        var timeStartRule =  (rule, value, callback) => {
            let strs = value.split(":");

            // 检查时间格式：有时间冒号、左右都是数字、小时为0-23，分钟为0-59
            if (strs.length !== 2 || isNaN(+strs[0]) || isNaN(+strs[1]) || +strs[0] < 0 || +strs[0] >= 24 || +strs[1] < 0 || +strs[1] >= 60){
                callback(new Error('请输入正确的时间格式'));
            }

            // 检查时间比结束时间早
            let endStrs = this.timeForm.end.split(":");
            if (+strs[0] > +endStrs[0] || (+strs[0] === +endStrs[0] && +strs[1] >= +endStrs[1])){
                callback(new Error('请输入合法时间段'));
            }

            // 检查与周围时间段无重叠 起始时间要晚于上一时段的结束时间
            if (this.timeForm.value !== 0){ // 最早的不需要判断
                let lastStrs = this.time[this.timeForm.value - 1].end.split(":");
                if (+strs[0] < +lastStrs[0] || (+strs[0] === +lastStrs[0] && +strs[1] <= +lastStrs[1])){
                    callback(new Error('早于上一时段结束时间'));
                }
            }
            callback();
        };

        // 结束时间检查函数
        var timeEndRule =  (rule, value, callback) => {
            let strs = value.split(":");

            // 检查时间格式：有时间冒号、左右都是数字、小时为0-23，分钟为0-59
            if (strs.length !== 2 || isNaN(+strs[0]) || isNaN(+strs[1]) || +strs[0] < 0 || +strs[0] >= 24 || +strs[1] < 0 || +strs[1] >= 60){
                callback(new Error('请输入正确的时间格式'));
            }

            // 检查时间比开始时间晚
            let startStrs = this.timeForm.start.split(":");
            if (+strs[0] < +startStrs[0] || (+strs[0] === +startStrs[0] && +strs[1] <= +startStrs[1])){
                callback(new Error('请输入合法时间段'));
            }

            // 检查与周围时间段无重叠 结束时间要早于下一时段的其实时间
            if (this.timeForm.value !== 6){ // 最晚的不需要判断
                let nextStrs = this.time[this.timeForm.value + 1].start.split(":");
                if (+strs[0] > +nextStrs[0] || (+strs[0] === +nextStrs[0] && +strs[1] >= +nextStrs[1])){
                    callback(new Error('晚于下一时段起始时间'));
                }
            }
            callback();
        };
        
        return{
            planData: [],
            time: [
                {value: 0, label:"第一节", start:"8:30", end:"10:00"},
                {value: 1, label:"第二节", start:"10:25", end:"11:55"},
                {value: 2, label:"第三节", start:"12:00", end:"13:30"},
                {value: 3, label:"第四节", start:"13:35", end:"15:05"},
                {value: 4, label:"第五节", start:"15:25", end:"16:55"},
                {value: 5, label:"第六节", start:"18:30", end:"20:00"},
                {value: 6, label:"第七节", start:"20:25", end:"21:55"}
            ],
            newName: "", //新名称,
            editFormVisible: false, //控制编辑名称弹窗
            timeFormVisible: false, //控制编辑时间弹窗
            editForm: {}, //编辑名称表单
            timeForm: {}, //编辑时间表单
            isLoading: false,
            isDisabled: false,
            editRules: {
                name: [
                    {required: true, message: "请输入名称", trigger: 'blur'}
                ]
            },
            timeRules: {
                start: [
                    {required: true, message: "请输入起始时间", trigger: 'blur'},
                    {validator: timeStartRule, trigger: 'blur'}
                ],
                end: [
                    {required: true, message: "请输入终止时间", trigger: 'blur'},
                    {validator: timeEndRule, trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        // 设置表头可点击为小手
        setPointer(scope){
            if (scope.columnIndex > 0 && scope.columnIndex < 8){
                return "pointer_header";
            }
        },
        // 关闭弹窗清空表单
        closeDialog(formName){
            this.$refs[formName].resetFields();
        },
        // 新增日开放计划
        addPlan(){
            let that = this;
            let name = this.newName;

            // 验证合法性
            if (name === ""){
                return false;
            }

            let request = {
                name: name,
                items: [false, false, false, false, false, false, false]
            }
            
            fetch(this.URL + "api/daily-open-plans/", {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token"),
                    'content-type': 'application/json'
                },
                body: JSON.stringify(request)
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.refreshData();
                    this.$message({
                        message: "添加成功",
                        type: 'success'
                    })
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                        this.$router.push("/login");
                    }else if(res.status === 401){
                        this.$message({
                            message: "没有相关权限",
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
            })
        },
        // 修改日开放计划
        changePlan(scope){
            let id = this.planData[scope.$index].id; //计划id
            let sn = scope.column.index; //第几节课，从0开始，0-6
            let nowValue = this.planData[scope.$index].items[sn];
            let type = nowValue ? 'PUT' : 'DELETE';

            fetch(this.URL + "api/daily-open-plans/" + id + "/items/" + sn 
                    + "?id=" + id + "&sn=" + sn, {
                method: type,
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token")
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                        this.$router.push("/login");
                    }else if(res.status === 401){
                        this.$message({
                            message: "没有相关权限",
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
            })
        },
        // 删除日开放计划
        deleteData(scope){
            let id = scope.row.id;

            fetch(this.URL + "api/daily-open-plans/" + id + "?id=" + id, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token")
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.refreshData();
                    this.$message({
                        message: "删除成功",
                        type: 'success'
                    })
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                        this.$router.push("/login");
                    }else if(res.status === 401){
                        this.$message({
                            message: "没有相关权限",
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
            })
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
            this.isLoading = true;
            let that = this;
            let requestData = this.editForm;
            let id = requestData.id;

            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                    fetch(this.URL + "api/daily-open-plans/" + id, {
                        method: 'PUT',
                        headers: {
                            Authorization: 'Bearer  ' + localStorage.getItem("token"),
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify(requestData)
                    }).then(res => res.json()).then(res => {

                        //恢复按钮
                        that.isDisabled = false;
                        //停止加载
                        that.isLoading = false;

                        if (res.success){
                            this.refreshData();
                            this.$message({
                                message: "修改成功",
                                type: 'success'
                            })
                                    
                            //关闭表单
                            that.editFormVisible = false; 
                        }else{
                            if (res.status === 402){
                                this.$message({
                                    message: "登录已过期",
                                    type: 'error'
                                })
                                this.$router.push("/login");
                            }else if(res.status === 401){
                                this.$message({
                                    message: "没有相关权限",
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
                        //恢复按钮
                        that.isDisabled = false;
                        //停止加载
                        that.isLoading = false;

                        this.$message({
                            message: "修改失败，服务器出错" + err,
                            type: 'error'
                        })
                        return false;
                    })
                } else {
                    //恢复按钮
                    that.isDisabled = false;
                    //停止加载
                    that.isLoading = false;

                    return false;
                }
            })
        },
        // 取消提交编辑表单
        editCancel(){
            this.editFormVisible = false;
            this.$refs["editForm"].resetFields();
        },  
        // 修改表头对应时间
        changeTime(column){
            let index = column.index;
            this.timeFormVisible = true;
            this.timeForm = JSON.parse(JSON.stringify(this.time[index]));
        },
        // 未完成，等接口
        // 提交修改时间表单
        timeSubmit(formName){
            //禁用按钮
            this.isDisabled = true;
            let that = this;
            let data = this.timeForm;

            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                //恢复按钮
                that.isDisabled = false;
                //停止加载
                that.isLoading = false;
                //关闭表单
                that.timeFormVisible = false; 

                } else {
                //恢复按钮
                that.isDisabled = false;
                return false;
                }
            })
        },
        // 取消提交编辑表单
        timeCancel(){
            this.timeFormVisible = false;
            this.$refs["timeForm"].resetFields();
        },  
        // 刷新页面数据
        refreshData(){
            fetch(this.URL + "api/daily-open-plans/", {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.planData = res.data;
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                        this.$router.push("/login");
                    }else if(res.status === 401){
                        this.$message({
                            message: "没有相关权限",
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
        }
    },
    mounted() {
        this.refreshData();        
    },
}
</script>

<style>
.el-table .cell{
  white-space: pre-line;
}

.el-table .pointer_header{
    cursor: pointer;
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