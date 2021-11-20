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
                        <span>{{weekDays[scope.row.weekday]}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="class" label="时间" align="center">
                    <template slot-scope="scope">
                        <span>{{classes[scope.row.class]}}</span>
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
            types: ["精馏", "吸收-解吸", "化工传热", "流动过程"], //设备类型显示字符
            weekDays: ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"], //星期显示字符
            reserveData: [
                {
                    reserveId: 0,
                    date: "2021-11-20",
                    weekday: 5,
                    class: 0,
                    deviceType: 2,
                    deviceName: "传热设备1"
                }
            ]
        }
    },
    methods: {
        // 取消预约
        cancel(scope){
            let id = this.reserveData[scope.$index].reserveId;
        }
    },
    created() {
        // 填充weekday属性
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