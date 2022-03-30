<template>
    <div id="flowProcess">
        <div class="img_block">
            <img src="../assets/flowProcess.jpg" id="ex_img" ref="img" @load="setVideoHeight"/>
            <!-- 显示数据 -->
            <span class="param_show" v-for="(value, key) in params_show" :key="key.id" :id="key">{{value}}</span>
            <span class="control_show" v-for="(value, key) in options_show" :key="key" :id="key">
                <span class="control_data" v-if="value.haveData">{{value.data}}</span>
                <span class="control_data" v-if="value.haveSwitch">{{value.open ? '打开' : '关闭'}}</span>
                <el-popover class="control_pop" placement="top" trigger="click" width="160" v-model="value.controlVisible" @show="showControl(key)">
                    <div>{{value.name}}</div>
                    <div class="control_input" v-if="value.haveData">
                        <el-input v-model="dataBuffer"></el-input>
                        <el-button type="primary" @click="updateOption(key)" :disabled="(value.haveSwitch && !value.open) || releaseDisabled">修改</el-button>
                    </div>
                    <div v-if="value.haveSwitch">
                        <el-switch v-model.lazy="switchBuffer" active-text="打开" inactive-text="关闭" @change="updateSwitch(key)" :disabled="releaseDisabled"></el-switch>
                    </div>
                <i :style="{color:switchColor}" style="padding-left: 5px;font-size:30px;cursor:pointer;}" class="el-icon-s-tools" slot="reference"></i>
                </el-popover>
            </span>
        </div>
        <div class="side_block" ref="sideBlock">
            <!-- 标题和时间 -->
            <div class="ex_title">流动过程实验</div>
            <div class="ex_time">实验结束时间：<span style="font-weight:bold;color: #409EFF">{{endTime}}</span></div>
            <!-- 摄像头 -->
            <iframe :src="nowVideo.url" id="ysopen" ref="video" :style="{height:videoHeight + 'px'}" allowfullscreen></iframe>
            <el-pagination id="video_change_button" small layout="prev, pager, next" :total="40" @current-change="changeCam"></el-pagination>
            <!-- 控制模块 -->
            <div class="control_block">
                <div id="now_controller">
                    <span>当前操作者：{{nowController}}</span>
                    <el-badge :is-dot="haveNewMsg" class="item">
                        <el-button type="text" @click="showMember">成员和聊天</el-button>
                    </el-badge>
                </div>
                <el-button class="control_button" type="primary" @click="applyToken" :disabled="applyDisabled">申请操作</el-button>
                <el-button class="control_button" type="warning" @click="releaseToken" :disabled="releaseDisabled">结束操作</el-button>
            </div>
            <!-- 退出按钮 -->
            <div class="ex_bottom">
                <el-button type="danger" :disabled="applyDisabled" :title="applyDisabled ? '请先释放操作权' : '' " @click="exit">退出实验</el-button>
            </div>
        </div>
        <!-- 成员信息和聊天框 -->
        <el-drawer title="成员信息" :visible="memberVisible" @open="refreshMember" @close="closeMember">
            <div class="members_block">
                <div class="member_title">在实验中的成员</div>
                <div class="members" v-for="item in members" :key="item">{{item}}</div>
            </div>
            <div class="talk_block">
                <div class="member_title">交流区</div>
                <div class="display_block">
                    <div class="messages" v-for="item in messages" :key="item.content">
                        <span class="speaker">{{item.username}}</span>
                        说：{{item.message}}
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
    name: 'flowProcess',
    data(){
        return{
            ticketId: 1,
            endTime: "---",
            snEndTime: [""],
            params_show:{ //显示的数据
                'f1': '---',
                'p1': '---',
                'p2': '---',
                'p3': '---',
                'j1': '---',
                't1': '---'
            }, 
            cams: [
                // {
                //     "url": "https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/C78957921/1.live&accessToken=at.cbh6yfgv0nkv95paagconptncql92d34-8hfg6l5dzd-0bc78bp-aiqonia0z&id=ysopen",
                //     "title": "正对摄像头1"
                // },
                {
                    "url": "https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/E33136311/2.hd.live&accessToken=at.1sn9bw7j0llu53q698y06id777b4otkw-5bzy7rwdye-0879en4-tkefsfdxe&id=ysopen",
                    "title": "正对摄像头2"
                },
                {
                    "url": "https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/E33136311/3.hd.live&accessToken=at.1sn9bw7j0llu53q698y06id777b4otkw-5bzy7rwdye-0879en4-tkefsfdxe&id=ysopen",
                    "title": "正对摄像头3"
                },
                {
                    "url": "https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/E33136311/4.hd.live&accessToken=at.1sn9bw7j0llu53q698y06id777b4otkw-5bzy7rwdye-0879en4-tkefsfdxe&id=ysopen",
                    "title": "正对摄像头4"
                }
            ], //摄像头数据
            nowVideo: {}, //当前摄像头数据
            videoHeight: 0, // 摄像头高度
            nowController: "", //当前操作者
            applyDisabled: false, //申请令牌禁用
            releaseDisabled: true, //释放令牌禁用
            switchColor: "#E6A23C", //齿轮颜色
            options_show: { //操作选项数据
                "pl": {
                    id: 1,
                    name: '离心泵变频器频率(PL)',
                    haveSwitch: true,
                    haveData: true,
                    open: false,
                    data: '---',
                    switchName: "lxbkg",
                    dataName: 'pl',
                    controlVisible: false
                },
                "m1pv": {
                    id: 2,
                    name: '阀V25开度(M1)',
                    haveSwitch: false,
                    haveData: true,
                    data: '---',
                    dataName: "m1SV",
                    controlVisible: false
                },
                "m2pv":{
                    id: 3,
                    name: '阀V22开度(M2)',
                    haveSwitch: false,
                    haveData: true,
                    data: '---',
                    dataName: "m2SV",
                    controlVisible: false
                }
            }, // 操作选项的数据
            members: [], // 实验中的成员
            memberVisible: false, // 成员抽屉面板控制
            buffer: "", //聊天区缓存
            dataBuffer: "", //数据区缓存
            switchBuffer: "", //开关区缓存
            messages: [], //聊天记录数据
            haveNewMsg: false, //聊天区是否有新消息,
            timeChecked: false, // 是否发送过到时警告了
            dataTimer: -1, // 存储刷新数据定时器的变量
            msgAndTimeTimer: -1 // 存储刷新消息和结束时间的变量
        }
    },
    methods: {
        // 获取结束时间
        getEndTime(){
            fetch(this.URL + 'api/experiementing/' + this.ticketId + 
                '/endTime?ticketId=' + this.ticketId, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if(res.success){
                    let data = res.data;
                    this.endTime = data;
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                    }else if (res.status === 401){
                        this.$message({
                            message: "实验已结束",
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
        // 发送聊天内容
        sendBuffer(){
            let requestData = {
                username: sessionStorage.getItem("userName"),
                message: this.buffer
            };

            fetch(this.URL + 'api/experiementing/' + this.ticketId + 
                '/boarding?ticketId=' + this.ticketId, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token"),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            }).then(res => res.json()).then(res => {
                if(res.success){
                    this.messages.push({
                        username: sessionStorage.getItem("userName"),
                        message: this.buffer
                    });

                    this.$message({
                        message: "留言发送成功",
                        type: 'success'
                    })
                    this.buffer = "";
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                    }else if (res.status === 401){
                        this.$message({
                            message: "实验已结束",
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
        // 动态设置视频高度
        setVideoHeight(){
            this.videoHeight =  (document.body.clientWidth - this.$refs.img.clientWidth) / 16 * 9;
        },
        // 改变摄像头
        changeCam(index){
            this.nowVideo = this.cams[index - 1];
        },
        // 显示操作框，填充缓冲区防止修改时数据随意改变
        showControl(key){
            if (this.options_show[key].haveData){
                this.dataBuffer = this.options_show[key].data;
            }

            if (this.options_show[key].haveSwitch){
                this.switchBuffer = this.options_show[key].open;
            }
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
        // 申请令牌
        applyToken(){
            fetch(this.URL + 'api/experiementing/' + this.ticketId + 
                '/applyToken?ticketId=' + this.ticketId + 
                "&name=" + sessionStorage.getItem("userName"), {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if(res.success){
                    this.$message({
                        message: "已获得操作权",
                        type: 'success'
                    })
                    this.nowController = sessionStorage.getItem("userName");
                    this.applyDisabled = true;
                    this.releaseDisabled = false;
                }else{
                    if (res.status === 403){
                        this.$message({
                            message: "操作权已被占用",
                            type: 'error'
                        })
                    }else if (res.status === 401){
                        this.$message({
                            message: "实验已结束",
                            type: 'error'
                        })
                    }else if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
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
        // 释放令牌
        releaseToken(){
            this.$confirm('确认要释放操作权吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                fetch(this.URL + 'api/experiementing/' + this.ticketId + 
                    '/releaseToken?ticketId=' + this.ticketId + 
                    "&name=" + sessionStorage.getItem("userName"), {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer  ' + localStorage.getItem("token") 
                    }
                }).then(res => res.json()).then(res => {
                    if(res.success){
                        this.$message({
                            message: "已释放操作权",
                            type: 'success'
                        })
                        this.nowController = "";
                        this.applyDisabled = false;
                        this.releaseDisabled = true;
                    }else{
                        if (res.status === 500){
                            this.$message({
                                message: "登录已过期",
                                type: 'error'
                            })
                        }else if (res.status === 401){
                            this.nowController = "";
                            this.applyDisabled = false;
                            this.releaseDisabled = true;
                            this.$message({
                                message: "实验已结束",
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
            })
        },
        // 修改数据
        updateOption(index){
            let name = index + "";
            let temp_name = name;
            name = this.options_show[name].dataName;
            let requestData = {
                paramName: name.toUpperCase(),
                paramValue: this.dataBuffer + ""
            }

            fetch(this.URL + 'api/experiementing/' + this.ticketId + 
                '/?ticketId=' + this.ticketId +
                '&name=' + sessionStorage.getItem("userName"), {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token"),
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(requestData)
            }).then(res => res.json()).then(res => {
                if(res.success){
                    // 立刻刷新数据，防止跳闪
                    this.refreshData();
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                }else{
                    this.dataBuffer = this.options_show[temp_name].data;
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                    }else if (res.status === 601){
                        this.$message({
                            message: "输入值非法",
                            type: 'error'
                        })
                    }else if (res.status === 401){
                        this.$message({
                            message: "实验已结束",
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
        // 修改开关状态
        updateSwitch(index){
            let name = index + "";
            let temp_name = name;
            name = this.options_show[name].switchName;
            let requestData = {
                paramName: name.toUpperCase(),
                paramValue: Number(this.switchBuffer)
            }

            fetch(this.URL + 'api/experiementing/' + this.ticketId + 
                '/?ticketId=' + this.ticketId +
                '&name=' + sessionStorage.getItem("userName"), {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token"),
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(requestData)
            }).then(res => res.json()).then(res => {
                if(res.success){
                    // 立刻刷新数据，防止跳闪
                    this.refreshData();
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                }else{
                    this.switchBuffer = this.options_show[temp_name].open;
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                    }else if (res.status === 401){
                        this.$message({
                            message: "实验已结束",
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
        // 刷新成员列表
        refreshMember(){
            fetch(this.URL + 'api/experiementing/' + this.ticketId + 
                '/getStudents?ticketId=' + this.ticketId, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if(res.success){
                    let data = res.data;
                    this.members = data;
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                    }else if (res.status === 401){
                        this.$message({
                            message: "实验已结束",
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
        // 刷新数据列表
        refreshData(){
            fetch(this.URL + 'api/experiementing/' + this.ticketId + 
                '/?ticketId=' + this.ticketId, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if(res.success){
                    let newData = res.data.param;
                    let nowToken = res.data.token;
                    

                    //更新当前操作者状态
                    this.nowController = nowToken;
                    if (this.nowController === sessionStorage.getItem("userName")){
                        this.applyDisabled = true;
                        this.releaseDisabled = false;
                    }else{
                        this.applyDisabled = false;
                        this.releaseDisabled = true;
                    }


                    // 更新数据
                    this.params_show["f1"] = newData["f1"];
                    this.params_show["j1"] = newData["j1"];
                    this.params_show["t1"] = newData["t1"];
                    this.params_show["p1"] = newData["p1"];
                    this.params_show["p2"] = newData["p2"];
                    this.params_show["p3"] = newData["p3"];

                    this.options_show["pl"].open = Boolean(newData["lxbkg"]);
                    this.options_show['pl'].data = newData['pl'];
                    this.options_show['m1pv'].data = newData['m1PV'];
                    this.options_show['m2pv'].data = newData['m2PV'];
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                    }else if (res.status === 401){
                        this.$message({
                            message: "实验已结束",
                            type: 'error'
                        })
                        clearInterval(this.dataTimer);
                        clearInterval(this.msgAndTimeTimer);
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
        // 刷新留言板信息
        refreshMsg(){
            fetch(this.URL + 'api/experiementing/' + this.ticketId + 
                '/boarding?ticketId=' + this.ticketId, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if(res.success){
                    let data = res.data;
                    if (this.messages.length !== data.length){
                        this.haveNewMsg = true;
                    }
                    this.messages = data;
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                    }else if (res.status === 401){
                        this.$message({
                            message: "实验已结束",
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
        // 检查是否到时
        checkTime(){ 
            if (this.timeChecked){ // 只警告一次
                return false;
            }else{
                let now = new Date();
                let nowTime = now.getTime();

                let endStr = now.toLocaleDateString() + " " + this.endTime;
                let endTime = new Date(endStr);
                endTime = endTime.getTime();

                if (endTime - nowTime <= 10 * 60){
                    this.$alert('剩余实验时间：10分钟', '时间提示', {
                        confirmButtonText: '确定',
                    });
                    this.timeChecked = true;
                }
            }
        },
        // 退出实验
        exit(){
           this.$confirm('确认退出实验吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 清除定时器
                clearInterval(this.dataTimer);
                clearInterval(this.msgAndTimeTimer);
                this.$router.replace("/index");
            }) 
        },
        // 监听浏览器关闭事件
        beforeunloadHandler(e){
            if (this.nowController === sessionStorage.getItem("userName")){
                this.$message({
                    message: "请释放操作权再离开！！！",
                    type: 'error'
                })
            }
            e = e || window.event
            if (e) {
                e.returnValue = '关闭提示'
            }
            // debugger
            return '关闭提示'
        }
    },
    created() {
        // 获取ticketId
        let query = this.$route.query;
        this.ticketId = +query.ticketId;
    },
    mounted() {
        window.addEventListener('beforeunload', e => this.beforeunloadHandler(e));
        this.nowVideo = this.cams[0];

        //初始获取数据
        this.getEndTime();
        this.refreshMsg();
        this.refreshData();


        // 循环刷新数据ing...
        // setInerval直接使用会卡死
        this.msgAndTimeTimer = window.setInterval(() => {
            setTimeout(this.refreshMsg, 0);
            setTimeout(this.checkTime, 0);
        }, 5000);

        this.dataTimer = window.setInterval(() => {
            setTimeout(this.refreshData, 0);
        }, 1000);
    },
    destroyed(){
        // 阻止关闭
        window.removeEventListener('beforeunload', e => this.stopExit(e));
        // 清除定时器
        clearInterval(this.dataTimer);
        clearInterval(this.msgAndTimeTimer);
    }
}
</script>

<style scoped>
*{
    box-sizing: border-box;
}

#flowProcess{
    height: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    transition: all .4s;
    image-rendering: -moz-crisp-edges; /* Firefox */     
    image-rendering: -o-crisp-edges; /* Opera */      
    image-rendering: -webkit-optimize-contrast; /*Webkit (non-standard naming) */ 
    image-rendering: crisp-edges; 
    -ms-interpolation-mode: nearest-neighbor; /* IE (non-standard property) */
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
    width: 100%;
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
    font-size: 20px;
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


#pl{
    top:92%;
    left: 28%;
}

#m1pv{
    left: 21%;
    top: 38%;
}

#m2pv{
    left: 85%;
    top: 51%;
}

/* 数据位置 */

.param_show{
    font-weight: bold;
    color: #409EFF;
    font-size: 20px;
    position: absolute;
    z-index: 5;
}

#p1{
    top: 56.5%;
    left: 46.5%;
}

#p2{
    top: 74.5%;
    left: 13%;
}

#p3{
    top: 81%;
    left: 27%;
}

#f1{
    top: 58.5%;
    left: 60%;
}

#j1{
    top: 87%;
    left: 18%;
}

#t1{
    top: 77.5%;
    left: 44.5%;
}

</style>