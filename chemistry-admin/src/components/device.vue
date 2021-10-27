<template>
  <div id="activity">
    <!-- 头部 -->
    <div class="title_block">
      <div class="title">公共活动管理</div>
      <el-button id="add_button" type="text" size="small" @click="addFormVisible = true">新增</el-button>
    </div>
    <!-- 正文 -->
    <div class="table_block">
      <el-table :data="activityData" height="100%" border stripe>
        <el-table-column prop="id" label="ID" width="100"></el-table-column>
        <el-table-column prop="title" label="标题" width="200"></el-table-column>
        <el-table-column label="图片" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openPicture(scope)">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="描述"></el-table-column>
        <el-table-column label="操作" width="100">
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
    <el-dialog title="查看图片" :visible.sync="pictureVisible">
      <el-carousel trigger="click">
        <el-carousel-item v-for="item in picUrls" :key="item">
          <el-image :src="item" fit="contain"></el-image>
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
    <!-- 新增弹窗 -->
    <el-dialog title="新增景观" :visible.sync="addFormVisible">
      <el-form ref="addForm" :model="addForm" label-width="100px" label-position="left" :rules="rules" v-loading="isLoading">
        <el-form-item label="标题" prop="title">
          <el-input v-model="addForm.title" maxLength="50"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="content">
          <el-input v-model="addForm.content" type="textarea" rows="5" clearable></el-input>
        </el-form-item>
        <el-form-item label="图片" prop="urls">
            <el-upload 
              ref="upload"
              name="imgfile"
              :data="tokenData"
              :action="uploadUrl"
              :before-remove="beforeRemove"
              :on-success="uploadSuccess"
              :on-error="uploadError"
              multiple>
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip">只能上传多张jpg/png文件</div>
            </el-upload>
        </el-form-item>
        <div class="add_footer">
          <el-button type="primary" @click="addSubmit('addForm')" :disabled="isDisabled">确定</el-button>
          <el-button @click="addCancel">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 编辑弹窗 -->
    <el-dialog title="编辑植物" :visible.sync="editFormVisible">
        <el-form ref="editForm" :model="editForm" label-width="100px" label-position="left" :rules="rules" v-loading="isLoading">
          <el-form-item label="ID">
            <span>{{editForm.id}}</span>
          </el-form-item>
          <el-form-item label="标题" prop="title">
            <el-input v-model="editForm.title" maxLength="50"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="content">
            <el-input v-model="editForm.content" type="textarea" rows="5" clearable></el-input>
          </el-form-item>
          <el-form-item label="图片" prop="urls">
              <template v-for="(item, index) in editForm.urls" >
                <div :key="index">
                  <span :key="item">{{item}}</span>
                  <el-button :key="index" type="text" @click="deletePicture(index)">删除</el-button>
                </div>
              </template>
              <el-upload 
                ref="upload"
                name="imgfile"
                :data="tokenData"
                :action="uploadUrl"
                :before-remove="beforeRemove"
                :on-success="uploadEditSuccess"
                :on-error="uploadError">
                <el-button size="small" type="primary">增加图片</el-button>
                <div slot="tip">只能上传多张jpg/png文件</div>
              </el-upload>
          </el-form-item>
          <div class="add_footer">
            <el-button type="primary" @click="editSubmit('editForm')" :disabled="isDisabled">确定</el-button>
            <el-button @click="editFormVisible = false">取消</el-button>
          </div>
        </el-form>
      </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'activity',
  data(){
    return{
      deviceData: [
        // 【数据结构】设备数据
        // {
        //   name：string
        //   type：int
        //   para：array
        // }
      ],
      addFormVisible: false, //显示/隐藏表单弹窗
      editFormVisible: false,
      pictureVisible: false,
      isDisabled: false, //禁用表单提交按钮
      isLoading: false, //控制加载状态的出现
      picUrls: [], //展示图片的URL,
      havePic: true,
      uploadUrl: "",
      tokenData: {},
      addForm: {
        urls: [],
        title: "",
        content: ""
      },
      editForm: {},
      updateIndex: 0,
      rules: {
        title: [
          {required: true, message: "请输入标题", trigger: 'blur'}
        ],
        urls: [
          {required: true, message: "请上传图片", trigger: 'blur'}
        ],
        content:[
          {required: true, message: "请输入文字描述", trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    deleteData(scope){
      let that = this;
      let index = scope.$index;
      let id = this.activityData[index].id;
      
      let request = new FormData();
      request.append("id", id);
      request.append("token", localStorage.getItem("token"));

      fetch(this.URL + 'activity/delete', {
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
          that.activityData.splice(index, 1);
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
    openPicture(scope){
      let index = scope.$index;
      this.pictureVisible = true;
      this.picUrls = JSON.parse(JSON.stringify(this.activityData[index].urls));
      this.picUrls.forEach((value, index) => {
        this.picUrls[index] = this.IMGBASE + value
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
      this.addForm.urls.push(picUrl.message);
    },
    uploadEditSuccess(res){
      if (res.status === "failed" && (res.error === "token解析失败" || res.error.split("expired").length === 2)){
        that.$message({
          message: "登录已过期，请重新登录",
          type: 'error'
        })
        that.$router.push("/login");
        return false;
      }
      let picUrl = res;
      this.editForm.urls.push(picUrl.message);
    },
    uploadError(){
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
    addSubmit(formName){
      //禁用按钮
      this.isDisabled = true;
      let that = this;

      //判断合法输入
      this.$refs[formName].validate((valid) => {
        if (valid) { //验证通过
          console.log("pass");

          let request = new FormData();
          console.log(that.addForm);
          request.append("entity", JSON.stringify(that.addForm));
          request.append("token", localStorage.getItem("token"));

          fetch(that.URL + 'activity/insert', {
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

            //恢复按钮
            that.isDisabled = false;
            //停止加载
            that.isLoading = false;
            //关闭表单
            that.addFormVisible = false;
            
            fetch(that.URL + "activities").then(res => res.json()).then(res => {
              let data = JSON.parse(res.message);
              that.activityData = data;
            }).catch(err => {
              console.log(err);
              that.$message({
                message: "加载失败，服务器出错",
                type: 'error'
              })

              return false;
            })


            that.addForm = {
              urls: [],
              title: "",
              content: ""
            }

            that.$message({
              message: "添加成功",
              type: 'success'
            })
          }).catch(err => {
            console.log(err);
            //恢复按钮
            that.isDisabled = false;
            //停止加载
            that.isLoading = false;
            that.$message({
              message: "添加失败，服务器出错",
              type: 'error'
            })
          })
        } else {
          console.log('error');
          //恢复按钮
          that.isDisabled = false;
          return false;
        }
      });
    },
    addCancel(){
      this.addFormVisible = false;
      this.addForm = {
        urls: [],
        title: "",
        content: ""
      }
    },
    openEdit(scope){
      //填充数据
      let index = scope.$index;
      this.editForm = JSON.parse(JSON.stringify(this.activityData[index]));
      this.updateIndex = index;
      this.editFormVisible = true;
      console.log(this.editForm);
    },
    beforeRemove(file, fileList){
      return this.$confirm('确认移除?')
    },
    deletePicture(index){
      this.editForm.urls.splice(index, 1);
      console.log(this.editForm);
    }, 
    editSubmit(formName){
      //禁用按钮
      this.isDisabled = true;
      let that = this;

      this.$refs[formName].validate((valid) => {
        if (valid) { //验证通过
            console.log("pass");
            let request = new FormData();
            request.append("entity", JSON.stringify(that.editForm));
            request.append("token", localStorage.getItem("token"));

            fetch(that.URL + 'activity/update', {
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

              //恢复按钮
              that.isDisabled = false;
              //停止加载
              that.isLoading = false;
              //关闭表单
              that.editFormVisible = false;

              fetch(that.URL + "activities").then(res => res.json()).then(res => {
                let data = JSON.parse(res.message);
                that.activityData = data;
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
              //恢复按钮
              that.isDisabled = false;
              //停止加载
              that.isLoading = false;
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
    this.uploadUrl = this.URL + 'uploadimg';
    this.tokenData = {
      token: localStorage.getItem("token")
    }
    fetch(this.URL + "activities").then(res => res.json()).then(res => {
      let data = JSON.parse(res.message);
      this.activityData = data;
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

#activity{
    padding: 30px;
    height: 100%;
}

.title_block{
  width: 100%;
  display: flex;
  align-items: center;
  height: 5%;
  margin-bottom: 20px;
}

.title{
  font-size: 25px;
}

#add_button{
  padding-left: 20px;
}

.table_block{
  height: 90%;
  padding-bottom: 20px;
}

.page_block{
  height: 5%;
  text-align: center;
}

</style>
