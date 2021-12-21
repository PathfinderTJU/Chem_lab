<template>
    <div id="reserve">
        <!-- 头部 -->
        <div class="title_block">
            <!-- 标题 -->
            <div class="left_block">
                <div class="title" v-if="userInfo.userType">预约实验</div>
                <div class="title" v-else>预约情况</div>
                <el-select v-model="nowType" @change="changeDevice">
                    <el-option v-for="item in devices" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </div>
            <!-- 切换按钮 -->
            <div class="button_block">
                <el-button @click="previousWeek" type="primary" size="normal" icon="el-icon-arrow-left">上一周</el-button>
                <el-button @click="nextWeek" type="primary">下一周<i class="el-icon-arrow-right el-icon--right"></i></el-button>
            </div>
        </div>
        <!-- 学生：表格 -->
        <div class="table_block" v-if="userInfo.userType">
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
            devices: [], //设备列表,
            startDate: "", //起始日期，周一
            endDate: "", //终止日期，周日
            reserveData: [], //预约情况数据，"date为标准时间，10字符"
            myReserveData: [ //学生的预约数据
                {
                    date: "2021-12-20",
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
            console.log(scope);
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
        // 下一周
        nextWeek(){
            if (this.nowType === ""){
                return false;
            }
            this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + 7);
            this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate() + 7);
            this.myReserveData.splice(0, this.myReserveData.length);
            this.reserveData.splice(0, this.reserveData.length);
            this.getReserve(this.nowType);
        },
        // 上一周
        previousWeek(){
            if (this.nowType === ""){
                return false;
            }

            this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() - 7);
            this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate() - 7);
            this.myReserveData.splice(0, this.myReserveData.length);
            this.reserveData.splice(0, this.reserveData.length);
            this.getReserve(this.nowType);
        },
        // 改变设备，刷新数据
        changeDevice(value){
            this.reserveData.splice(0, this.reserveData.length);
            // this.myReserveData.splice(0, this.myReserveData.length);
            this.getReserve(value);
        },
        // 获取预约信息和自己的预约信息
        getReserve(id){
            let temp = {};
            
            // 数据格式化用到的数组
            for (let i = 0 ; i < 7 ; i++){                                                  
                let now = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() + i);
                let nowString = this.formateDate(now);
                let open = new Array(7).fill(false);
                let reserve = new Array(7).fill(0);

                temp[nowString] = {
                    open: open,
                    reserve: reserve
                };
                    
            }            
            
            let requestData = {
                startDate: this.startDate.toLocaleDateString(),
                endDate: this.endDate.toLocaleDateString()
            }

            fetch(this.URL + "api/tickets/by-resource/" + id + "?resourceId=" + id 
                    + "&startDate=" + requestData.startDate + "&endDate=" + requestData.endDate, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token")
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    let result = res.data;
                    for (let i = 0 ; i < result.length ; i++){
                        temp[result[i].date].open[result[i].sn] = true;
                        temp[result[i].date].reserve[result[i].sn] = result[i].available;
                    }

                    //修改数据结构
                    for(let i in temp){
                        this.reserveData.push({
                            date: i,
                            open: temp[i].open,
                            reserve: temp[i].reserve
                        });
                    }
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
        // 预约
        reserve(row, column, cell, event){
            let sn = column.index;
            let date = row.date;
            let myReserve = this.myReserveData.find(function(e){
                return e.date === date;
            })
            
            if (myReserve.reserved[sn]){
                this.$confirm('确认取消预约吗？' ,{
                    type: 'warning'
                }).then(() => {
                    
                });
            }else{
                if (row.open[sn] && row.reserve[sn] !== 3){ // 过滤掉未开放和已满
                    this.$confirm('确认要预约此时段吗？', {
                        type: 'warning'
                    }).then(() => {
                    
                    });
                }
            }

        },
        // 获取设备类型
        getDevice(){
            fetch(this.URL + "api/resources/", {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.devices = res.data;
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
        // 填充设备类型
        this.getDevice();
        // 填充时间
        let now = new Date();
        let day = now.getDay();
        this.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        this.endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7 - day);
    }
}
</script>

<style>
/* 未开放：灰色 */
.el-table .reserveClose{ 
    background-color: rgb(189, 189, 189) !important; /* 保证不会被改变 */
    color: white !important;
}

/* 约满：红色 */
.el-table .reserveFull{
    background-color: rgb(133, 132, 132) !important; /* 保证不会被改变 */
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