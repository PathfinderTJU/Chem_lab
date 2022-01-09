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
                <el-table-column prop="class" label="时间" align="center">
                    <template slot-scope="scope">
                        <span>{{classes[scope.row.class]}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="username" label="用户名" align="center"></el-table-column>
                <el-table-column prop="university" label="学校" align="center"></el-table-column>
                <el-table-column prop="classId" label="逻辑班号" align="center"></el-table-column>
                <el-table-column label="实验记录" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="teacherOpenNote(scope)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination id="changePageButton" @current-change="changePage" layout="prev, pager, next" :total="pageNum * 10"></el-pagination>
        </div>
        <!-- 实验记录弹窗 -->
        <el-dialog title="实验记录" :visible.sync="noteVisible" @close="closeDialog">
            <p class="note_block" v-html="note"></p>
            <el-form v-if="!userType" ref="scoreForm" :model="scoreForm" :rules="rules" label-width="100px" label-position="top" v-loading="isLoading">
                <el-form-item prop="score" label="得分">
                    <el-input v-model.number="scoreForm.score" clearable></el-input>
                </el-form-item>
                <el-form-item id="submit_item">
                    <el-button id="submit" type="primary" @click="giveScore('form')" >打分</el-button>
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
            exData: [ //学生：实验数据
                {
                    exId: 0,
                    date: "2021-11-22",
                    class: 0,
                    university: '天津大学',
                    deviceType: "C",
                    deviceName: "传热设备1",
                    note: "这是一条记录\n这是两条记录"
                }
            ],
            note: "", //弹窗中的笔记内容
            noteVisible: false, //弹窗控制
            nowType: "", //当前设备ID
            devices: [], //设备列表
            idKeyword: "", //按ID搜索的关键字
            classKeyword: "", //按班级搜索的关键字
            tjuOnly: false, //只显示天大
            studentExData: [ //教师：实验数据
                {
                    exId: 0,
                    date: "2021-11-22",
                    class: 0,
                    username: "3018218144",
                    university: '天津大学',
                    classId: '10101', 
                    deviceType: 2,
                    deviceName: "传热设备1",
                    note: "这是一条记录\n这是两条记录"
                }
            ],
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
            isLoading: false //打分表单loading
        }
    },
    methods: {
        // 关闭弹窗
        closeDialog(){
            this.$refs[formName].resetFields();
        },
        // 学生：查看笔记
        openNote(scope){
            let index = scope.$index;
			let id = this.exData[index].id;
            this.noteVisible = true;

			fetch(this.URL + "api/records/" + id, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.note = res.data;
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
        // 学生：获取实验数据
        getExData(){
            fetch(this.URL + "api/booking/by-user/" + sessionStorage.getItem("userName"), {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.reserveData = res.data;
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
        getAllStudent(type){

        },
        // 教师：更换设备
        changeDevice(){
            this.getAllStudent(this.nowType);
            this.idKeyword = "";
            this.classKeyword = "";
            this.nowPage = 0;
        },
        // 教师：分页切换
        changePage(){

        },
        // 教师：只显示天大
        showTjuOnly(){

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
            let key = this.idKeyword;
			
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

            let key = this.classKeyword;
			fetch(this.URL + "api/check/getHaveDoneExp?userName=" + key, {
				method: 'GET',
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					if (res.data === null){
						this.$message({
							message: "未找到用户",
							type: 'error'
						})
					}else{
						let data = res.data;
						this.accountData.splice(0, this.accountData.length, data.user);
						this.pageNum = 1;
						this.nowPage = 1;
						
						// 获取用户类型
						for(let i = 0 ; i < this.types.length ; i++){
							if (this.types[i].key === data.role){
								this.nowType = this.types[i].value;
							}
						}
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
					message: "搜索失败，服务器出错" + err,
					type: 'error'
				})
				return false;
			})
        },
        // 教师：查看笔记
        teacherOpenNote(scope){
            let index = scope.$index;
            this.nowIndex = index;
            this.noteVisible = true;

            // 打分
            
            this.note = this.studentExData[index].note;
            this.scoreForm.score = this.studentExData[index].score;
        },
        // 教师：打分
        giveScore(){
            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                    that.isLoading = true;
                    that.isDisabled = true;
                
                    //停止加载
                    that.isLoading = false;
                    //关闭表单
                    that.scoreVisible = false;
                    this.$refs["scoreForm"].resetFields();
                } else { //验证未通过
                    //恢复按钮
                    that.isDisabled = false;
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