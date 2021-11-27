<template>
    <div id="absorptionDesorption">
        <div class="img_block">
            <img src="../assets/absorption.jpg" id="ex_img"/>
            <span class="param_show" v-for="(value, key) in params_show" :key="key" :id="key">{{value}}</span>
        </div>
        <div class="side_block" ref="sideBlock">
            <div class="ex_title">吸收-解吸实验</div>
            <template>
                <el-tabs v-model="activeTab" id="tabs">
                    <!-- 视频标签页 -->
                    <el-tab-pane label="视频监控" name="first" class="tab_page">
                        <iframe :src="nowVideo.url"
                            id="ysopen"
                            ref="video">
                        </iframe>
                        <el-pagination id="video_change_button" small layout="prev, pager, next" :total="40"></el-pagination>
                    </el-tab-pane>
                    <!-- 操作标签页 -->
                    <el-tab-pane label="操作设备" name="second" class="tab_page">
                        <div class="control_block">
                            <div id="now_controller">当前操作者：{{nowController}}</div>
                            <el-button class="control_button" type="primary">申请操作</el-button>
                            <el-button class="control_button" type="warning">结束操作</el-button>
                        </div>
                        <div class="option_block">
                            <div class="option" v-for="item in option_data" :key="item.id">
                                <div class="option_title">{{item.name}}</div>
                                <el-input v-model="item.value"></el-input>
                            </div>
                            <el-button id="option_submit_button" type="primary">修改数据</el-button>
                        </div>
                    </el-tab-pane>
                    <!-- 成员标签页 -->
                    <el-tab-pane label="实验成员" name="third" class="tab_page">
                        <div class="members_block">
                            <div class="member_title">在实验中的成员</div>
                            <div class="members" v-for="item in members" :key="item">{{item}}</div>
                        </div>
                        <div class="talk_block">
                            <div class="member_title">交流区</div>
                            <div class="display_block">
                                <div class="messages" v-for="item in messages" :key="item">
                                    <span class="speaker">{{item.username}}</span>
                                    说：{{item.content}}
                                </div>
                            </div>
                            <div class="send_block">
                                <el-input v-model="buffer" placeholder="说点什么" id="send_input"></el-input>
                                <el-button type="primary" id="send_button" @click="sendBuffer">发送</el-button>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </template>
            <div class="ex_bottom">
                <el-button type="danger">退出实验</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'absorptionDesorption',
    data(){
        return{
            activeTab: "first",
            params_show:{
                'f1': 1.23,
                'f2': 2.34,
                'f3': 3.45,
                'f4': 4.56,
                'f5': 5.67,
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
                    "url": "https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/C78957921/1.live&accessToken=ra.2xirbtir599z2cp2dwlaxeglbrld1n4w-5mmn4448p3-02e06mr-vi8cgdax5&id=ysopen",
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
            ],
            nowVideo: {},
            nowController: "2021244091",
            option_data: [
                {
                    id: "h1",
                    name: "离心泵1变频器（HZ）",
                    value: 0
                },{
                    id: "h2",
                    name: "离心泵2变频器（HZ）",
                    value: 0
                },
                {
                    id: "h3",
                    name: "漩涡风机变频器（HZ）",
                    value: 0
                },
                {
                    id: "co2",
                    name: "CO2流量",
                    value: 0
                },
                {
                    id: "air",
                    name: "空气流量",
                    value: 0
                },
                {
                    id: "m1",
                    name: "M1开度(%)",
                    value: 0
                },
                {
                    id: "m2",
                    name: "M2开度(%)",
                    value: 0
                },
                {
                    id: "m3",
                    name: "M3开度(%)",
                    value: 0
                }
            ],
            members: [
                '2021244091', '3017218063', '3017218071', '100220'
            ],
            buffer: "",
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
                },
            ]
        }
    },
    methods: {
        // 发送聊天内容
        sendBuffer(){

        }
    },
    mounted() {
        // 计算页面宽度
        let width = document.body.clientWidth;
        this.$refs.sideBlock.style.width = (width - 850) + 'px';
        this.$refs.video.style.height = (width - 850) / 16 * 9 + 'px';

        this.nowVideo = this.cams[0];

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
}

#ex_img{
    height: 100%;
    object-fit: contain;
}

.param_show{
    position: absolute;
    z-index: 5;
}

.side_block{
    height: 100%;
    padding-right: 30px;
}

#ysopen, .ex_title, .ex_bottom{
    width: 100%;
}

#ysopen >>> .loading_item{
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
    width: 100%;
    height: 10%;
    text-align: center;
    
}

.tab_page{
    height: 100%;
}

/* 成员标签页 */

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
    height: 300px;
}

.display_block{
    height: 200px;
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
}

#now_controller{
    width: 100%;
    margin-bottom: 20px;
}

.control_button{
    width: 45%;
}

.option_block{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.option{
    width: 45%;
    padding-top: 10px;
}

#option_submit_button{
    width: 100%;
    margin-top: 20px;
}

/* 数据位置 */
.param_show{
    font-weight: bold;
    color: #409EFF;
}

#f1{
    top: 30.5%;
    left: 5%;
}

#f2{
    top: 34%;
    left: 16.3%;
}

#f3{
    top: 30.5%;
    left: 42%;
}

#f4{
    top: 30.5%;
    left: 57%;
}

#f5{
    top: 30.5%;
    left: 88%;
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
    top: 41%;
    left: 38.3%;
}

#p2{
    top: 41%;
    left: 64.5%;
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