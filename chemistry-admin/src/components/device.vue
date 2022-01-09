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
        <el-table-column prop="typeShow" label="设备类型"></el-table-column>
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
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="addForm.name" maxLength="20"></el-input>
        </el-form-item>
		    <el-form-item label="摄像头URL" prop="url">
          <el-input v-model="addForm.url"></el-input>
        </el-form-item>
        <div class="add_footer">
          <el-button type="primary" @click="addSubmit('addForm')">确定</el-button>
          <el-button @click="addCancel">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 编辑弹窗 -->
	<el-dialog title="编辑设备" :visible.sync="editFormVisible" @close="closeDialog('editForm')">
      <el-form ref="editForm" :model="editForm" label-width="100px" label-position="left" :rules="addRules" v-loading="isLoading">
        <el-form-item label="设备类型" prop="type">
          <div>{{editForm.typeShow}}</div>
        </el-form-item>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
		<el-form-item label="摄像头URL" prop="url">
          <el-input v-model="editForm.url"></el-input>
        </el-form-item>
        <div class="add_footer">
          <el-button type="primary" @click="editSubmit('editForm')">确定</el-button>
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
            deviceData: [], //设备数据
            devices: [],
            addFormVisible: false, //控制增加弹窗
            editFormVisible: false, //控制编辑弹窗
            nowType: "", //当前设备类型
            types: [ //设备类型
                {value: 'A', label: "精馏"},
                {value: 'B', label: "吸收-解吸"},
                {value: 'C', label: "化工传热"},
                {value: 'D', label: "流动过程"}
            ],
            isDisabled: false, //禁用表单提交按钮
            isLoading: false, //控制加载状态的出现
            tokenData: {}, //token数据
            addForm: { //新增弹窗表单数据
              name: "",
              type: "",
              url: ""
            },
            editForm: {}, //编辑弹窗表单数据
            updateIndex: 0, //当前修改的数据index
            addRules: { //新增表单的完整性检查规则
                name: [
                {required: true, message: "请输入设备名", trigger: 'blur'}
                ],
                url: [
                {required: true, message: "请输入摄像头地址", trigger: 'blur'}
                ]
            },
            editRules: { //新增表单的完整性检查规则
                name: [
                {required: true, message: "请输入设备名", trigger: 'blur'}
                ],
                url: [
                {required: true, message: "请输入摄像头地址", trigger: 'blur'}
                ]
            },
        }
    },
    methods: {
        // 关闭弹窗
        closeDialog(formName){
            this.$refs[formName].resetFields();
        },
        // 更改下拉菜单：更改要显示的设备类型
        changeType(index){
            let type = index;
            this.deviceData.splice(0, this.deviceData.length);
            
            // devices是源数据，deviceData是显示的数据
            for (let i = 0 ; i < this.devices.length ; i++){
                if (this.devices[i].type === type){
                    this.deviceData.push(this.devices[i]);
                }
            }
        },
        // 删除数据
        deleteData(scope){
            let index = scope.$index;
            let id = this.deviceData[index].id;

            fetch(this.URL + "api/resources/" + id, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
                    this.getDevices();
                    this.deviceData.splice(index, 1);
                    this.$message({
                        message: "删除成功",
                        type: 'success'
                    })
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                        this.$router.push("/login");
                    }else if(res.status === 401){
                        this.$message({
                            message: "没有相关权限",
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
            });
        },
		// 提交增加表单
        addSubmit(formName){
            let data = this.addForm;

            //判断合法输入
            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                    this.isLoading = true;
                
                    fetch(this.URL + "api/resources/", {
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer  ' + localStorage.getItem("token"),
							'Content-Type': 'application/json'
                        },
						body: JSON.stringify(data)
                    }).then(res => res.json()).then(res => {
						//停止加载
						this.isLoading = false;

                        if (res.success){
                            this.getDevices();

							//关闭表单
							this.addFormVisible = false;
							//还原
							this.addForm = { 
								name: "",
								type: "",
								url: ""
							}

                            this.$message({
                                message: "添加成功",
                                type: 'success'
                            })
                        }else{
                            if (res.status === 402){
                                this.$message({
                                    message: "登录已过期",
                                    type: 'error'
                                })
                                this.$router.push("/login");
                            }else if(res.status === 401){
                                this.$message({
                                    message: "没有相关权限",
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
						//停止加载
						this.isLoading = false;

                        this.$message({
                            message: "加载失败，服务器出错" + err,
                            type: 'error'
                        })
                        return false;
                    });
                } else { //验证未通过
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
                name: "",
                type: "",
                url: ""
            }
        },
        // 向编辑表单中填充数据
        openEdit(scope){
            //填充数据
			let that = this;
            let index = scope.$index;
            this.editForm = JSON.parse(JSON.stringify(this.deviceData[index]));
			// 显示类型文字
			this.editForm.typeShow = this.types.find(function (e) {
				return e.value === that.editForm.type;
			}).label;
            this.updateIndex = index;
            this.editFormVisible = true;
        },
        // 提交编辑表单
        editSubmit(formName){
			let data = this.editForm;

            //判断合法输入
            this.$refs[formName].validate((valid) => {
                if (valid) { //验证通过
                    this.isLoading = true;
                
                    fetch(this.URL + "api/resources/" + this.deviceData[this.updateIndex].id, {
                        method: 'PUT',
                        headers: {
                            Authorization: 'Bearer  ' + localStorage.getItem("token"),
							'Content-Type': 'application/json'
                        },
						body: JSON.stringify(data)
                    }).then(res => res.json()).then(res => {
						//停止加载
						this.isLoading = false;

                        if (res.success){
                            this.getDevices();

							//关闭表单
							this.editFormVisible = false;

                            this.$message({
                                message: "修改成功",
                                type: 'success'
                            })
                        }else{
                            if (res.status === 402){
                                this.$message({
                                    message: "登录已过期",
                                    type: 'error'
                                })
                                this.$router.push("/login");
                            }else if(res.status === 401){
                                this.$message({
                                    message: "没有相关权限",
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
						//停止加载
						this.isLoading = false;

                        this.$message({
                                message: "加载失败，服务器出错" + err,
                                type: 'error'
                        })
                        return false;
                    });
                } else { //验证未通过
                    return false;
                }
            });           
        },
        // 取消提交编辑表单
        editCancel(){
            this.editFormVisible = false;
            this.$refs["editForm"].resetFields();
        },  
        // 获取设备列表
        getDevices(){
            fetch(this.URL + "api/resources/", {
                method: 'GET',
                headers: {
                        Authorization: 'Bearer  ' + localStorage.getItem("token") 
                }
            }).then(res => res.json()).then(res => {
                if (res.success){
					let result = res.data;

					for(let i = 0 ; i < result.length ; i++){
						result[i].typeShow = this.types.find(function(e){
							return e.value === result[i].type
						}).label;
					}
                    this.devices = result;
					if (this.nowType !== ""){
						this.changeType(this.nowType);
					}
                }else{
                    if (res.status === 402){
                        this.$message({
                            message: "登录已过期",
                            type: 'error'
                        })
                        this.$router.push("/login");
                    }else if(res.status === 401){
                        this.$message({
                            message: "没有相关权限",
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
            });
        }
  	},
  	// 初始化数据
  	mounted() {
		this.getDevices();
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
