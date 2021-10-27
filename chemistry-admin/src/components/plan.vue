<template>
  <div id="art">
    <!-- 头部 -->
    <div class="title_block">
      <div class="title">艺术橱窗管理</div>
      <el-button id="add_button" type="text" size="small" @click="addFormVisible = true">新增</el-button>
    </div>
    <!-- 正文 -->
    <div class="table_block">
      <el-table :data="artData" height="100%" border stripe>
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
      <el-image :src="picUrl" fit="contain"></el-image>
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
        <el-form-item label="图片" prop="url">
            <el-upload 
              ref="upload"
              name="imgfile"
              :data="tokenData"
              :action="uploadUrl"
              :before-remove="beforeRemove"
              :on-success="uploadSuccess"
              :on-error="uploadError">
              <el-button size="small" type="primary">上传图片</el-button>
              <div slot="tip">只能上传一张jpg/png文件</div>
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
          <el-form-item label="图片" prop="url">
              <el-upload 
                ref="upload"
                name="imgfile"
                :data="tokenData"
                :action="uploadUrl"
                :before-remove="beforeRemove"
                :on-success="uploadEditSuccess"
                :on-error="uploadError">
                <el-button size="small" type="primary">替换图片</el-button>
                <div slot="tip">只能上传一张jpg/png文件</div>
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
  name: 'art',
  data(){
    return{
      artData: [
        // 【数据结构】一日票的数据
        // {
        //   time: Date
        //   plan: string
        //   ticket: boolean array(7)
        // }
      ],
      addFormVisible: false, //显示/隐藏表单弹窗
      editFormVisible: false,
      pictureVisible: false,
      isDisabled: false, //禁用表单提交按钮
      isLoading: false, //控制加载状态的出现
      picUrl: "", //展示图片的URL,
      uploadUrl: "",
      havePic: true,
      tokenData: {},
      addForm: {
        url: "",
        title: "",
        content: ""
      },
      editForm: {},
      updateIndex: 0,
      rules: {
        title: [
          {required: true, message: "请输入标题", trigger: 'blur'}
        ],
        url: [
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
      let id = this.artData[index].id;
      
      let request = new FormData();
      request.append("id", id);
      request.append("token", localStorage.getItem("token"));

      fetch(this.URL + 'artgallery/delete', {
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
          that.artData.splice(index, 1);
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
      this.picUrl = this.IMGBASE + this.artData[index].url
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
      this.editForm.url = picUrl.message;
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
          request.append("entity", JSON.stringify(that.addForm));
          request.append("token", localStorage.getItem("token"));

          fetch(that.URL + 'artgallery/insert', {
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

            fetch(that.URL + 'artgalleries').then(res => res.json()).then(res => {
              let data = JSON.parse(res.message);
              that.artData = data;
            }).catch(err => {
              console.log(err);
              that.$message({
                message: "加载失败，服务器出错",
                type: 'error'
              })

              return false;
            })

            that.addForm = {
              url: "",
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
        url: "",
        title: "",
        content: ""
      }
    },
    openEdit(scope){
      //填充数据
      let index = scope.$index;
      this.editForm = JSON.parse(JSON.stringify(this.artData[index]));
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

      this.$refs[formName].validate((valid) => {
        if (valid) { //验证通过
            console.log("pass");
            let request = new FormData();
            request.append("entity", JSON.stringify(that.editForm));
            request.append("token", localStorage.getItem("token"));

            fetch(that.URL + 'artgallery/update', {
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

              fetch(that.URL + "artgalleries").then(res => res.json()).then(res => {
                let data = JSON.parse(res.message);
                that.artData = data;
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
    fetch(this.URL + "artgalleries").then(res => res.json()).then(res => {
      let data = JSON.parse(res.message);
      this.artData = data;
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

#art{
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


ticket-controller
GET：获取start到end日期的票情况
{
  sn：第几节课
  date：日期
  resourcecId：设备ID
}

PUT DELETE增加、删除票（可以多张），传多张票的数组

无条件提示：会取消已有的票

待增加接口：修改单日的日开放计划