<template>
    <div id="mine">
        <div class="title_block">
            <div class="title" v-if="!userType">学生实验</div>
            <div class="title" v-else>我的实验</div>
        </div>
        <div class="option_block" v-if="!userType">
            <el-select v-model="nowType" @change="changeDevice">
                <el-option v-for="item in devices" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-switch v-model="tjuOnly" active-text="只看天大学生" inactive-text="查看全部" @change="showTjuOnly"></el-switch>
        </div>
        <div class="search_block" v-if="!userType">
            <div class="search_sub_block">
                <el-input class="search_input" v-model="idKeyword" clearable></el-input>
                <el-button type="primary" @click="searchById">按学号筛选</el-button>
            </div>
            <div class="search_sub_block" id="class_search_block">
                <el-input class="search_input" v-model="classKeyword" clearable></el-input>
                <el-button type="primary" @click="searchByClass">按班号筛选</el-button>
            </div>
        </div>
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
        </div>
        <el-dialog title="实验记录" :visible.sync="noteVisible" @close="closeDialog">
            <p class="note_block" v-html="note"></p>
            <el-form ref="scoreForm" :model="scoreForm" :rules="rules" label-width="100px" label-position="top" v-loading="isLoading">
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
            classes: ["第一节", "第二节", "第三节", "第四节", "第五节", "第六节", "第七节"], //节数
            types: ["精馏", "吸收-解吸", "化工传热", "流动过程"], //设备类型显示字符
            exData: [ //学生：实验数据
                {
                    exId: 0,
                    date: "2021-11-22",
                    class: 0,
                    university: '天津大学',
                    deviceType: 2,
                    deviceName: "传热设备1",
                    note: "这是一条记录\n这是两条记录"
                }
            ],
            note: "", //弹窗中的笔记内容
            noteVisible: false, //弹窗控制
            nowType: "", //当前设备ID
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
            this.noteVisible = true;
            this.note = this.exData[index].note;
        },
        // 教师：更换设备
        changeDevice(){
            
        },
        // 教师：只显示天大
        showTjuOnly(){

        },
        // 教师：按学号搜索
        searchById(){

        },
        // 教师：按班号搜索
        searchByClass(){

        },
        // 教师：查看笔记
        teacherOpenNote(scope){
            let index = scope.$index;
            this.noteVisible = true;
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
        }
    },
    created() {
        
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

.add_footer{
    padding-top: 30px;
}

.note_block{
    white-space: pre-line;
}

.search_block{
    margin: 30px 0;
}

.search_block, .search_sub_block{
    display: flex;
}

.search_sub_block{
    width: 35%;
}

.search_input{
    margin-right: 30px;
}

#tju_switch, #class_search_block{
    margin-left: 30px;
}
</style>