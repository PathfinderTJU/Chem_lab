<template>
    <div id="my_reserve">
        <div class="title_block">
            <div class="title">我的预约</div>
        </div>
        <div class="table_block">
            <el-table :data="reserveData" border stripe height="100%">
                <el-table-column prop="date" label="日期" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.row.date}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="class" label="时间" align="center">
                    <template slot-scope="scope">
                        <span>{{classes[scope.row.class]}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="deviceType" label="类型" align="center">
                    <template slot-scope="scope">
                        <span>{{types[scope.row.deviceType]}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="deviceName" label="设备" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <template>
                            <el-popconfirm title="确定取消预约吗?" @confirm="cancel(scope)">
                                <el-button type="text" size="small" slot="reference">取消预约</el-button>
                            </el-popconfirm>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
export default {
    name: 'my_reserve',
    data(){
        return{
            classes: ["第一节", "第二节", "第三节", "第四节", "第五节", "第六节", "第七节"], //节数
            types: {
                "A": "精馏", 
                "B": "吸收-解吸", 
                "C": "化工传热", 
                "D": "流动过程"
            }, //设备类型显示字符
            reserveData: []
        }
    },
    methods: {
        // 格式化日期，将"year-month-date"格式日期转换为"YYYY-MM-DD"格式数据
        formateDate(){
            let s = date.toLocaleDateString().replaceAll("/", "-");
            s = s.split("-");
            for (let i = 0 ; i < 3 ; i++){
                if (+s[i] < 10){
                    s[i] = '0' + s[i];
                }
            }

            return s.join('-');
        },
        // 取消预约
        cancel(scope){
            let id = this.reserveData[scope.$index].id;
            fetch(this.URL + "api/booking/" + id, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.$message({
                        message: "取消成功",
                        type: 'success'
                    })
                    this.getReserve();
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
                    message: "取消失败，服务器出错" + err,
                        type: 'error'
                    })
                return false;
            });
        },
        // 获取预约信息
        getReserve(){
            let result = [];
            let date = new Date(); // 今天的日期
            let today = this.formateDate(date.toLocaleDateString());

            fetch(this.URL + "api/booking/by-user/" + sessionStorage.getItem("userId") + "?startDate=" + today, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    console.log(res);
                    // 填充数据
                    for (let i = 0 ; i < res.data.length ; i++){
                        let data = res.data[i];
                        let newReserve = {
                            date: data.ticket.date,
                            class: data.ticket.sn,
                            deviceType: data.ticket.resource.type,
                            deviceName: data.ticket.resource.name,
                            id: data.id
                        }
                        result.push(newReserve);
                    }

                    this.reserveData = result;        

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
        this.getReserve();
        this.getTime();
    },
}
</script>

<style scoped>
div {
  box-sizing: border-box;
}

#my_reserve{
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


.table_block{
  height: 70%;
}

.add_footer{
    padding-top: 30px;
}
</style>