<template>
    <div id="plan_reserve">
        <!-- 顶部 -->
        <div class="title_block">
            <div class="title">开放情况</div>
            <div class="button_block">
                <el-button @click="previousWeek" type="primary" size="normal" icon="el-icon-arrow-left">上一周</el-button>
                <el-button @click="nextWeek" type="primary">下一周<i class="el-icon-arrow-right el-icon--right"></i></el-button>
            </div>
        </div>
        <!-- 表格 -->
        <div class="table_block">
            <el-table :data="openData" border :cell-class-name="setColor" @cell-click="openChange">
                <el-table-column label="时间" width="200" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.row.date}}</span>
                        <span>{{weekDays[scope.$index]}}</span>
                    </template>
                </el-table-column>
                <el-table-column v-for="(item, index) in classes" :key="item" :index="index" :label="item" align="center">
                    <template slot-scope="scope">
                        <span>{{texts[scope.row.status[index]]}}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 修改开放计划弹窗 -->
        <el-dialog title="选择日开放计划" :visible.sync="planChangeVisible" @close="closeDialog('editForm')">
            <el-form ref="editForm" :model="editForm" label-width="150px" label-position="left" :rules="planRules" v-loading="isLoading">
                <el-form-item label="选择设备" prop="devices">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">全选</el-checkbox>
                    <el-checkbox-group v-model="editForm.devices" @change="deviceChange">
                        <el-checkbox v-for="item in devices" :label="item.id" :key="item.id">{{types[item.type]}}: {{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="选择日开放计划" prop="plan">
                    <el-select v-model="editForm.plan">
                        <el-option v-for="item in plans" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <div class="add_footer">
                    <el-button type="primary" @click="planSubmit('editForm')">确定</el-button>
                    <el-button @click="planCancel">取消</el-button>
                </div>
            </el-form>
        </el-dialog>
        <!-- 单独修改弹窗 -->
        <el-dialog title="单独修改" :visible.sync="cellChangeVisible" @close="closeDialog('editForm')">
            <el-form ref="editForm" :model="editForm" label-width="150px" label-position="left" v-loading="isLoading">
                <el-form-item label="选择开放设备" prop="devices">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">全选</el-checkbox>
                    <el-checkbox-group v-model="editForm.devices" @change="deviceChange">
                        <el-checkbox v-for="(item,index) in devices" :label="item.id" :key="item.id">{{types[item.type]}}: {{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <div class="add_footer">
                    <el-button type="primary" @click="cellSubmit('editForm')">确定</el-button>
                    <el-button @click="cellCancel">取消</el-button>
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'plan_reserve',
    data(){
        return {
            startDate: "", //当前起始日期
            endDate: "", //当前结束日期
            isLoading: false, //控制表单loading
            weekDays: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"], //填充的星期
            classes: ["第一节", "第二节", "第三节", "第四节", "第五节", "第六节", "第七节"], //节数
            types: {
                "A": "精馏", 
                "B": "吸收-解吸", 
                "C": "化工传热", 
                "D": "流动过程"
            }, //设备类型显示字符
            texts: ["全部开放", "部分开放", "不开放"],
            devices: [], //设备列表
            plans: [],//开放计划列表
            openData: [],//"date为标准时间，10字符", 2不开放，1部分开放，0全部开放
            editForm: {}, // 弹窗表单绑定
            planChangeDate: -1, //修改开放计划的日期
            planChangeVisible: false, //控制修改开放计划弹窗显示
            cellChangeDate: "", //单独修改的日期
            cellChangeClassIndex: -1, //单独修改的节数
            cellChangeVisible: false, //控制单独修改弹窗显示
            isIndeterminate: false, //控制全选选项卡是否为模糊（半选中）
            checkAll: false, //控制全选选项卡是否选中
            planRules: {
                devices: [
                    {required: true, message: "请至少选择一个设备", trigger: 'blur'}
                ],
                plan: [
                    {required: true, message: "请选择开放计划", trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        // 设置单元格颜色
        setColor(scope){
            if (scope.columnIndex !== 0){
                switch(scope.row.status[scope.columnIndex - 1]){
                    case 0:
                        return "planAll";
                    case 1:
                        return "planPart";
                    case 2:
                        return "planClose";
                }
            }else{
                return "planDate";
            }
        },
        // 格式化日期格式，传入Date对象，输出YYYY-DD-MM格式数据
        formateDate(date){
            let s = date.toLocaleDateString().replaceAll("/", "-");
            s = s.split("-");
            for (let i = 0 ; i < 3 ; i++){
                if (+s[i] < 10){
                    s[i] = '0' + s[i];
                }
            }

            return s.join('-');
        },
        // 全选被点击，要么从未勾选或模糊态变为选中，要么从选中变为未勾选
        checkAllChange(){
            // 无论如何，都脱离了模糊态
            this.isIndeterminate = false;

            // 未选中或模糊态，变为全选中
            if (this.editForm.devices.length !== this.devices.length){
                this.checkAll = true;
                
                // 改变devices，用于显示
                this.editForm.devices = [];
                for (let i = 0 ; i < this.devices.length ; i++){
                    this.editForm.devices.push(this.devices[i].id);
                }
            }else{ //全选中，变为未选中
                this.checkAll = false;
                
                // 改变devices，用于显示
                this.editForm.devices = [];
            }
        },
        // 某一个设备被点击，判断全选框状态是否会改变
        deviceChange(){
            // 分别判断是否全部选中/全部未选中/部分选中
            if (this.editForm.devices.length === this.devices.length){
                this.checkAll = true;
                this.isIndeterminate = false;
            }else if (this.editForm.devices.length === 0){
                this.checkAll = false;
                this.isIndeterminate = false;
            }else{
                this.checkAll = false;
                this.isIndeterminate = true;
            }
        },
        // 修改计划提交
        planSubmit(formName){
            let that = this;
            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                    let requestData = {
                        date: this.editForm.date,
                        resourceIds: this.editForm.devices,
                        dailyOpenPlanId: this.editForm.plan
                    }

                    this.$confirm('确定修改所选设备在' + this.planChangeDate + "的开放计划吗？已有的预约有可能被取消", '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        that.isLoading = true;
                        fetch(this.URL + "api/tickets/by-date", {
                            method: 'PUT',
                            headers: {
                                Authorization: 'Bearer  ' + localStorage.getItem("token"),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(requestData)
                        }).then(res => res.json()).then(res => {
                            that.isLoading = false;
                            that.planChangeVisible = false;
                            if (res.success){
                                this.openData.splice(0, this.openData.length);
                                this.getOpen();
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
                            that.isLoading = false;
                            this.$message({
                                message: "加载失败，服务器出错" + err,
                                type: 'error'
                            })
                            return false;
                        });  
                    }).catch(() => {
                        return false;         
                    });
                } else { //验证未通过
                    return false;  
                } 
            });
        },
        // 修改计划取消
        planCancel(){
            this.planChangeVisible = false;
        },
        // 单独修改提交
        cellSubmit(formName){
            let that = this;
            

            this.$confirm('确定将所选设备在' + this.cellChangeDate + this.classes[this.cellChangeClassIndex] + "开放吗？已有的预约有可能被取消", '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let closedResourceIds = [];
                let openResourceIds = [];
                for (let i = 0 ; i < this.devices.length ; i++){
                    let id = this.devices[i].id;
                    if (this.editForm.origin.includes(id) && !this.editForm.devices.includes(id)){ // 之前有但现在没有了
                        closedResourceIds.push(id);
                    }

                    if (!this.editForm.origin.includes(id) && this.editForm.devices.includes(id)){ // 之前没有但现在有了
                        openResourceIds.push(id);
                    }
                }

                this.isLoading = true;

                let requestDataClosed = {
                    date: this.editForm.date,
                    sn: this.editForm.sn,
                    resourceIds: closedResourceIds
                }
                
                let p1 = new Promise((resolve, reject) => {
                    fetch(this.URL + "api/tickets/by-item", {
                        method: 'DELETE',
                        headers: {
                            Authorization: 'Bearer  ' + localStorage.getItem("token"),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestDataClosed)
                    }).then(res => res.json()).then(res => {
                        if (res.success){
                            resolve();
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
                            reject();
                        }
                    }).catch(err => {
                        reject();
                        that.isLoading = false;
                        this.$message({
                            message: "加载失败，服务器出错" + err,
                            type: 'error'
                        })
                        return false;
                    });  
                });

                let requestDataOpen = {
                    date: this.editForm.date,
                    sn: this.editForm.sn,
                    resourceIds: openResourceIds
                }
                let p2 = new Promise((resolve, reject) => {
                    fetch(this.URL + "api/tickets/by-item", {
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer  ' + localStorage.getItem("token"),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestDataOpen)
                    }).then(res => res.json()).then(res => {
                        if (res.success){
                            resolve();
                        }else{
                            reject();
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
                        reject();
                        that.isLoading = false;
                        this.$message({
                            message: "加载失败，服务器出错" + err,
                            type: 'error'
                        })
                        return false;
                    });  
                })

                Promise.all([p1, p2]).then(() => {
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                    this.isLoading = false;
                    this.cellChangeVisible = false;

                    // 刷新数据
                    this.getOpen();

                }).catch((code) => {
                    this.isLoading = false;
                });

            }).catch(() => {
                return false;         
            });
        },
        // 单独修改取消
        cellCancel(){
            this.cellChangeVisible = false;
        },
        // 关闭弹窗，还原多选框组
        closeDialog(formName){
            this.isIndeterminate = false;
            this.checkAll = false;
            this.$refs[formName].resetFields();
        },
        // 下一周
        nextWeek(){
            this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + 7);
            this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate() + 7);
            this.getOpen();
        },
        // 上一周
        previousWeek(){
            this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() - 7);
            this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate() - 7);
            this.getOpen();
        },
        // 打开修改计划或单独修改弹窗
        openChange(row, column, cell, event){
            let index = column.index;
            if (index === undefined){ // 修改开放计划
                this.editForm = {
                    date: row.date,
                    plan: "",
                    devices: []
                };
                this.planChangeVisible = true;
                this.planChangeDate = row.date;
            }else{ // 单独修改   
                // devices用于绑定复选框选中数据
                this.editForm = {
                    date: row.date,
                    sn: column.index,
                    devices: row.devices[column.index],
                    origin: row.devices[column.index]
                };

                this.cellChangeVisible = true;
                this.cellChangeDate = row.date;
                this.cellChangeClassIndex = column.index;

                if (row.devices[column.index].length === 0){
                    this.checkAll = false;
                    this.isIndeterminate = false;
                }else if (row.devices[column.index].length === this.devices.length){
                    this.checkAll = true;
                    this.isIndeterminate = false;
                }else{
                    this.checkAll = false;
                    this.isIndeterminate = true;
                }
            }
        },
        // 获取设备信息和初始开放信息
        getDevicesAndOpen(){
            // 填充时间
            let now = new Date();
            let day = now.getDay();
            this.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
            this.endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7 - day);

            fetch(this.URL + "api/resources/", {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.devices = res.data;
                    this.getOpen();
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
        // 获取日开放计划
        getPlanDay(){
            fetch(this.URL + "api/daily-open-plans/", {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.plans = res.data;
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
        // 获取一段StartDate到endDate之间所有设备的开放情况
        getOpen(){
            let requests = [];
            let result = [];
            for (let i = 0 ; i < this.devices.length ; i++){
                let id = this.devices[i].id;
                let requestData = {
                    startDate: this.formateDate(this.startDate),
                    endDate: this.formateDate(this.endDate)
                }

                let p = new Promise((resolve, reject) => {
                    fetch(this.URL + "api/tickets/by-resource/" + id + "?resourceId=" + id 
                            + "&startDate=" + requestData.startDate + "&endDate=" + requestData.endDate, {
                        method: 'GET',
                        headers: {
                            Authorization: 'Bearer  ' + localStorage.getItem("token")
                        }
                    }).then(res => res.json()).then(res => {
                        if (res.success){
                            result.push(res.data);
                            resolve();
                        }else{
                            reject();
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
                        reject();
                        this.$message({
                            message: "加载失败，服务器出错" + err,
                            type: 'error'
                        })
                        return false;
                    });  
                })
                requests.push(p);
            }

            Promise.all(requests).then(() => {
                let temp = {};

                for (let i = 0 ; i < 7 ; i++){                                                  
                    let now = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + i);
                    let nowString = this.formateDate(now);
                    let status = new Array(7).fill(2);
                    let devices = new Array(7);
                    for (let i = 0 ; i < 7 ; i++){ // 用fill只创建了一个对象
                        devices[i] = new Array();
                    }

                    temp[nowString] = {
                        status: status,
                        devices: devices
                    };
                    
                }

                // 遍历设备
                for (let i = 0 ; i < result.length ; i++){
                    let subresult = result[i];

                    for (let j = 0 ; j < subresult.length ; j++){
                        temp[subresult[j].date].devices[subresult[j].sn].push(subresult[j].resourceId);

                        // 全部开放
                        if (temp[subresult[j].date].devices[subresult[j].sn].length === this.devices.length){
                            temp[subresult[j].date].status[subresult[j].sn] = 0;
                        }else{
                            // 部分开放
                            temp[subresult[j].date].status[subresult[j].sn] = 1;
                        }
                    }
                }

                //修改数据结构
                let newOpen = [];
                for(let i in temp){
                    newOpen.push({
                        date: i,
                        devices: temp[i].devices,
                        status: temp[i].status
                    });
                }
                this.openData = newOpen;
            });
        },
    },
    mounted() {
        // 填充时间、设备和开放计划
        this.getDevicesAndOpen();
        this.getPlanDay();
    }
}
</script>

<style>
.el-table .planClose{
    background-color: rgb(255, 77, 77) !important; /* 保证不会被改变 */
}

.el-table .planAll{
    background-color: rgb(43, 153, 0) !important;
}

.el-table .planPart{
    background-color: rgb(65, 224, 50) !important;
}

.el-table .planClose, .el-table .planAll, .el-table .planPart{
    color: white !important;
    cursor: pointer;
}

.el-table .planDate{
    cursor: pointer;
}

/* 关闭鼠标悬浮行颜色变化 */
.el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell{
    background-color: inherit;
    color: inherit;
    user-select: none;
}
</style>

<style scoped>
div {
  box-sizing: border-box;
}

#plan_reserve{
  padding: 10px 30px 10px 30px;
  height: 100%;
}

.title_block, .add_block{
  display: flex;
  align-items: center;
  width: 100%;
  height: 10%;
  padding-bottom: 20px;
}

.title_block, .left_block{
    display: flex;
    justify-content: space-between;
}

.title{
  font-size: 25px;
  margin-right: 20px;
}


.table_block{
  height: 70%;
}

.add_footer{
    padding-top: 30px;
}
</style>