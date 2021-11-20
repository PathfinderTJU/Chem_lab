<template>
  <div id="device">
    <!-- 头部 -->
    <div class="title_block">
      <div class="title">设备管理</div>
      <el-button id="add_button" type="text" size="small" @click="addFormVisible = true">新增</el-button>
    </div>
    <!-- 选项 -->
    <div class="option_block">
      <div class="select_block">
        <el-select v-model="nowType" @change="changeType">
          <el-option v-for="item in types" :key="item.value" :value="item.value" :label="item.label">
          </el-option>
        </el-select>
      </div>
    </div>
    <!-- 正文 -->
    <div class="table_block">
      <el-table :data="deviceData" height="100%" border stripe>
        <el-table-column prop="name" label="设备名称"></el-table-column>
        <el-table-column prop="type_show" label="设备类型"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openEdit(scope)">编辑</el-button>
            <template>
              <el-popconfirm title="确定删除吗?" @confirm="deleteData(scope)">
                <el-button type="text" size="small" slot="reference">删除</el-button>
              </el-popconfirm>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 新增弹窗 -->
    <el-dialog title="新增设备" :visible.sync="addFormVisible" @close="closeDialog('addForm')">
      <el-form ref="addForm" :model="addForm" label-width="100px" label-position="left" :rules="addRules" v-loading="isLoading">
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="addForm.type">
            <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="addForm.name" maxLength="20"></el-input>
        </el-form-item>
        <div class="add_footer">
          <el-button type="primary" @click="addSubmit('addForm')" :disabled="isDisabled">确定</el-button>
          <el-button @click="addCancel">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 编辑弹窗 -->
    <el-dialog title="编辑用户信息" :visible.sync="editFormVisible" @close="closeDialog('editForm')">
      <el-form ref="editForm" :model="editForm" label-width="100px" label-position="left" :rules="editRules" v-loading="isLoading">
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="editForm.type">
            <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" maxLength="20"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="tel">
          <el-input v-model.number="editForm.tel" maxLength="11"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" maxLength="50"></el-input>
        </el-form-item>
        <el-form-item label="逻辑班号" v-if="editForm.type === 0" prop="class">
          <el-input v-model.number="editForm.class" ></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="editForm.password" maxLength="20" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm">
          <el-input v-model="editForm.confirm" maxLength="20" type="password"></el-input>
        </el-form-item>
        <div class="add_footer">
          <el-button type="primary" @click="editSubmit('editForm')" :disabled="isDisabled">确定</el-button>
          <el-button @click="editCancel">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'account',
  data(){
    return{
      deviceData: [
        // 【数据结构】设备数据
        // {
        //   name：string
        //   type：int
        //   param: [{
        //     key: string,
        //     value: string
        //   }]
        // }
        {
          name: "精馏设备1", 
          type:0,
          type_show: "精馏",
          param: [
            {
              key: "温度",
              value: "36°C"
            },
            {
              key: "容积",
              value: "5000ml"
            }
          ]
        }
      ], //用户数据
      addFormVisible: false, //控制增加弹窗
      editFormVisible: false, //控制编辑弹窗
      nowType: 0, //当前设备类型
      types: [ //设备类型
        {value: 0, label: "精馏"},
        {value: 1, label: "吸收-解吸"},
        {value: 2, label: "化工传热"},
        {value: 3, label: "流动过程"}
      ],
      isDisabled: false, //禁用表单提交按钮
      isLoading: false, //控制加载状态的出现
      tokenData: {}, //token数据
      addForm: { //新增弹窗表单数据
        name: "",
        type: 0,
        param:[]
      },
      editForm: {}, //编辑弹窗表单数据
      updateIndex: 0, //当前修改的数据index
      addRules: { //新增表单的完整性检查规则
        name: [
          {required: true, message: "请输入用户名", trigger: 'blur'}
        ]
      },
      editRules: { //编辑表单的完整性检查规则
        username: [
          {required: true, message: "请输入用户名", trigger: 'blur'}
        ],
        password: [
          {min: 6, message: "密码长度不能少于6位", trigger: 'blur'}
        ],
        confirm:[
          {validator: editConfirmPasswordRule, trigger: 'blur'}
        ],
        tel: [
          {required: true, message: "请输入11位手机号码", trigger: 'blur'},
          {min:11, type: 'number', message: "请输入正确的手机号码", trigger: 'blur'}
        ],
        email: [
          {required: true, message: "请输入邮箱", trigger: 'blur'},
          {type: 'email', message: "请输入正确的邮箱", trigger: 'blur'}
        ],
        class: [
          {required: true, message: "请输入逻辑班号", trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    // 更改下拉菜单：更改要显示的设备类型
    changeType(index){
      let type = index;

      // 【网络请求】请求对应类型的设备数据
      // 请求类型：GET
      // 参数：type：int
      // 返回值：data：JSON array
      // [{
      //   name：string
      //   type：int
      //   param: [{
      //     key: string,
      //     value: string
      //   }]
      // }]
    },
    // 删除数据
    deleteData(scope){
      let index = scope.$index;
      let id = this.deviceData[index].id;
      let that = this;

      // 【网络请求】删除设备
      // 请求类型：DELETE
      // 参数：token: string, id：string
      // 返回值：无
    },
    // 提交增加表单
    addSubmit(formName){
      //禁用按钮
      this.isDisabled = true;
      let that = this;
      let data = this.addForm;

      //判断合法输入
      this.$refs[formName].validate((valid) => {
        if (valid) { //验证通过
          that.isLoading = true;
          that.isDisabled = true;
          
          // 【网络请求】新增用户，返回新增的用户
          // 请求类型：POST
          // 参数：token: string, data：JSON
          // {
          //   username：string
          //   password: string
          //   type：int
          //   tel：int
          //   email：string
          //   class：int
          // }
          // 返回值：data：JSON
          // {
          //   username：string
          //   type：int
          //   tel：int
          //   email：string
          //   class：int
          // }

          //将新增数据加入表格，若表格显示的不是当前类型则不添加

          //恢复按钮
          that.isDisabled = false;
          //停止加载
          that.isLoading = false;
          //关闭表单
          that.addFormVisible = false;
          this.$refs["addForm"].resetFields();
        } else { //验证未通过
          //恢复按钮
          that.isDisabled = false;
          return false;
        }
      });
    },
    // 取消提交增加表单
    addCancel(){
      this.addFormVisible = false;
      this.$refs["addForm"].resetFields();
      //还原
      this.addForm = { 
        username: "",
        password: "",
        confirm: "",
        type: 0,
        tel: "",
        email: "",
        class: ""
      }
    },
    // 向编辑表单中填充数据
    openEdit(scope){
      //填充数据
      let index = scope.$index;
      this.editForm = JSON.parse(JSON.stringify(this.accountData[index]));

      this.updateIndex = index;
      this.editFormVisible = true;
    },
    // 提交编辑表单
    editSubmit(formName){
      //禁用按钮
      this.isDisabled = true;
      let that = this;
      let data = this.editForm;

      this.$refs[formName].validate((valid) => {
        if (valid) { //验证通过
          // 【网络请求】修改用户，返回修改后的用户
          // 请求类型：PUT
          // 参数：token: string, data：JSON
          // {
          //   username：string
          //   password: string
          //   type：int
          //   tel：int
          //   email：string
          //   class：int
          // }
          // 返回值：data：JSON
          // {
          //   username：string
          //   type：int
          //   tel：int
          //   email：string
          //   class：int
          // }

          //恢复按钮
          that.isDisabled = false;
          //停止加载
          that.isLoading = false;
          //关闭表单
          that.editFormVisible = false; 

        } else {
          //恢复按钮
          that.isDisabled = false;
          return false;
        }
      })
    },
    // 取消提交编辑表单
    editCancel(){
      this.editFormVisible = false;
      this.$refs["editForm"].resetFields();
    },  
  },
  // 初始化数据
  created: function(){
    // 【网络请求】请求精馏类型的用户数据
    // 请求类型：GET
    // 参数：type：0
    // 返回值：data：JSON array
    // [{
    //   name：string
    //   type：int
    //   param: [{
    //     key: string,
    //     value: string
    //   }]
    // }]
  }
}
</script>

<style>
.el-table .cell{
  white-space: pre-line;
}
</style>

<style scoped>
div {
  box-sizing: border-box;
}

#device{
  padding: 10px 30px 10px 30px;
  height: 100%;
}

.title_block, .option_block{
  width: 100%;
  display: flex;
  align-items: center;
  height: 10%;
  padding-bottom: 20px;
}

.title{
  font-size: 25px;
}

#add_button, #import_button{
  padding-left: 20px;
}

.search_block{
  display: flex;
}

.table_block{
  height: 70%;
}
</style>
