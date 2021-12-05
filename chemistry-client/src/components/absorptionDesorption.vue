<template>
    <div id="absorptionDesorption">
        <div class="img_block">
            <img src="../assets/absorption.jpg" id="ex_img" ref="img"/>
            <!-- 显示数据 -->
            <span class="param_show" v-for="(value, key) in params_show" :key="key.id" :id="key">{{value}}</span>
            <span class="control_show" v-for="(value, index) in options_show" :key="value.id" :id="value.classId">
                <span class="contorl_data" v-if="value.haveData">{{value.data}}</span>
                <el-popover class="control_pop" placement="top" trigger="click" width="160" v-model="value.controlVisible">
                    <div>{{value.name}}</div>
                    <div class="control_input" v-if="value.haveData">
                        <el-input v-model="value.data"></el-input>
                        <el-button type="primary" @click="updateOption(index)" :disabled="value.haveSwitch && !value.open">修改</el-button>
                    </div>
                    <div v-if="value.haveSwitch">
                        <el-switch v-model="value.open" active-text="打开" inactive-text="关闭" @change="updateSwitch(index)"></el-switch>
                    </div>
                <i style="padding-left: 5px;color:#E6A23C;cursor:pointer;" class="el-icon-s-tools" slot="reference"></i>
                </el-popover>
            </span>
        </div>
        <div class="side_block" ref="sideBlock">
            <!-- 标题和时间 -->
            <div class="ex_title">吸收-解吸实验</div>
            <div class="ex_time">实验结束时间：<span style="font-weight:bold;color: #409EFF">{{endTime}}</span></div>
            <!-- 摄像头 -->
            <iframe :src="nowVideo.url" id="ysopen" ref="video" :style="{height:videoHeight + 'px'}"></iframe>
            <el-pagination id="video_change_button" small layout="prev, pager, next" :total="40" @current-change="changeCam"></el-pagination>
            <!-- 控制模块 -->
            <div class="control_block">
                <div id="now_controller">
                    <span>当前操作者：{{nowController}}</span>
                    <el-badge :is-dot="haveNewMsg" class="item">
                        <el-button type="text" @click="showMember">成员信息</el-button>
                    </el-badge>
                </div>
                <el-button class="control_button" type="primary">申请操作</el-button>
                <el-button class="control_button" type="warning">结束操作</el-button>
            </div>
            <!-- 退出按钮 -->
            <div class="ex_bottom">
                <el-button type="danger">退出实验</el-button>
            </div>
        </div>
        <!-- 成员信息和聊天框 -->
        <el-drawer title="成员信息" :visible="memberVisible" @close="closeMember">
            <div class="members_block">
                <div class="member_title">在实验中的成员</div>
                <div class="members" v-for="item in members" :key="item">{{item}}</div>
            </div>
            <div class="talk_block">
                <div class="member_title">交流区</div>
                <div class="display_block">
                    <div class="messages" v-for="item in messages" :key="item.content">
                        <span class="speaker">{{item.username}}</span>
                        说：{{item.content}}
                    </div>
                </div>
                <div class="send_block">
                    <el-input v-model="buffer" placeholder="说点什么" id="send_input"></el-input>
                    <el-button type="primary" id="send_button" @click="sendBuffer">发送</el-button>
                </div>
            </div>
        </el-drawer>
    </div> 
</template>

