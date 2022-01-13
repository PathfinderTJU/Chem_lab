<template>
    <div id="enter">
        <div class="title_block">
            <div class="title">进入实验</div>
        </div>
        <div class="table_block">
            <el-select v-model="nowType" @change="changeDevice">
                <el-option v-for="(item, index) in devices" :key="item.name" :label="item.name" :value="index"></el-option>
            </el-select>
            <el-button id="enter_button" type="primary" @click="enter">进入实验</el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'enter',
    data(){
        return{
            nowType: '', 
            nowId: -1,// 当前设备ID
            type: '', // 当前设备类型
            urls: {
                "A": "/rectification",
                "B": "/absorptionDesorption",
                "C": "/conductHeat",
                "D": "/flowProcess"
            },
            devices: [], //设备列表
        }
    },
    methods: {
        // 获取设备列表
        getDevices(){
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
        },
        // 改变设备选择
        changeDevice(value){
            let index = value;
            this.nowId = this.devices[index].id;
            this.type = this.devices[index].type;
        },
        // 进入实验
        enter(){
            fetch(this.URL + "api/check/enterExp?resourceId=" + this.nowId + "&username=" + sessionStorage.getItem("userName"), {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    let url = this.urls[this.type];
                    let ticketId = res.data.ticketId;
                    this.$router.push(url + "?ticketId=" + ticketId);
                }else{
                    if(res.status === 400){
                        this.$message({
                            message: "未预约",
                            type: 'error'
                        })
                    }else if (res.status === 402){
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
                    }else if (res.status === 500){
                        this.$message({
                            message: "未在开放时段内",
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
        this.getDevices();
    },
}
</script>

<style scoped>
div {
  box-sizing: border-box;
}

#enter{
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

.form{
    width: 50%;
}

.table_block{
  height: 70%;
  padding-top: 20px;
}

#enter_button{
    margin-left: 30px;
}

.add_footer{
    padding-top: 30px;
}
</style>