<template>
    <div id="plan_edit">
        <!-- 标题 -->
        <div class="title_block">
            <div class="title">管理开放时段</div>
        </div>
        <!-- 表单 -->
        <div class="table_block">
             <el-form ref="addForm" :model="addForm" label-position="top" label-width="100px" :rules="addRules" v-loading="isLoading" element-loading-text="生成预约票中，请耐心等待...">
                <el-form-item id="devices_choice" label="选择设备" prop="devices">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">全选</el-checkbox>
                    <el-checkbox-group v-model="addForm.devices" @change="deviceChange">
                        <el-checkbox v-for="item in deviceData" :label="item.id" :key="item.id">{{types[item.type]}}: {{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="选择时间与计划" prop="date">
                    <el-date-picker v-model="addForm.date" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
                </el-form-item>
                <el-form-item prop="plan">
                    <el-table :data="plans" height="100%" border>
                        <el-table-column v-for="(item, index) in weekdays" :key="item" prop="dailyPlans[index]" :label="item">
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.dailyPlans[index]">
                                    <el-option v-for="plan in planData" :key="plan.name" :label="plan.name" :value="plan.id"></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form-item>
                <div class="add_footer">
                    <el-button type="primary" @click="submit('addForm')" :disabled="isDisabled">确定</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    name: "plan_edit",
    data(){
        // 计划完整性检查函数
        var planRule =  (rule, value, callback) => {
            let temp = this.plans[0].dailyPlans;
            for (let i = 0 ; i < temp.length ; i++){
                if (temp[i] === ""){
                    callback(new Error('请选择完整的开放计划'));
                    break;
                }
            }
    
            callback();
        };

        return{
            deviceData: [], // 设备信息
            planData: [], // 开放计划信息
            types: {
                "A": "精馏", 
                "B": "吸收-解吸", 
                "C": "化工传热", 
                "D": "流动过程"
            }, //设备类型显示字符
            weekdays: ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"], //星期显示字符
            addForm: { // 表单
                devices: [],
                date: ""
            },
            isIndeterminate: false, //控制全选选项卡是否为模糊（半选中）
            checkAll: false, //控制全选选项卡是否选中
            isLoading: false, //控制加载图
            isDisabled: false, //控制按钮禁用
            addRules: { //表单验证规则
                devices: [
                    {required: true, message: "请至少选择一个设备", trigger: 'blur'}
                ],
                date: [
                    {required: true, message: "请选择时间段", trigger: 'blur'}
                ],
                plan: [
                    {validator: planRule, trigger: 'blur'},
                    {message: "请选择计划", trigger: 'blur'}
                ]
            },
            plans: [{
                dailyPlans: ["", "", "", "", "", "", ""]
            }] // 表格内存储每日开放计划的数据
        }
    },
    methods: {
        // 全选被点击，要么从未勾选或模糊态变为选中，要么从选中变为未勾选
        checkAllChange(){
            // 无论如何，都脱离了模糊态
            this.isIndeterminate = false;

            // 未选中或模糊态，变为全选中
            if (this.addForm.devices.length !== this.deviceData.length){
                this.checkAll = true;
                this.addForm.devices = [];
                for (let i = 0 ; i < this.deviceData.length ; i++){
                    this.addForm.devices.push(this.deviceData[i].id);
                }
            }else{ //全选中，变为未选中
                this.checkAll = false;
                this.addForm.devices = [];
            }
        },
        // 某一个设备被点击，判断全选框状态是否会改变
        deviceChange(){
            // 分别判断是否全部选中/全部未选中/部分选中
            if (this.addForm.devices.length === this.deviceData.length){
                this.checkAll = true;
                this.isIndeterminate = false;
            }else if (this.addForm.devices.length === 0){
                this.checkAll = false;
                this.isIndeterminate = false;
            }else{
                this.checkAll = false;
                this.isIndeterminate = true;
            }
        },
        // 提交 
        submit(formName){
            let that = this;

            //禁用按钮
            this.isDisabled = true;
            this.isLoading = true;

            let data = this.addForm;
            let requestData = {
                startDate: data.date[0].toLocaleDateString().replaceAll("/", "-"),
                endDate: data.date[1].toLocaleDateString().replaceAll("/", "-"),
                resourceIds: data.devices,
                dailyOpenPlanIds: this.plans[0].dailyPlans
            }

            //判断合法输入
            this.$refs[formName].validate((valid) => {
                if (valid) { 
                    fetch(this.URL + "api/tickets/by-weeks", {
                        method: 'POST',
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
                            this.$message({
                                message: "开放时段添加成功",
                                type: 'success'
                            })

                            // 恢复表单状态
                            this.$refs["addForm"].resetFields();
                            this.plans[0].dailyPlans = ["", "", "", "", "", "", ""];
                            this.isIndeterminate = false;
                            this.checkAll = false;
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
console.log(err);
                        this.$message({
                            message: "加载失败，服务器出错" + err,
                            type: 'error'
                        })
                        return false;
                    })
                } else { //验证未通过
                    //恢复按钮
                    that.isDisabled = false;
                    return false;
                }
            });
        },
        // 获取日开放计划数据
        getPlanDay(){
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
        },
        // 获取设备列表
        getDevices(){
            fetch(this.URL + "api/resources/", {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.deviceData = res.data;
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
    mounted(){
        this.getPlanDay();
        this.getDevices();
    }
}
</script>

<style scoped>
div {
  box-sizing: border-box;
}

#plan_edit{
  padding: 10px 30px 10px 30px;
  max-height: 100%;
  position: relative;
}

.title_block, .add_block{
  display: flex;
  align-items: center;
  width: 100%;
  height: 10%;
  padding-bottom: 20px;
}

.title{
  font-size: 25px;
}


.table_block{
  max-height: 80%;
}

.add_footer{
    padding-top: 10px;
}

#devices_choice{
    height: 120px;
    overflow: auto;
}
</style>