<script>
export default {
    name: 'absorptionDesorption',
    data(){
        return{
            endTime: "21:30",
            params_show:{ //显示的数据
                'f3': 3.45,
                'f4': 4.56,
                't1': 1.234,
                't2': 2.345,
                't3': 3.456,
                'p1': 1.2,
                'p2': 2.3,
                'p3': 3.4,
                'p4': 4.5,
                'p5': 5.6,
                'l1': 1.2345,
                'l2': 2.3456
            }, 
            cams: [
                {
                    "url": "https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/E33136313/1.live&accessToken=at.cff96jf31wykuf4u1slsv1q30mjf68jk-45gicg5yqz-0uhwyqm-s4lsfznkn&id=ysopen",
                    "title": "正对摄像头1"
                },
                {
                    "url": "https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/C78957921/1.live&accessToken=ra.2xirbtir599z2cp2dwlaxeglbrld1n4w-5mmn4448p3-02e06mr-vi8cgdax5&id=ysopen",
                    "title": "正对摄像头2"
                },
                {
                    "url": "https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/C78957921/1.live&accessToken=ra.2xirbtir599z2cp2dwlaxeglbrld1n4w-5mmn4448p3-02e06mr-vi8cgdax5&id=ysopen",
                    "title": "正对摄像头3"
                },
                {
                    "url": "https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/C78957921/1.live&accessToken=ra.2xirbtir599z2cp2dwlaxeglbrld1n4w-5mmn4448p3-02e06mr-vi8cgdax5&id=ysopen",
                    "title": "正对摄像头4"
                }
            ], //摄像头数据
            nowVideo: {}, //当前摄像头数据
            videoHeight: 0,
            nowController: "2021244091", //当前操作者
            options_show: [
                {
                    id: 1,
                    classId: 'lixin1',
                    name: '离心泵1频率',
                    haveSwitch: true,
                    haveData: true,
                    open: true,
                    data: 100,
                    controlVisible: false
                },
                {
                    id: 2,
                    classId: 'lixin2',
                    name: '离心泵2频率',
                    haveSwitch: true,
                    haveData: true,
                    open: true,
                    data: 200,
                    controlVisible: false
                },
                {
                    id: 3,
                    classId: 'xuanwo',
                    name: '旋涡风机频率',
                    haveSwitch: true,
                    haveData: true,
                    open: true,
                    data: 300,
                    controlVisible: false
                },
                {
                    id: 4,
                    classId: 'fenxi',
                    name: '分析气泵',
                    haveSwitch: true,
                    haveData: false,
                    open: true,
                    controlVisible: false
                },{
                    id: 5,
                    classId: 'co2',
                    name: 'CO2流量',
                    haveSwitch: false,
                    haveData: true,
                    data: 20,
                    controlVisible: false
                },
                {
                    id: 6,
                    classId: 'airf',
                    name: '空气流量F',
                    haveSwitch: false,
                    haveData: true,
                    data: 4,
                    controlVisible: false
                },
                {
                    id: 7,
                    classId: 'airfvb',
                    name: '空气流量F',
                    haveSwitch: false,
                    haveData: true,
                    data: 5,
                    controlVisible: false
                },
                {
                    id: 8,
                    classId: 'm1',
                    name: 'M1开度（%）',
                    haveSwitch: false,
                    haveData: true,
                    data: 50,
                    controlVisible: false
                },
                {
                    id: 9,
                    classId: 'm2',
                    name: 'M2开度（%）',
                    haveSwitch: false,
                    haveData: true,
                    data: 60,
                    controlVisible: false
                },
                {
                    id: 10,
                    classId: 'm3',
                    name: 'M3开度（%）',
                    haveSwitch: false,
                    haveData: true,
                    data: 70,
                    controlVisible: false
                },
                {
                    id: 11,
                    classId: 'beng',
                    name: '气泵',
                    haveSwitch: true,
                    haveData: false,
                    open: true,
                    controlVisible: false
                }
                
            ], // 操作选项的数据
            members: [
                '2021244091', '3017218063', '3017218071', '100220'
            ], // 实验中的成员
            memberVisible: false, // 成员抽屉面板控制
            buffer: "", //聊天区缓存
            messages: [
                {
                    username: '100220',
                    content: "同学你好，我是李罡，很高兴与你一起做实验"
                },
                {
                    username: '2021244091',
                    content: "同学你好，我是刘兴宇"
                },
                {
                    username: '2021244091',
                    content: "好的"
                },
                {
                    username: '3017128063',
                    content: "同学你好，我是刘杭学，很高兴与你一起做实验"
                },
                {
                    username: '3017218071',
                    content: "同学你好，我是xxx，我是第一次做实验，很高兴与你一起做实验，希望系统不要有BUG"
                },{
                    username: '100220',
                    content: "同学你好，我是李罡，很高兴与你一起做实验"
                },{
                    username: '100220',
                    content: "同学你好，我是李罡，很高兴与你一起做实验"
                },{
                    username: '100220',
                    content: "同学你好，我是李罡，很高兴与你一起做实验"
                },{
                    username: '100220',
                    content: "同学你好，我是李罡，很高兴与你一起做实验"
                },{
                    username: '100220',
                    content: "同学你好，我是李罡，很高兴与你一起做实验"
                },{
                    username: '100220',
                    content: "同学你好，我是李罡，很高兴与你一起做实验"
                },
            ], //聊天记录数据
            haveNewMsg: true //聊天区是否有新消息
        }
    },
    methods: {
        // 发送聊天内容
        sendBuffer(){

        },
        // 改变摄像头
        changeCam(index){
            this.nowVideo = this.cams[index - 1];
        },
        // 显示成员信息和聊天框
        showMember(){
            this.memberVisible = true;
        },
        // 关闭成员信息和聊天框
        closeMember(){
            this.memberVisible = false;
            this.haveNewMsg = false; //新消息已经阅读了
        },
        // 修改数据
        updateOptions(index){

        },
        // 修改开关状态
        updateSwitch(index){

        }
    },
    mounted() {
        this.nowVideo = this.cams[0];
        console.log(this.$refs.video.clientWidth);
        this.videoHeight = this.$refs.video.clientWidth / 16 * 9;
        console.log(this.videoHeight);

        /* 获取播放器元素 */
        // var player = document.getElementById('ysOpenDevice').contentWindow;
        // player.postMessage("play", "https://open.ys7.com/ezopen/h5/iframe") /* 播放 */
        // player.postMessage("stop", "https://open.ys7.com/ezopen/h5/iframe") /* 结束 */
        // player.postMessage("capturePicture", "https://open.ys7.com/ezopen/h5/iframe") /* 截图 */
        // player.postMessage("openSound", "https://open.ys7.com/ezopen/h5/iframe") /* 开启声音 */
        // player.postMessage("closeSound", "https://open.ys7.com/ezopen/h5/iframe") /* 关闭声音 */
        // player.postMessage("startSave", "https://open.ys7.com/ezopen/h5/iframe") /* 开始录制 */
        // player.postMessage("stopSave", "https://open.ys7.com/ezopen/h5/iframe") /* 结束录制 */

        // this.playr = new EZUIKit.EZUIKitPlayer({
        //     id: "ysopen", // 视频容器ID
        //     accessToken: "at.0dcgegun62wxel9acx52q6pn9s1kzef4-6ezinbbeqy-1kli1yl-uwrzaibo5",
        //     url: "ezopen://open.ys7.com/C78957921/1.live",
        //     template: 'theme',//
        //     autoplay: true,
        //     plugin: ['talk'],// 加载插件，talk-对讲
        //     startTalk:()=> this.playr.startTalk(),
        //     stopTalk: ()=> this.playr.stopTalk(),
        //     width: 600,
        //     height:400,
        // });
    },
}
</script>

