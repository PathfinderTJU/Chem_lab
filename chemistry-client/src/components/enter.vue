<template>
    <div id="enter">
        <div class="title_block">
            <div class="title">进入实验</div>
        </div>
        <div class="table_block">
            <el-select v-model="nowType">
                <el-option v-for="item in devices" :key="item.name" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-button id="enter_button" type="primary">进入实验</el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'enter',
    data(){
        return{
            nowType: '',
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
        }
    },
    methods: {

    }
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