<template>
  <div id="account">
    <!-- 头部 -->
    <div class="title_block">
      <div class="title">账户管理</div>
      <el-button id="add_button" type="text" size="small" @click="addFormVisible = true">新增</el-button>
      <el-button id="import_button" type="text" size="small" @click="importFormVisible = true">导入</el-button>
    </div>
    <!-- 选项 -->
    <div class="option_block">
      <div class="search_block">
        <el-input v-model="keyword" placeholder="输入用户名"></el-input>
        <el-button type="primary" style="margin-left: 10px" @click="searchByName">搜索</el-button>
      </div>
      <div class="select_block">
        <el-select v-model="nowType" @change="changeType">
          <el-option v-for="item in types" :key="item.value" :value="item.value" :label="item.label">
          </el-option>
        </el-select>
      </div>
    </div>
    <!-- 正文 -->
    <div class="table_block">
      <el-table :data="accountData" height="100%" border stripe>
        <el-table-column prop="username" label="用户名" width="150px"></el-table-column>
        <el-table-column prop="type_show" label="账号类型"></el-table-column>
        <el-table-column prop="tel" label="手机号" width="150px"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="200px"></el-table-column>
        <el-table-column prop="class" label="逻辑班号"></el-table-column>
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
    <iframe
  src="https://open.ys7.com/ezopen/h5/iframe_se?url=ezopen://open.ys7.com/E33136313/3.live&autoplay=1&audio=1&accessToken=at.12zuv6j338bbjqji9ax1akcb8arqxx34-9kezdqlpqi-014sgwa-ufvghm7vj&templete=2"
  width="600"
  height="400"
  id="ysopen"
  allowfullscreen