<style scoped>
*{
    box-sizing: border-box;
}

#absorptionDesorption{
    height: 100%;
    box-sizing: border-box;
    display: flex;
}

.img_block{
    position: relative;
    height: 100%;
    display: flex;
    user-select: none;
}

#ex_img{
    height: 100%;
    object-fit: contain;
}

.side_block{
    height: 100%;
    padding-right: 30px;
    position: relative;
}

#ysopen, .ex_title, .ex_bottom{
    width: 100%;
}

#ysopen{
    width: 100%;
}

#video_change_button{
    text-align: center;
}

.ex_title{
    text-align: center;
    font-size: 25px;
    padding: 10px 0;
    box-sizing: border-box;
    height: 10%;
    vertical-align: middle;
}

.ex_time{
    text-align: center;
    padding-bottom: 10px;
}

#tabs{
    height: 80%;
    position: relative;
}

#tabs >>> .el-tabs__content{
    width: 100%;
    position: absolute;
    top: 55px;
    bottom: 0;
}

.ex_bottom{
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
    height: 10%;
    padding-right: 30px;
    text-align: center;
}

.tab_page{
    height: 100%;
}

/* 成员标签页 */

.members_block, .talk_block, .display_block{
    padding: 0 20px;
}

.member_title{
    font-weight: bold;
    padding-bottom: 10px;
    width: 100%;
}

.members_block{
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 10px;
    height: 120px;
}

.members{
    text-align: center;
    width: 50%;
}

.talk_block{
    width: 100%;
    height: 350px;
}

.display_block{
    height: 250px;
    width: 100%;
    border-style: solid;
    border-width: 1px;
    border-color: rgb(209, 209, 209);
    padding: 10px;
    margin-bottom: 10px;
    overflow-y: scroll;
}

.speaker{
    color: #409EFF;
}

.send_block{
    width: 100%;
    display: flex;   
}

#send_input{
    width: 80%;
}

#send_button{
    width: 20%;
}

/* 操作标签页 */
.control_block{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding-top: 30px;
}

#now_controller{
    width: 100%;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.control_button{
    width: 45%;
}

/* 操作位置 */
.control_show{
    font-weight: bold;
    color: #F56C6C;
    font-size: 24px;
    display: flex;
    align-items: center;
    position: absolute;
    z-index: 5;
}

.control_pop{
    display: flex;
    flex-wrap: wrap;
}

.control_input{
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    width: 100%;
}

#lixin1{
    top: 83.5%;
    left: 43%;
}

#lixin2{
    top: 83.5%;
    left: 56%;
}

#xuanwo{
    top: 82%;
    left: 84%;
}

#fenxi{
    top: 45%;
    left: 22%;
}

#airf{
    top: 30%;
    left: 88%;
}

#airfvb{
    top: 34%;
    left: 16.3%;
}

#co2{
    top: 29.5%;
    left: 3.5%;
}

#beng{
    top: 82%;
    left: 15.5%;
}

#m1{
    top: 41.5%;
    left: 43%;
}

#m2{
    top: 41.5%;
    left: 59%;
}

#m3{
    top: 64%;
    left: 87%;
}

/* 数据位置 */
.param_show{
    font-weight: bold;
    color: #409EFF;
    font-size: 20px;
    position: absolute;
    z-index: 5;
}

#f3{
    top: 30.5%;
    left: 42%;
}

#f4{
    top: 30.5%;
    left: 57%;
}


#t1{
    top: 7%;
    left: 14%;
}

#t2{
    top: 81%;
    left: 30%;
}

#t3{
    top: 23%;
    left: 91%;
}

#p1{
    top: 36.5%;
    left: 42%;
}

#p2{
    top: 36.5%;
    left: 60%;
}

#p3{
    top: 11%;
    left: 35%;
}

#p4{
    top: 11%;
    left: 68.5%;
}

#p5{
    top: 45%;
    left: 9.5%;
}

#l1{
    top: 74%;
    left: 43%;
}

#l2{
    top: 74%;
    left: 58%;
}
</style>