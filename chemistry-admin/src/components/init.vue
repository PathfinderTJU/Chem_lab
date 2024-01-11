<template>
    <div id="init">
        <!-- 标题 -->
        <div class="title_block">
            <div class="title">初始值设置</div>
        </div>
        <!-- 表格 -->
        <div class="title_block">
            <div class="sub_title">吸收-解吸</div>
        </div>
        <div class="table_block">
            <el-table :data="absorptionData" border>
                <el-table-column v-for="(item, index) in absorptionData[0]" :key="index" :label="index">
                    <template slot-scope="scope">
                        <el-input v-model="absorptionData[0][index]"></el-input>
                    </template>
                </el-table-column>                 
            </el-table>
            <div class="add_footer">
                <el-button type="primary" @click="submitAbosrption()"  :disabled="isDisabled">修改</el-button>
            </div>
        </div>

        <div class="title_block">
            <div class="sub_title">传热</div>
        </div>
        <div class="table_block">
            <el-table :data="conductForm" border>
                <el-table-column v-for="(item, index) in conductForm[0]" :key="index" :label="index">
                    <template slot-scope="scope">
                        <el-input v-model="conductForm[0][index]" @input="updateTable()"></el-input>
                    </template>
                </el-table-column>
                
            </el-table>
            <div class="add_footer">
                <el-button type="primary" @click="submitConduct()"  :disabled="isDisabled">修改</el-button>
            </div>
        </div>

        <div class="title_block">
            <div class="sub_title">流动过程</div>
        </div>
        <div class="table_block">
            <el-table :data="flowForm" border>
                <el-table-column v-for="(item, index) in flowForm[0]" :key="index" :label="index">
                    <template slot-scope="scope">
                        <el-input v-model="flowForm[0][index]"></el-input>
                    </template>
                </el-table-column>
                
            </el-table>
            <div class="add_footer">
                <el-button type="primary" @click="submitFlow()"  :disabled="isDisabled">修改</el-button>
            </div>
        </div>

        <div class="title_block">
            <div class="sub_title">精馏</div>
        </div>
        <div class="table_block">
            <el-table :data="rectificationForm" border>
                <el-table-column v-for="(item, index) in rectificationForm[0]" :key="index" :label="index">
                    <template slot-scope="scope">
                        <el-input v-model="rectificationForm[0][index]"></el-input>
                    </template>
                </el-table-column>
                
            </el-table>
            <div class="add_footer">
                <el-button type="primary" @click="submitRectification()"  :disabled="isDisabled">修改</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default{
    name: "init",
    data(){       
        return{
            absorptionData: [{
                f1SV: 1,
                f2SV: 2,
                pl1: 1,
                pl2: 1,
                pl3: 1,
                kd3: 1,
                qbkg: 1,
                fxbkg: 2,
                fjkg: 3,
                lxb1KG: 1,
                lxb2KG: 1,
                m1KG: 1,
                m2KG: 1
            }],
            conductForm: [{
                e1SV: 1,
                pl: 2,
                v1: 3,
                v2: 4,
                v3: 5,
                v4: 6,
                v5: 7,
                v6: 8,
                fjkg: 9,
                jrkg: 10
            }],
            flowForm: [{
                pl: 1,
                kd: 2,
                lxbkg: 3,
                mv2KG: 4,
                mv3KG: 5,
                mv4KG: 6
            }],
            rectificationForm: [{
                e1SV: 1,
                t7SV: 2,
                pl1: 3,
                pl2: 4,
                v1: 5,
                v2: 6,
                v3: 7,
                v4: 8,
                v5: 9,
                v6: 10,
                v7: 11,
                v8: 12,
                v9: 13,
                fskg: 15,
                yrkg: 16,
                hlbkg: 17,
                jlbkg: 18,
                lqsbkg: 19,
                jrkg: 20
            }],
            origin: {},
            isDisabled: false, //控制按钮禁用
        }
    },
    methods: {
        // 吸收解析修改
        submitAbosrption(){
            // 验证合法性，补0
            let data = this.absorptionData[0];
            for (let x in data){
                if (data[x] === ""){
                    data[x] = 0;
                }

                if (x in this.origin.xssj){
                    this.origin.xssj[x] = data[x];
                }
            }
            
            data = this.origin.xssj;
            
            fetch(this.URL + "api/resources/init_xssj_init_params", {
                method: 'POST',
                headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token"),
					'Content-Type': 'application/json'
				},
                body: JSON.stringify(data)
            }).then(res => res.json()).then(res => {
                if(res.success){
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                    this.getInitData();
                }else{
                    this.$message({
                        message: "修改失败，服务器出错",
                        type: 'error'
                    })
                }
            }).catch(err => {
                this.$message({
                    message: "加载失败，服务器出错" + err,
                    type: 'error'
                })
                return false;
            })
        },
        // 传热修改
        submitConduct(){
            // 验证合法性，补0
            let data = this.conductForm[0];
            for (let x in data){
                if (data[x] === ""){
                    data[x] = 0;
                }

                if (x in this.origin.crsj){
                    this.origin.crsj[x] = data[x];
                }
            }
            
            data = this.origin.crsj;
            
            fetch(this.URL + "api/resources/init_crsj_init_params", {
                method: 'POST',
                headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token"),
					'Content-Type': 'application/json'
				},
                body: JSON.stringify(data)
            }).then(res => res.json()).then(res => {
                if(res.success){
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                    this.getInitData();
                }else{
                    this.$message({
                        message: "修改失败，服务器出错",
                        type: 'error'
                    })
                }
            }).catch(err => {
                this.$message({
                    message: "加载失败，服务器出错" + err,
                    type: 'error'
                })
                return false;
            })
        },
        // 流动修改
        submitFlow(){
            // 验证合法性，补0
            let data = this.flowForm[0];
            for (let x in data){
                if (data[x] === ""){
                    data[x] = 0;
                }

                if (x in this.origin.ltsj){
                    this.origin.ltsj[x] = data[x];
                }
            }
            
            data = this.origin.ltsj;
            
            fetch(this.URL + "api/resources/init_ltsj_init_params", {
                method: 'POST',
                headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token"),
					'Content-Type': 'application/json'
				},
                body: JSON.stringify(data)
            }).then(res => res.json()).then(res => {
                if(res.success){
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                    this.getInitData();
                }else{
                    this.$message({
                        message: "修改失败，服务器出错",
                        type: 'error'
                    })
                }
            }).catch(err => {
                this.$message({
                    message: "加载失败，服务器出错" + err,
                    type: 'error'
                })
                return false;
            })
        },
        // 精馏修改
        submitRectification(){
            // 验证合法性，补0
            let data = this.rectificationForm[0];
            for (let x in data){
                if (data[x] === ""){
                    data[x] = 0;
                }

                if (x in this.origin.jlsj){
                    this.origin.jlsj[x] = data[x];
                }
            }
            
            data = this.origin.jlsj;
            
            fetch(this.URL + "api/resources/init_jlsj_init_params", {
                method: 'POST',
                headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token"),
					'Content-Type': 'application/json'
				},
                body: JSON.stringify(data)
            }).then(res => res.json()).then(res => {
                if(res.success){
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                    this.getInitData();
                }else{
                    this.$message({
                        message: "修改失败，服务器出错",
                        type: 'error'
                    })
                }
            }).catch(err => {
                this.$message({
                    message: "加载失败，服务器出错" + err,
                    type: 'error'
                })
                return false;
            })
        },
        updateTable(){
            this.$forceUpdate();
        },
        // 获取初始值列表数据
        getInitData(){
            fetch(this.URL + "api/resources/get_all_init_params", {
                method: "GET",
                headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
            }).then(res => res.json()).then(res => {
                // 填充缓存
                this.origin = res.data;

                // 填入数据
                // 吸收解析
                this.absorptionData[0].f1SV= res.data.xssj.f1SV;
                this.absorptionData[0].f2SV = res.data.xssj.f2SV;
                this.absorptionData[0].pl1 = res.data.xssj.pl1;
                this.absorptionData[0].pl2 = res.data.xssj.pl2;
                this.absorptionData[0].pl3 = res.data.xssj.pl3;
                this.absorptionData[0].kd3 = res.data.xssj.kd3;
                this.absorptionData[0].qbkg = res.data.xssj.qbkg;
                this.absorptionData[0].fxbkg = res.data.xssj.fxbkg;
                this.absorptionData[0].fjkg = res.data.xssj.fjkg;
                this.absorptionData[0].lxb1KG = res.data.xssj.lxb1KG;
                this.absorptionData[0].lxb2KG = res.data.xssj.lxb2KG;
                this.absorptionData[0].m1KG = res.data.xssj.m1KG;
                this.absorptionData[0].m2KG = res.data.xssj.m2KG;

                // 传热
                this.conductForm[0].e1SV = res.data.crsj.e1SV;
                this.conductForm[0].fjkg = res.data.crsj.fjkg;
                this.conductForm[0].jrkg = res.data.crsj.jrkg;
                this.conductForm[0].pl = res.data.crsj.pl;
                this.conductForm[0].v1 = res.data.crsj.v1;
                this.conductForm[0].v2 = res.data.crsj.v2;
                this.conductForm[0].v3 = res.data.crsj.v3;
                this.conductForm[0].v4 = res.data.crsj.v4;
                this.conductForm[0].v5 = res.data.crsj.v5;
                this.conductForm[0].v6 = res.data.crsj.v6;
                
                // 流动过程
                this.flowForm[0].pl = res.data.ltsj.pl;
                this.flowForm[0].kd = res.data.ltsj.kd;
                this.flowForm[0].lxbkg = res.data.ltsj.lxbkg;
                this.flowForm[0].mv2KG = res.data.ltsj.mv2KG;
                this.flowForm[0].mv3KG = res.data.ltsj.mv3KG;
                this.flowForm[0].mv4KG = res.data.ltsj.mv4KG;

                // 精馏
                this.rectificationForm[0].e1SV = res.data.jlsj.e1SV;
                this.rectificationForm[0].t7SV = res.data.jlsj.t7SV;
                this.rectificationForm[0].pl1 = res.data.jlsj.pl1;
                this.rectificationForm[0].pl2 = res.data.jlsj.pl2;
                this.rectificationForm[0].v1 = res.data.jlsj.v1;
                this.rectificationForm[0].v2 = res.data.jlsj.v2;
                this.rectificationForm[0].v3 = res.data.jlsj.v3;
                this.rectificationForm[0].v4 = res.data.jlsj.v4;
                this.rectificationForm[0].v5 = res.data.jlsj.v5;
                this.rectificationForm[0].v6 = res.data.jlsj.v6;
                this.rectificationForm[0].v7 = res.data.jlsj.v7;
                this.rectificationForm[0].v8 = res.data.jlsj.v8;
                this.rectificationForm[0].v9 = res.data.jlsj.v9;
                this.rectificationForm[0].fskg = res.data.jlsj.fskg;
                this.rectificationForm[0].yrkg = res.data.jlsj.yrkg;
                this.rectificationForm[0].hlbkg = res.data.jlsj.hlbkg;
                this.rectificationForm[0].jlbkg = res.data.jlsj.jlbkg;
                this.rectificationForm[0].lqsbkg = res.data.jlsj.lqsbkg;
                this.rectificationForm[0].jrkg = res.data.jlsj.jrkg;
            })
        }
    },
    mounted() {
        this.getInitData();
    },
}
</script>

<style>
.el-table .cell{
  white-space: pre-line;
}

.el-table .pointer_header{
    cursor: pointer;
}
</style>

<style scoped>
div {
  box-sizing: border-box;
}

#init{
  padding: 10px 30px 10px 30px;
}

.title_block{
  width: 100%;
  margin: 30px 0;
}

.title{
    font-size: 25px;
}

.sub_title{
    font-size: 18px;
}

.add_footer{
    margin: 20px 0;
}

.table_block{
    position: relative;
}

.table_block el-table{
    position: relative;
}

.table_block el-input{
    z-index: 1;
}
</style>