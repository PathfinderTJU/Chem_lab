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
            reserveData: [],
            time: []
        }
    },
    methods: {
        // 格式化日期，将date对象转换为"YYYY-MM-DD"格式数据
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
            let today = new Date(); // 今天的日期

            // 获取预约信息
            let p1 = new Promise((resolve, reject) => {
                fetch(this.URL + "api/booking/by-user/" + sessionStorage.getItem("userId"), {
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer  ' + localStorage.getItem("token") 
                    }
                }).then(res => res.json()).then(res => {
                    if (res.success){
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
                    this.$message({
                        message: "加载失败，服务器出错" + err,
                        type: 'error'
                    })
                    reject();
                    return false;
                });
            })

            let p2 = new Promise((resolve, reject) => {
                fetch(this.URL + "api/daily-open-plans/items/", {
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer  ' + localStorage.getItem("token")
                    }
                }).then(res => res.json()).then(res => {
                    if (res.success){
                        let data = res.data;

                        // 替换数据
                        for (let i = 0 ; i < data.length ; i++){
                            data[i].label = this.classes[data[i].sn];
                            data[i].value = data[i].sn;
                            data[i].start = data[i].startTime.substring(0, 5);
                            data[i].end = data[i].endTime.substring(0, 5);
                        }   

                        this.time = data;
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
                    this.$message({
                        message: "加载失败，服务器出错" + err,
                        type: 'error'
                    })
                    reject();
                    return false;
                })                
            })

            // 筛选数据
            Promise.all([p1, p2]).then(() => {
                let temp = [];
                for (let i = 0 ; i < result.length ; i++){
                    let date = result[i].date;
                    let sn = result[i].class;
                    let endTime = new Date(date + " " + this.time[sn].endTime);

                    if (!compareTime(today, endTime)){
                        temp.push(result[i]);
                    }
                }

                this.reserveData = temp;
            });

            function compareTime(date1, date2){ // date1比date2晚返回true，否则都返回true
                return date1.getTime() - date2.getTime() > 0;
            }
        },
    },
    mounted() {
        this.getReserve();
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