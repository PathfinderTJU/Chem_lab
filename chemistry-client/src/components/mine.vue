<template>
    <div id="mine">
        <!-- 标题 -->
        <div class="title_block">
            <div class="title" v-if="!userType">学生实验</div>
            <div class="title" v-else>我的实验</div>
            <el-switch v-model="tjuOnly" v-if="!userType" active-text="只看天大学生" inactive-text="查看全部" @change="showTjuOnly"></el-switch>
        </div>
        <!-- 搜索和筛选区 -->
        <div class="search_block" v-if="!userType">
            <el-select v-model="nowType" @change="changeDevice">
                <el-option v-for="item in devices" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <div class="search_sub_block">
                <el-input class="search_input" v-model="idKeyword" clearable></el-input>
                <el-button type="primary" @click="searchById">按学号筛选</el-button>
            </div>
            <div class="search_sub_block" id="class_search_block">
                <el-input class="search_input" v-model="classKeyword" clearable></el-input>
                <el-button type="primary" @click="searchByClass">按班号筛选</el-button>
            </div>
        </div>
        <!-- 学生表格 -->
        <div class="table_block" v-if="userType">
            <el-table :data="exData" border stripe height="100%">
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
                <el-table-column label="实验记录" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="openNote(scope)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 教师表格 -->
        <div class="teacher_table_block" v-else>
            <el-table :data="studentExData" border stripe height="100%">
                <el-table-column prop="date" label="日期" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.row.date}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sn" label="时间" align="center">
                    <template slot-scope="scope">
                        <span>{{classes[scope.row.sn]}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="username" label="用户名" align="center"></el-table-column>
                <el-table-column prop="school" label="学校" align="center"></el-table-column>
                <el-table-column prop="grade" label="逻辑班号" align="center"></el-table-column>
                <el-table-column label="实验记录" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="teacherOpenNote(scope)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination id="changePageButton" @current-change="changePage" layout="prev, pager, next" :total="pageNum * 10"></el-pagination>
        </div>
        <!-- 实验记录弹窗 -->
        <el-dialog title="实验记录" :visible.sync="noteVisible" @close="closeDialog('scoreForm')">
            <p class="note_block" v-html="note"></p>
            <el-form v-if="!userType" ref="scoreForm" :model="scoreForm" :rules="rules" label-width="100px" label-position="top" v-loading="isLoading">
                <el-form-item prop="score" label="得分">
                    <el-input v-model.number="scoreForm.score" clearable></el-input>
                </el-form-item>
                <el-form-item id="submit_item">
                    <el-button id="submit" type="primary" @click="giveScore('scoreForm')" >打分</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'mine',
    data(){
        return{
            userType: "", // 用户类型
            classes: ["第一节", "第二节", "第三节", "第四节", "第五节", "第六节", "第七节"], //节数
            types: {//设备类型显示字符
                "A": "精馏", 
                "B": "吸收-解吸", 
                "C": "化工传热", 
                "D": "流动过程"
            }, 
            exData: [], //学生：实验数据
            note: "", //弹窗中的笔记内容
            noteVisible: false, //弹窗控制
            nowType: "", //当前设备ID
            devices: [], //设备列表
            idKeyword: "", //按ID搜索的关键字
            classKeyword: "", //按班级搜索的关键字
            tjuOnly: false, //只显示天大
            studentExData: [], //教师：实验数据
            nowIndex: 0, // 当前操作的数据index
            pageNum: 0, // 教师：分页页数
            nowPage: 0, // 教师：分页当前页
            scoreForm: { // 打分表单
                score: 0
            },
            rules: { // 打分表单的规则
                score: [
                    {required: true, type: 'number', message: "请输入正确的分数", trigger: 'blur'}
                ]
            },
            isLoading: false, //打分表单loading
            time: []
        }
    },
    methods: {
        // 格式化时间格式，传入Date对象，输出格式为"YYYY-MM-DD HH:MM:SS"的时间串
        formateTime(date){
            let year = date.getFullYear();
            let month = addBit(date.getMonth() + 1);
            let day = date.getDate();

            let hour = addBit(date.getHours());
            let minute = addBit(date.getMinutes());
            let second = addBit(date.getSeconds());

            let result = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
            return result;

            // 补足十位的数字
            function addBit(origin){
                if (origin < 10){
                    return '0' + origin;
                }else{
                    return origin;
                }
            }
        },
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
        // 关闭弹窗
        closeDialog(formName){
            this.note = "";
            if (!this.userType){
                this.$refs[formName].resetFields();
            }
        },
        // 学生：查看笔记
        openNote(scope){
            let index = scope.$index;
			let id = this.exData[index].ticketId;
            this.noteVisible = true;

			fetch(this.URL + "api/records/" + id, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    let data = res.data;
                    let result = "";

                    for (let i = 0 ; i < data.length ; i++){
                        let d = data[i];
                        let time = this.formateTime(new Date(d.time));
                        
                        let temp = "";
                        temp += '<span style="color: #409EFF;">' + time + '</span> ';
                        temp += '<span style="color: rgb(55, 187, 55);">' + d.username + '</span>:   ';
                        temp += d.record + "\r\n";

                        result += temp;
                    }
                    if (result === ""){
                        result = "暂无实验记录"
                    }
                    this.note = result;
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
        // 获取开放时段
        getTime(){
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
                        data[i].start = data[i].startTime.substring(0, 5);
                        data[i].end = data[i].endTime.substring(0, 5);
                    }   

                    this.time = data;
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
        // 过滤数据
        flitData(result){
            let today = new Date();
            let temp = [];

            for (let i = 0 ; i < result.length ; i++){
                let date = result[i].date;
                let sn = -1;
                if (this.userType){
                    sn = result[i].class;
                }else{
                    sn = result[i].sn;
                }
                let startTime = new Date(date + " " + this.time[sn].startTime);

                if (!compareTime(today, startTime)){ //当前时间晚于开始时间，实验已经开始
                    temp.push(result[i]);
                }
            }

            return temp

            function compareTime(date1, date2){ // date1比date2早返回true，否则都返回true
                return date1.getTime() - date2.getTime() < 0;
            }
        },
        // 学生：获取实验数据
        getExData(){
            let date = new Date(); // 今天的日期
            let today = this.formateDate(date);
            let result = [];

            fetch(this.URL + "api/booking/by-user/" + sessionStorage.getItem("userId"),{
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
                            id: data.id,
                            ticketId: data.ticket.id
                        }
                        result.push(newReserve);
                    }
                    
                    this.exData = this.flitData(result);        

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
        // 教师：获取全部的用户数据
        getAllStudent(id, page){
            fetch(this.URL + "api/check/getHaveDoneExp?resourceId=" + id + "&pageNum=" + page + "&pageSize=10", {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.pageNum = res.data.TotalPages;
                    this.studentExData = this.flitData(res.data.Content);                 
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
        // 教师：更换设备
        changeDevice(){
            this.getAllStudent(this.nowType, 1);
            this.idKeyword = "";
            this.classKeyword = "";
            this.nowPage = 1;
        },
        // 教师：分页切换
        changePage(page){
            this.getAllStudent(this.nowType, page);
        },
        // 教师：只显示天大
        showTjuOnly(){
            if (this.nowType === ""){
                this.tjuOnly = !this.tjuOnly;
                this.$message({
					message: "请选择实验设备",
					type: 'error'
				})
                return false;
            }
            
            if (this.tjuOnly){
                let data = this.studentExData;
                let result = [];

                for (let i = 0 ; i < data.length ; i++){
                    if (data[i].school === "天津学"){
                        result.push(data[i]);
                    }
                }

                this.studentExData = result;
            }else{
                let idKey = this.idKeyword;
                let classKey = this.classKeyword;
                let date = new Date(); // 今天的日期
                let today = this.formateDate(date);

                fetch(this.URL + "api/check/getHaveDoneExp?resourceId=" + this.nowType + "&pageNum=" + this.nowPage + "&pageSize=10"
                            + "&username=" + idKey + "&grade=" + classKey, {
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer  ' + localStorage.getItem("token") 
                    }
                }).then(res => res.json()).then(res => {
                    if (res.success){
                        this.pageNum = res.data.TotalPages;
                        this.studentExData = this.flitData(res.data.Content);

                        if (res.data.Content.length === 0){
                            this.$message({
                                message: "无搜索结果",
                                type: 'error'
                            }) 
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
            }
        },
        // 教师：按学号搜索
        searchById(){
            if (this.nowType === ""){
                this.$message({
					message: "请选择实验设备",
					type: 'error'
				})
                return false;
            }

            this.classKeyword = "";
            this.tjuOnly = false;
            let key = this.idKeyword;
			let date = new Date(); // 今天的日期
            let today = this.formateDate(date);

            fetch(this.URL + "api/check/getHaveDoneExp?resourceId=" + this.nowType + "&pageNum=" + this.nowPage + "&pageSize=10"
                           + "&username=" + key, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.pageNum = res.data.TotalPages;
                    this.studentExData = this.flitData(res.data.Content);

                    if (res.data.Content.length === 0){
                        this.$message({
                            message: "无搜索结果",
                            type: 'error'
                        }) 
                    }else{
                        this.$message({
                            message: "搜索成功",
                            type: 'success'
                        })   
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
        // 教师：按班号搜索
        searchByClass(){
            if (this.nowType === ""){
                this.$message({
					message: "请选择实验设备",
					type: 'error'
				})
                return false;
            }
            
            this.idKeyword = ""; // 不能同时查询
            this.tjuOnly = false;
            let key = this.classKeyword;
			let date = new Date(); // 今天的日期
            let today = this.formateDate(date);

            fetch(this.URL + "api/check/getHaveDoneExp?resourceId=" + this.nowType + "&pageNum=" + this.nowPage + "&pageSize=10"
                           + "&grade=" + key, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.pageNum = res.data.TotalPages;
                    this.studentExData = this.flitData(res.data.Content);

                    if (res.data.Content.length === 0){
                        this.$message({
                            message: "无搜索结果",
                            type: 'error'
                        }) 
                    }else{
                        this.$message({
                            message: "搜索成功",
                            type: 'success'
                        })   
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
        // 教师：查看笔记
        teacherOpenNote(scope){
            let index = scope.$index;
            this.nowIndex = index;
            let ticketId = this.studentExData[index].ticketId;
            let username = this.studentExData[index].username;

            // 获取实验记录
            let p1 = new Promise((resolve, reject) => {
                fetch(this.URL + "api/records/" + ticketId, {
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer  ' + localStorage.getItem("token") 
                    }
                }).then(res => res.json()).then(res => {
                    if (res.success){
                        let data = res.data;
                        let result = "";

                        for (let i = 0 ; i < data.length ; i++){
                            let d = data[i];
                            let time = this.formateTime(new Date(d.time));
                            
                            let temp = "";
                            temp += '<span style="color: #409EFF;">' + time + '</span> ';
                            temp += '<span style="color: rgb(55, 187, 55);">' + d.username + '</span>:   ';
                            temp += d.record + "\r\n";

                            result += temp;
                        }
                        if (result === ""){
                            result = "暂无实验记录"
                        }
                        this.note = result;

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
                    this.$message({
                        message: "加载失败，服务器出错" + err,
                        type: 'error'
                    })
                    return false;
                }); 
            })

            // 获取分数
            let p2 = new Promise((resolve, reject) => {
                fetch(this.URL + "api/check/getScore?ticketId=" + ticketId + 
                                 "&username=" + username, {
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer  ' + localStorage.getItem("token")
                    }
                }).then(res => res.json()).then(res => {
                    if (res.success){
                        this.scoreForm.score = res.data;
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
                        }else if (res.status === 603){ // 未评分
                            this.scoreForm.score = 0;
                            resolve();
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
                    this.$message({
                        message: "加载失败，服务器出错" + err,
                        type: 'error'
                    })
                    return false;
                });
            })

            // 填充数据
            Promise.all([p1, p2]).then(() => {
                this.noteVisible = true;
            });
        },
        // 教师：打分
        giveScore(formName){
            let index = this.nowIndex;
            let ticketId = this.studentExData[index].ticketId;
            let username = this.studentExData[index].username;

            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                    this.isLoading = true;

                    fetch(this.URL + "api/check/setScore?ticketId=" + ticketId + "&username=" + username
                                   + "&score=" + this.scoreForm.score, {
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer  ' + localStorage.getItem("token") 
                        }
                    }).then(res => res.json()).then(res => {
                        this.isLoading = false;
                        if (res.success){
                            this.$message({
                                message: "打分成功",
                                type: 'success'
                            })
                            this.noteVisible = false;
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
                        this.isLoading = false;
                        this.$message({
                            message: "加载失败，服务器出错" + err,
                            type: 'error'
                        })
                        return false;
                    }); 
                } else { //验证未通过
                    return false;
                }
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
    created() {
        this.userType = localStorage.getItem("userType") === "true";
    },
    mounted() {
        this.getDevices();
        this.getTime();
        if (this.userType){
            this.getExData();
        }
    },
}
</script>

<style scoped>
div {
  box-sizing: border-box;
}

#mine{
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

.teacher_table_block{
    height: 60%;
}

#changePageButton{
    text-align: center;
}

.add_footer{
    padding-top: 30px;
}

.note_block{
    white-space: pre-line;
}

.search_block{
    margin-bottom: 30px;
}

.search_block, .search_sub_block{
    display: flex;
}

.search_sub_block{
    width: 30%;
    margin-left: 30px;
}

.search_input{
    margin-right: 30px;
}

#tju_switch{
    margin-left: 30px;
}
</style>