>
</iframe>
    <!-- 新增弹窗 -->
    <el-dialog title="新增用户" :visible.sync="addFormVisible">
      <el-form ref="addForm" :model="addForm" label-width="100px" label-position="left" :rules="addRules" v-loading="isLoading">
        <el-form-item label="用户类型" prop="type">
          <el-select v-model="addForm.type">
            <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" maxLength="20"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" maxLength="20" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm">
          <el-input v-model="addForm.confirm" maxLength="20" type="password"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="tel">
          <el-input v-model.number="addForm.tel" maxLength="11"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" maxLength="50"></el-input>
        </el-form-item>
        <el-form-item label="逻辑班号" v-if="addForm.type === 0" prop="class">
          <el-input v-model.number="addForm.class" ></el-input>
        </el-form-item>
        <div class="add_footer">
          <el-button type="primary" @click="addSubmit('addForm')" :disabled="isDisabled">确定</el-button>
          <el-button @click="addCancel">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 编辑弹窗 -->
    <el-dialog title="编辑用户信息" :visible.sync="editFormVisible">
      <el-form ref="editForm" :model="editForm" label-width="100px" label-position="left" :rules="addRules" v-loading="isLoading">
        <el-form-item label="用户类型" prop="type">
          <el-select v-model="editForm.type">
            <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" maxLength="20"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editForm.password" maxLength="20" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm">
          <el-input v-model="editForm.confirm" maxLength="20" type="password"></el-input>
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
    //新增表单，确认密码的验证
    var addConfirmPasswordRule = (rule, value, callback) => {
      if (value !== this.addForm.password){
        callback(new Error('两次输入的密码不一致'));
      }else{
        callback();
      }
    };
    return{

      accountData: [
        // 【数据结构】用户数据
        // {
        //   username：string
        //   password: string
        //   type：int
        //   tel：int
        //   email：string
        //   class：int
        // }
        {
          username: "测试数据1", 
          type:0,
          tel: "18522386189",
          email:"1538420545@qq.com",
          class:"52323",
          type_show: "学生"
        }
      ], //用户数据
      addFormVisible: false, //控制增加弹窗
      importFormVisible: false, //控制导入弹窗
      editFormVisible: false, //控制编辑弹窗
      keyword: "", //搜索关键字
      nowType: 0, //当前用户类型
      types: [ //用户类型
        {value: 0, label: "学生"},
        {value: 1, label: "教师"},
        {value: 2, label: "管理员"}
      ],
      isDisabled: false, //禁用表单提交按钮
      isLoading: false, //控制加载状态的出现
      tokenData: {}, //token数据
      addForm: { //新增弹窗表单数据
        username: "",
        password: "",
        confirm: "",
        type: 0,
        tel: "",
        email: "",
        class: ""
      },
      editForm: {}, //编辑弹窗表单数据
      updateIndex: 0,
      addRules: { //新增表单的完整性检查规则
        username: [
          {required: true, message: "请输入用户名", trigger: 'blur'}
        ],
        password: [
          {required: true, message: "请输入密码", trigger: 'blur'},
          {min: 6, message: "密码长度不能少于6位", trigger: 'blur'}
        ],
        confirm:[
          {required: true, message: "请确认密码", trigger: 'blur'},
          {validator: addConfirmPasswordRule, trigger: 'blur'}
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
    // 更改下拉菜单：更改要显示的用户类型
    changeType(index){
      let type = index;

      // 【网络请求】请求对应类型的用户数据
      // 请求类型：GET
      // 参数：type：int
      // 返回值：data：JSON array
      // [{
      //   username：string
      //   type：int
      //   tel：int
      //   email：string
      //   class：int
      // }]
    },
    // 点击搜索按钮：根据用户名搜索用户
    searchByName(){
      let key = this.keyword;

      // 【网络请求】根据用户名，搜索用户数据
      // 请求类型：GET
      // 参数：key：string
      // 返回值：data：JSON
      // {
      //   username：string
      //   type：int
      //   tel：int
      //   email：string
      //   class：int
      // }
    },
    deleteData(scope){
      let index = scope.$index;
      let id = this.showData[index].id;
      let that = this;

      let request = new FormData();
      request.append("id", id);
      request.append("token", localStorage.getItem("token"));

      fetch(this.URL + "exhibition/delete", {
        method: 'POST',
        body: request
      }).then(res => res.json()).then(res => {
        if (res.status === "failed" && (res.error === "token解析失败" || res.error.split("expired").length === 2)){
          that.$message({
            message: "登录已过期，请重新登录",
            type: 'error'
          })
          that.$router.push("/login");
          return false;
        }

        if (res.status === "succeed"){
          that.showData.splice(index, 1);
          that.$message({
              message: "删除成功",
              type: 'success'
          })
        }else{
          that.$message({
            message: "删除失败，服务器出错",
            type: 'error'
          })
        }
      })
    },
    uploadSuccess(res){
      if (res.status === "failed" && (res.error === "token解析失败" || res.error.split("expired").length === 2)){
          that.$message({
            message: "登录已过期，请重新登录",
            type: 'error'
          })
          that.$router.push("/login");
          return false;
      }
      let picUrl = res;
      this.addForm.url = picUrl.message;
    },
    uploadError(res){
      if (res.status === "failed" && (res.error === "token解析失败" || res.error.split("expired").length === 2)){
        that.$message({
          message: "登录已过期，请重新登录",
          type: 'error'
        })
        that.$router.push("/login");
        return false;
      }else{
        this.$message({
          message: "上传图片过大或服务器出错",
          type: 'error'
        })
      }
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
    beforeRemove(file, fileList){
      return this.$confirm('确认移除?')
    },
    editSubmit(formName){
      //禁用按钮
      this.isDisabled = true;
      let that = this;
      let data = this.editForm;
      delete data.now_show;
      data.now = +data.now;
      data.data = JSON.stringify(data.data);

      this.$refs[formName].validate((valid) => {
        if (valid) { //验证通过
            console.log("pass");

            let request = new FormData();
            request.append("entity", JSON.stringify(data));
            request.append("token", localStorage.getItem("token"));

            fetch(that.URL + 'exhibition/update', {
              method: 'POST',
              body: request
            }).then(res => res.json()).then(res => {
              if (res.status === "failed" && (res.error === "token解析失败" || res.error.split("expired").length === 2)){
                that.$message({
                  message: "登录已过期，请重新登录",
                  type: 'error'
                })
                that.$router.push("/login");
                return false;
              }

              console.log(res);
              //恢复按钮
              that.isDisabled = false;
              //停止加载
              that.isLoading = false;
              //关闭表单
              that.editFormVisible = false;

              fetch(this.URL + "exhibitions").then(res => res.json()).then(res => {
                let data = JSON.parse(res.message);
                data.forEach(value => {
                  value.data = JSON.parse(value.data);
                  value.now_show = value.now ? '是' : '否';
                  value.now = Boolean(value.now);
                });
                that.showData = data;     
              }).catch(err => {
                console.log(err);
                that.$message({
                  message: "加载失败，服务器出错",
                  type: 'error'
                })

                return false;
              })

              that.$message({
                message: "修改成功",
                type: 'success'
              })
            }).catch(err => {
              console.log(err);
              console.log(1);
              that.$message({
                message: "修改失败，服务器出错",
                type: 'error'
              })
            })
          } else {
            console.log('error');
            //恢复按钮
            that.isDisabled = false;
            return false;
          }
      })
    }
  },
  created: function(){
    var player = document.getElementById('ysOpenDevice').contentWindow;
/* iframe 支持方法 */
player.postMessage("play", "https://open.ys7.com/ezopen/h5/iframe") /* 播放 */
player.postMessage("stop", "https://open.ys7.com/ezopen/h5/iframe") /* 结束 */
player.postMessage("capturePicture", "https://open.ys7.com/ezopen/h5/iframe") /* 截图 */
player.postMessage("openSound", "https://open.ys7.com/ezopen/h5/iframe") /* 开启声音 */
player.postMessage("closeSound", "https://open.ys7.com/ezopen/h5/iframe") /* 关闭声音 */
player.postMessage("startSave", "https://open.ys7.com/ezopen/h5/iframe") /* 开始录制 */
player.postMessage("stopSave", "https://open.ys7.com/ezopen/h5/iframe") /* 结束录制 */
    this.uploadUrl = this.URL + 'uploadimg';
    this.tokenData = {
      token: localStorage.getItem("token")
    }
    fetch(this.URL + "exhibitions").then(res => res.json()).then(res => {
      let data = JSON.parse(res.message);
      data.forEach(value => {
        value.data = JSON.parse(value.data);
        value.now = Boolean(value.now);
        value.now_show = value.now ? '是' : '否';
      });
      this.showData = data;
      console.log(this.showData);
    }).catch(err => {
      console.log(err);
      that.$message({
        message: "加载失败，服务器出错",
        type: 'error'
      })    
    })
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

#account{
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

.select_block{
  padding-left: 30px;
}

.search_block{
  display: flex;
}

.table_block{
  height: 70%;
}
</style>
