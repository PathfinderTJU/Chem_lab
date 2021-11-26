<template>
    <div id="reserve">
        <!-- 头部 -->
        <div class="title_block">
            <!-- 标题 -->
            <div class="left_block">
                <div class="title" v-if="userType">预约实验</div>
                <div class="title" v-else>预约情况</div>
                <el-select v-model="nowType">
                    <el-option v-for="item in devices" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </div>
            <!-- 切换按钮 -->
            <div class="button_block">
                <el-button @click="nextWeek" type="primary" size="normal" icon="el-icon-arrow-left">上一周</el-button>
                <el-button @click="previousWeek" type="primary">下一周<i class="el-icon-arrow-right el-icon--right"></i></el-button>
            </div>
        </div>
        <!-- 学生：表格 -->
        <div class="table_block" v-if="userType">
            <el-table :data="reserveData" border :cell-class-name="studentSetColor" @cell-click="reserve">
                <el-table-column label="时间" width="200" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.row.date}}</span>
                        <span>{{weekDays[scope.$index]}}</span>
                    </template>
                </el-table-column>
                <el-table-column v-for="(item, index) in classes" :index="index" :key="item" :label="item" align="center">
                    <template slot-scope="scope">
                        <span v-if="!scope.row.open[index]">未开放</span>
                        <span v-else-if="scope.row.reserve[index] == 3">已约满</span>
                        <span v-else>{{scope.row.reserve[index]}}/3</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 教师：表格 -->
        <div class="table_block" v-else>
            <el-table :data="reserveData" border :cell-class-name="teacherSetColor">
                <el-table-column label="时间" width="200" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.row.date}}</span>
                        <span>{{weekDays[scope.$index]}}</span>
                    </template>
                </el-table-column>
                <el-table-column v-for="(item, index) in classes" :key="item" :label="item" align="center">
                    <template slot-scope="scope">
                        <span v-if="!scope.row.open[index]">未开放</span>
                        <span v-else-if="scope.row.reserve[index] == 3">已约满</span>
                        <span v-else>{{scope.row.reserve[index]}}/3</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
export default {
    name: 'reserve',
    data(){
        return{
            nowType: "",
            weekDays: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"], //填充的星期
            classes: ["第一节", "第二节", "第三节", "第四节", "第五节", "第六节", "第七节"], //节数
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
            start: "", //起始日期，周一
            end: "", //终止日期，周日
            reserveData: [ //预约情况数据，"date为标准时间，10字符"
                {
                    date: "2021-11-08",
                    open: [true, true, true, true, true, true, true],
                    reserve: [0, 0, 0, 1, 2, 0, 3], // 已预约数目
                },
                {
                    date: "2021-11-09",
                    open: [true, true, false, false, false, true, true],
                    reserve: [0, 1, 0, 1, 2, 0, 3]
                },
                {
                    date: "2021-11-10",
                    open: [true, true, true, true, true, true, true],
                    reserve: [0, 0, 0, 1, 2, 0, 3]
                },
                {
                    date: "2021-11-11",
                    open: [true, true, true, true, true, true, true],
                    reserve: [0, 1, 1, 0, 2, 0, 3]
                },
                {
                    date: "2021-11-12",
                    open: [false, false, false, false, false, true, true],
                    reserve: [0, 0, 0, 1, 2, 2, 3]
                },
                {
                    date: "2021-11-13",
                    open: [false, false, false, false, false, false, false],
                    reserve: [0, 0, 0, 1, 2, 0, 3]
                },
                {
                    date: "2021-11-14",
                    open: [false, false, false, false, false, true, true],
                    reserve: [0, 0, 0, 1, 2, 1, 0]
                }
            ],
            myReserveData: [ //学生的预约数据
                {
                    date: "2021-11-08",
                    reserved: [false, false, false, true, false, false, false]
                },
                {
                    date: "2021-11-09",
                    reserved: [false, false, false, false, false, false, false]
                },
                {
                    date: "2021-11-10",
                    reserved: [false, false, false, false, false, false, false]
                },
                {
                    date: "2021-11-11",
                    reserved: [false, false, false, false, false, false, true]
                },
                {
                    date: "2021-11-12",
                    reserved: [false, false, false, false, false, false, false]
                },
                {
                    date: "2021-11-13",
                    reserved: [false, false, false, false, false, false, false]
                },
                {
                    date: "2021-11-14",
                    reserved: [false, false, false, false, false, false, false]
                }
            ]
        }
    },
    methods: {
        // 设置单元格颜色
        studentSetColor(scope){
            if (scope.columnIndex !== 0){
                if (!scope.row.open[scope.columnIndex - 1]){
                    return "reserveClose";
                }else if(this.myReserveData[scope.rowIndex].reserved[scope.columnIndex - 1]){
                    return "userSelect";
                }else if(scope.row.reserve[scope.columnIndex - 1] === 3){
                    return "reserveFull";
                }else{
                    return "reserveAvailable";
                }
            }
        },
        teacherSetColor(scope){
            if (scope.columnIndex !== 0){
                if (!scope.row.open[scope.columnIndex - 1]){
                    return "reserveClose";
                }else if (scope.row.reserve[scope.columnIndex - 1] === 3){
                    return "reserveFull";
                }
            }
        },
        // 下一周
        nextWeek(){

        },
        // 上一周
        previousWeek(){

        },
        // 预约
        reserve(row, column, cell, event){
            console.log(row, column, cell, event);
            // if (row.open[column.index])
        }
    },
    created() {
        // 填充设备类型

        // 填充时间

        // 填充预约信息

        // 学生则填充个人预约信息
    }
}
</script>

<style>
/* 未开放：灰色 */
.el-table .reserveClose{ 
    background-color: rgb(255, 77, 77) !important; /* 保证不会被改变 */
    color: white !important;
}

/* 约满：红色 */
.el-table .reserveFull{
    background-color: rgb(158, 158, 158) !important; /* 保证不会被改变 */
    color: white !important;
}

/* 用户预约：无论是否约满都为绿色 */
.el-table .userSelect{
    background-color: rgb(43, 153, 0) !important; /* 保证不会被改变 */
    color: white !important;
}

.el-table .reserveAvailable, .el-table .userSelect{
    cursor: pointer;
}

/* 改变鼠标悬浮行颜色变化，无法关闭 */
.el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell{
    background-color: inherit;
    color: inherit;
}

</style>

<style scoped>
div {
  box-sizing: border-box;
}

#reserve{
  padding: 10px 30px 10px 30px;
  height: 100%;
}

.title_block, .add_block{
  display: flex;
  align-items: center;
  width: 100%;
  height: 10%;
  padding-bottom: 20px;
  white-space: pre-line;
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