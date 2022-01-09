<template>
  <div id="account">
    <!-- 头部 -->
    <div class="title_block">
      <div class="title">账户管理</div>
      <el-button id="add_button" type="text" size="small" @click="addFormVisible = true">新增</el-button>
      <el-button id="import_button" type="text" size="small" @click="importFormVisible = true">导入</el-button>
      <el-link type="primary" :href="downloadURL">（下载模板）</el-link>
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
      <el-table :data="accountData" height="100%" ref="dataTable" border stripe>
        <el-table-column prop="username" label="用户名" ></el-table-column>
        <el-table-column prop="phone" v-if="nowType !== 2" label="手机号"></el-table-column>
        <el-table-column prop="email" v-if="nowType !== 2" label="邮箱" min-width="150px"></el-table-column>
        <el-table-column prop="grade" v-if="nowType === 0" label="逻辑班号"></el-table-column>
		<el-table-column prop="school" v-if="nowType !== 2" label="学校"></el-table-column>
		<el-table-column prop="college" v-if="nowType !== 2" label="学院"></el-table-column>
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
	<el-pagination id="changePageButton" @current-change="changePage" layout="prev, pager, next" :total="pageNum * 10"></el-pagination>
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
        <el-form-item label="学校" v-if="addForm.type !== 2" prop="school">
          <el-input v-model="addForm.school" maxLength="20"></el-input>
        </el-form-item>
        <el-form-item label="学院" v-if="addForm.type !== 2" prop="college">
          <el-input v-model="addForm.college" maxLength="20"></el-input>
        </el-form-item>
        <el-form-item label="手机号" v-if="addForm.type !== 2" prop="phone">
          <el-input v-model="addForm.phone" maxLength="11"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" v-if="addForm.type !== 2" prop="email">
          <el-input v-model="addForm.email" maxLength="50"></el-input>
        </el-form-item>
        <el-form-item label="逻辑班号" v-if="addForm.type === 0" prop="grade">
          <el-input v-model="addForm.grade" ></el-input>
        </el-form-item>
        <div class="add_footer">
          <el-button type="primary" @click="addSubmit('addForm')" :disabled="isDisabled">确定</el-button>
          <el-button @click="addCancel">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 编辑弹窗 -->
    <el-dialog title="编辑用户信息" :visible.sync="editFormVisible">
      <el-form ref="editForm" :model="editForm" label-width="100px" label-position="left" :rules="editRules" v-loading="isLoading">
        <el-form-item label="用户名" prop="username">
          <div>{{editForm.username}}</div>
        </el-form-item>
		<el-form-item label="学校" v-if="nowType !== 2" prop="school">
          <el-input v-model="editForm.school" maxLength="20"></el-input>
        </el-form-item>
        <el-form-item label="学院" v-if="nowType !== 2" prop="college">
          <el-input v-model="editForm.college" maxLength="20"></el-input>
        </el-form-item>
		<el-form-item label="逻辑班号" v-if="nowType === 0" prop="grade">
          <el-input v-model="editForm.grade" ></el-input>
        </el-form-item>
        <el-form-item label="手机号" v-if="nowType !== 2" prop="phone">
          <el-input v-model="editForm.phone" maxLength="11"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" v-if="nowType !== 2" prop="email">
          <el-input v-model="editForm.email" maxLength="50"></el-input>
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
    <!-- 导入弹窗 -->
    <el-dialog title="批量导入用户" :visible.sync="importFormVisible">
      <el-upload
        ref="upload"
		:headers="uploadHeaders"
        :action="uploadURL"
        :before-remove="beforeRemove" 
        :on-success="uploadSuccess"
        :on-error="uploadError"
		:on-progress="startUpload"
		:disabled = "isDisabled"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传Excel xlsx/xls文件</div>
      </el-upload>
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

		//编辑表单，确认密码的验证
		var editConfirmPasswordRule = (rule, value, callback) => {
			if (this.editForm.password !== "" && value !== this.editForm.password){
				callback(new Error("两次输入的密码不一致"));
			}else{
				callback();
			}
		};

		return{
			accountData: [], //用户数据
			pageNum: 1, // 分页页数
			nowPage: 1, // 当前页
			addFormVisible: false, //控制增加弹窗
			importFormVisible: false, //控制导入弹窗
			editFormVisible: false, //控制编辑弹窗
			downloadURL: "", // 下载模板URL
			uploadURL: "", // 上传地址
			uploadHeaders: {}, // 上传的Headers
			keyword: "", //搜索关键字
			nowType: "", //当前用户类型
			types: [ //用户类型
				{value: 0, label: "学生", key:"ROLE_student"},
				{value: 1, label: "教师", key:"ROLE_teacher"},
				{value: 2, label: "管理员", key:"ROLE_admin"}
			],
			isDisabled: false, //禁用表单提交按钮
			isLoading: false, //控制加载状态的出现
			tokenData: {}, //token数据
			addForm: { //新增弹窗表单数据
				username: "",
				password: "",
				confirm: "",
				type: "",
				phone: "",
				email: "",
				grade:  "",
				college: "",
				school: "",
			},
			editForm: {}, //编辑弹窗表单数据
			addRules: { //新增表单的完整性检查规则
				type: [
					{required: true, message: "请选择用户类型", trigger: 'blur'}
				],
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
					{min:11, message: "请输入正确的手机号码", trigger: 'blur'}
				],
				email: [
					{type: 'email', message: "请输入正确的邮箱", trigger: 'blur'}
				],
				grade: [
					{required: true, message: "请输入逻辑班号", trigger: 'blur'}
				],
				school: [
					{required: true, message: "请输入学校", trigger: 'blur'}
				],
				college: [
					{required: true, message: "请输入学院", trigger: 'blur'}
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
					{min:11, message: "请输入正确的手机号码", trigger: 'blur'}
				],
				email: [
					{type: 'email', message: "请输入正确的邮箱", trigger: 'blur'}
				],	
				grade: [
					{required: true, message: "请输入逻辑班号", trigger: 'blur'}
				],
				school: [
					{required: true, message: "请输入学校", trigger: 'blur'}
				],
				college: [
					{required: true, message: "请输入学院", trigger: 'blur'}
				]
			}
		}
  	},
  	methods: {
		// 更改下拉菜单：更改要显示的用户类型
		changeType(index){
			this.nowPage = 1;
			this.keyword = "";
			// 获取第一页数据
			this.getData(this.nowType, 1);
		},
		// 切换页
		changePage(page){
			this.nowPage = page;
			this.getData(this.nowType, page);
		},
		// 点击搜索按钮：根据用户名搜索用户
		searchByName(){
			let key = this.keyword;
			fetch(this.URL + "api/auth/getAccountByName?userName=" + key, {
				method: 'GET',
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					if (res.data === null){
						this.$message({
							message: "未找到用户",
							type: 'error'
						})
					}else{
						this.nowType = "";
						let data = res.data;
						this.accountData.splice(0, this.accountData.length, data.user);
						this.pageNum = 1;
						this.nowPage = 1;
						
						// 获取用户类型
						for(let i = 0 ; i < this.types.length ; i++){
							if (this.types[i].key === data.role){
								this.nowType = this.types[i].value;
							}
						}
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
					message: "搜索失败，服务器出错" + err,
					type: 'error'
				})
				return false;
			})
		},
		// 删除数据
		deleteData(scope){
			let index = scope.$index;
			let id = this.accountData[index].id;
			
			fetch(this.URL + "api/auth/deleteAccount?id=" + id, {
				method: 'DELETE',
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					// 刷新数据
					this.getData(this.nowType, this.nowPage);
				
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
					message: "删除失败，服务器出错" + err,
					type: 'error'
				})
				return false;
			})			

		},
		// 开始上传文件
		startUpload(){
			this.isDisabled = true;
		},
		// 上传文件成功
		uploadSuccess(res){
			this.isDisabled = false;
			if (res.success){
				this.$message({
                    message: "导入成功",
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
		},
		// 上传文件出错
		uploadError(res){
			this.isDisabled = false;
			this.$message({
                message: "网络错误，请假检查网络设置",
                type: 'error'
            })
		},
		// 移除上传文件前询问
		beforeRemove(file, fileList){
			return this.$confirm('确认移除?')
		},
		// 提交增加表单
		addSubmit(formName){
			let that = this;
			let data = this.addForm;
			let requestData = {
				college: data.college,
				email: data.email,
				grade: data.grade,
				phone: data.phone,
				username: data.username,
				password: data.password,
				school: data.school,
				type: data.type
			}

			//判断合法输入
			this.$refs[formName].validate((valid) => {
				if (valid) { //验证通过
					// 开始加载
					that.isLoading = true;
					
					fetch(this.URL + "api/auth/register?type=" + data.type, {
						method: 'POST',
						headers: {
							Authorization: 'Bearer  ' + localStorage.getItem("token"),
							'content-type': 'application/json'
						},
						body: JSON.stringify(requestData)
					}).then(res => res.json()).then(res => {
						//停止加载
						that.isLoading = false;

						if (res.success){
							// 刷新数据
							this.getData(this.nowType, this.nowPage);
						
							this.$message({
								message: "新增成功",
								type: 'success'
							})
									
							//关闭表单
							that.$refs['addForm'].resetFields();
							that.addFormVisible = false; 
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
						that.isLoading = false;

						this.$message({
							message: "新增失败，服务器出错" + err,
							type: 'error'
						})
						return false;
					})
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
				username: "",
				password: "",
				confirm: "",
				type: "",
				phone: "",
				email: "",
				grade:  "",
				college: "",
				school: "",
			}
		},
		// 向编辑表单中填充数据
		openEdit(scope){
			//填充数据
			let index = scope.$index;
			let form = JSON.parse(JSON.stringify(this.accountData[index]));
			form.confirm = ""; // 先添加，在赋值
			this.editForm = form;
			this.editFormVisible = true;
		},
		// 提交编辑表单
		editSubmit(formName){
			let that = this;
			let data = this.editForm;
			let requestData = {
				college: data.college,
				email: data.email,
				grade: data.grade,
				phone: data.phone,
				username: data.username,
				password: data.password,
				confirm: data.confirm,
				school: data.school,
				type: data.type,
				id: data.id
			}

			//判断合法输入
			this.$refs[formName].validate((valid) => {
				if (valid) { //验证通过
					// 开始加载
					that.isLoading = true;
					
					fetch(this.URL + "api/auth/updateStudent?", {
						method: 'POST',
						headers: {
							Authorization: 'Bearer  ' + localStorage.getItem("token"),
							'content-type': 'application/json'
						},
						body: JSON.stringify(requestData)
					}).then(res => res.json()).then(res => {
						//停止加载
						that.isLoading = false;

						if (res.success){
							this.getData(this.nowType, this.nowPage);
							this.$message({
								message: "修改成功",
								type: 'success'
							})
									
							//关闭表单
							that.$refs['editForm'].resetFields();
							that.editFormVisible = false; 
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
						that.isLoading = false;

						this.$message({
							message: "修改失败，服务器出错" + err,
							type: 'error'
						})
						return false;
					})
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
		// 获取对应类型、页号的用户信息
		getData(type, page){
			fetch(this.URL + "api/auth/getAccounts?pageSize=10&type=" + type + "&pageNum=" + page, {
				method: 'GET',
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					this.pageNum = res.data.totalPages;
					let data = res.data.content;
					data.forEach((value, index) => {
						value.password = "";
					})
					this.accountData = data;

					// 重新渲染表格，列的增加可能导致表格高度改变
					this.$refs.dataTable.doLayout();
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
					message: "获取失败，服务器出错" + err,
					type: 'error'
				})
				return false;
			})			
		}
  	},
  	mounted() {
		// 上传按钮的参数
		this.downloadURL = this.URL + "model.xlsx";
		this.uploadURL = this.URL + "api/auth/import/students";
		this.uploadHeaders = {
			Authorization: 'Bearer  ' + localStorage.getItem("token"),
		};
	},
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
  height: 65%;
}

.el-table__body-wrapper{
	height: 100% !important;
}

#changePageButton{
	text-align: center;
}
</style>
