<template>
    <div id="plan_reserve">
        <!-- 顶部 -->
        <div class="title_block">
            <div class="title">开放情况</div>
            <div class="button_block">
                <el-button @click="nextWeek" type="primary" size="normal" icon="el-icon-arrow-left">上一周</el-button>
                <el-button @click="previousWeek" type="primary">下一周<i class="el-icon-arrow-right el-icon--right"></i></el-button>
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
            <el-form ref="editForm" :model="editForm" label-width="150px" label-position="left" :rules="planRules">
                <el-form-item label="选择设备" prop="devices">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">全选</el-checkbox>
                    <el-checkbox-group v-model="editForm.devices" @change="deviceChange">
                        <el-checkbox v-for="item in devices" :label="item.id" :key="item.id">{{types[item.type]}}: {{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="选择日开放计划" prop="plan">
                    <el-select v-model="editForm.plan">
                        <el-option v-for="(item, index) in plans" :key="index" :label="item" :value="index"></el-option>
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
            <el-form ref="editForm" :model="editForm" label-width="150px" label-position="left">
                <el-form-item label="选择开放设备" prop="devices">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">全选</el-checkbox>
                    <el-checkbox-group v-model="editForm.devices" @change="deviceChange">
                        <el-checkbox v-for="item in devices" :label="item.id" :key="item.id">{{types[item.type]}}: {{item.name}}</el-checkbox>
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
            weekDays: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"], //填充的星期
            classes: ["第一节", "第二节", "第三节", "第四节", "第五节", "第六节", "第七节"], //节数
            types: ["精馏", "吸收-解吸", "化工传热", "流动过程"], //设备类型显示字符
            texts: ["全部开放", "部分开放", "不开放"],
            devices: [ //设备列表
                {
                    id: 1,
                    name: "精馏设备1", 
                    type:0,
                    param: []
                },
                {
                    id: 2,
                    name: "化工传热设备1", 
                    type:2,
                    param: []
                },
                {
                    id: 3,
                    name: "化工传热设备2", 
                    type:2,
                    param: []
                }
            ],
            plans: ["全天开放", "不开放", "晚上开放"],//开放计划列表
            openData: [ //"date为标准时间，10字符"
                {
                    date: "2021-11-08",
                    status: [0, 0, 0, 0, 0, 0, 0],
                    devices: [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]]
                },
                {
                    date: "2021-11-08",
                    status: [0, 0, 0, 0, 0, 2, 2],
                    devices: [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [], []]
                },
                {
                    date: "2021-11-08",
                    status: [0, 0, 1, 1, 0, 0, 0],
                    devices: [[1, 2, 3], [1, 2, 3], [2, 3], [1, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]]
                },
                {
                    date: "2021-11-08",
                    status: [0, 1, 0, 0, 1, 0, 0],
                    devices: [[1, 2, 3], [1, 2], [1, 2, 3], [1, 2, 3], [1, 3], [1, 2, 3], [1, 2, 3]]
                },
                {
                    date: "2021-11-08",
                    status: [1, 0, 0, 0, 1, 0, 0],
                    devices: [[1, 2], [1, 2, 3], [1, 2, 3], [1, 2], [1, 2, 3], [1, 2, 3], [1, 2, 3]]
                },
                {
                    date: "2021-11-08",
                    status: [2, 2, 2, 2, 2, 2, 2],
                    devices: [[],[],[],[],[],[],[]]
                },
                {
                    date: "2021-11-08",
                    status: [2, 2, 2, 2, 2, 1, 1],
                    devices: [[], [], [], [], [], [1], [1]]
                }
            ],
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
         // 全选被点击，要么从未勾选或模糊态变为选中，要么从选中变为未勾选
        checkAllChange(){
            // 无论如何，都脱离了模糊态
            this.isIndeterminate = false;

            // 未选中或模糊态，变为全选中
            if (this.editForm.devices.length !== this.devices.length){
                this.checkAll = true;
                this.editForm.devices = [];
                for (let i = 0 ; i < this.devices.length ; i++){
                    this.editForm.devices.push(this.devices[i].id);
                }
                console.log(this.editForm);
            }else{ //全选中，变为未选中
                this.checkAll = false;
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
            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                    this.$confirm('确定修改所选设备在' + this.planChangeDate + "的开放计划吗？已有的预约有可能被取消", '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        
                    }).catch(() => {
                        return false;         
                    });
                } else { //验证未通过
                    
                }
            });
        },
        // 修改计划取消
        planCancel(){
            this.planChangeVisible = false;
        },
        // 单独修改提交
        cellSubmit(formName){
            this.$confirm('确定将所选设备在' + this.cellChangeDate + this.classes[this.cellChangeClassIndex] + "开放吗？已有的预约有可能被取消", '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                        
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

        },
        // 上一周
        previousWeek(){

        },
        // 修改计划或单独修改
        openChange(row, column, cell, event){
            let index = column.index;
            if (index === undefined){ // 修改开放计划
                this.editForm = {
                    plan: "",
                    devices: []
                };
                this.planChangeVisible = true;
                this.planChangeDate = row.date;
            }else{ // 单独修改
                this.editForm = {
                    devices: row.devices[column.index]
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
    },
    created() {
        // 填充设备

        // 填充时间

        // 填充开放信息

        // 填充开放计划
    },
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