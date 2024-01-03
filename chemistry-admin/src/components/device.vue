<template>
	<div id="device">
		<!-- 头部 -->
		<div class="title_block">
			<div class="title">设备管理</div>
			<el-button id="add_button" type="text" size="small" @click="addFormVisible = true">新增</el-button>
			<template>
				<el-popconfirm title="确定将所有设备设置为初始化状态吗?" @confirm="initAll()">
					<el-button id="init_button" type="text" size="small" slot="reference">一键初始化</el-button>
				</el-popconfirm>
			</template>
			<template>
				<el-popconfirm title="确定将所有设备设置为关闭状态吗?" @confirm="closeAll()">
					<el-button id="close_button" type="text" size="small" slot="reference">一键关闭</el-button>
				</el-popconfirm>
			</template>
			<el-button id="refresh_button" type="text" size="small" slot="reference" @click="refreshCamera">刷新摄像头Token</el-button>
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
						<template>
							<el-popconfirm title="确定强制释放该设备的操作权吗?" @confirm="releaseDevice(scope)">
								<el-button type="text" size="small" slot="reference">释放操作权</el-button>
							</el-popconfirm>
						</template>
						<template>
							<el-popconfirm title="确定将该设备设置为初始化状态吗?" @confirm="initDevice(scope)">
								<el-button type="text" size="small" slot="reference">初始化</el-button>
							</el-popconfirm>
						</template>
						<template>
							<el-popconfirm title="确定将该设备设置为关闭状态吗?" @confirm="closeDevice(scope)">
								<el-button type="text" size="small" slot="reference">关闭</el-button>
							</el-popconfirm>
						</template>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<!-- 新增弹窗 -->
		<el-dialog title="新增设备" :visible.sync="addFormVisible" @close="closeDialog('addForm')">
			<el-form ref="addForm" :model="addForm" label-width="100px" label-position="left" :rules="addRules"
				v-loading="isLoading">
				<el-form-item label="设备类型" prop="type">
					<el-select v-model="addForm.type">
						<el-option v-for="item in types" :key="item.value" :label="item.label"
							:value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="设备名称" prop="name">
					<el-input v-model="addForm.name" maxLength="20"></el-input>
				</el-form-item>
				<el-form-item label="摄像头URL" prop="urls">
					<div class="cam_block" v-for="(item, index) in addForm.urls">
						<el-input v-model="addForm.urls[index]"></el-input>
						<i class="el-icon-remove-outline" @click="deleteCam('addForm', index)"></i>
					</div>
					<i class="el-icon-circle-plus-outline" @click="addCam('addForm')"></i>
				</el-form-item>
				<div class="add_footer">
					<el-button type="primary" @click="addSubmit('addForm')">确定</el-button>
					<el-button @click="addCancel">取消</el-button>
				</div>
			</el-form>
		</el-dialog>
		<!-- 编辑弹窗 -->
		<el-dialog title="编辑设备" :visible.sync="editFormVisible">
			<el-form ref="editForm" :model="editForm" label-width="100px" label-position="left" :rules="editRules"
				v-loading="isLoading">
				<el-form-item label="设备类型" prop="type">
					<div>{{ editForm.typeShow }}</div>
				</el-form-item>
				<el-form-item label="设备名称" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="摄像头URL" prop="urls">
					<div class="cam_block" v-for="(item, index) in editForm.urls">
						<el-input v-model="editForm.urls[index]"></el-input>
						<i class="el-icon-remove-outline" @click="deleteCam('editForm', index)"></i>
					</div>
					<i class="el-icon-circle-plus-outline" @click="addCam('editForm')"></i>
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
	data() {
		var addCamRule = (rule, value, callback) => {
            let temp = this.addForm.urls;
			if (temp.length === 0){
				callback(new Error('请至少添加一个摄像头'));
			}

			for (let item of temp){
				if (item === ""){
					callback(new Error('URL不能为空'))
				}
			}

			callback();
        };

		var editCamRule = (rule, value, callback) => {
            let temp = this.editForm.urls;
			console.log(temp)
			if (temp.length === 0){
				callback(new Error('请至少添加一个摄像头'));
			}

			for (let item of temp){
				if (item === ""){
					callback(new Error('URL不能为空'))
				}
			}

			callback();
        };

		return {
			deviceData: [], //设备数据
			devices: [],
			addFormVisible: false, //控制增加弹窗
			editFormVisible: false, //控制编辑弹窗
			nowType: "", //当前设备类型
			types: [ //设备类型
				{ value: 'A', label: "化工传热" },
				{ value: 'B', label: "吸收-解吸" },
				{ value: 'C', label: "流动过程" },
				{ value: 'D', label: "精馏" }
			],
			isDisabled: false, //禁用表单提交按钮
			isLoading: false, //控制加载状态的出现
			tokenData: {}, //token数据
			addForm: { //新增弹窗表单数据
				name: "",
				type: "",
				urls: []
			},
			editForm: {}, //编辑弹窗表单数据
			updateIndex: 0, //当前修改的数据index
			addRules: { //新增表单的完整性检查规则
				name: [
					{ required: true, message: "请输入设备名", trigger: 'blur' }
				],
				urls: [
					{required:true, message: "请至少添加一个摄像头", trigger: 'blur'},
					{validator: addCamRule, trigger: 'blur'}
				]
			},
			editRules: { //新增表单的完整性检查规则
				name: [
					{required: true, message: "请输入设备名", trigger: 'blur' }
				],
				urls: [
					{required:true, message: "请至少添加一个摄像头", trigger: 'blur'},
					{validator: editCamRule, trigger: 'blur'}
				]
			},
		}
	},
	methods: {
		// 关闭弹窗
		closeDialog() {
			this.$refs["addForm"].resetFields();
		},
		// 更改下拉菜单：更改要显示的设备类型
		changeType(index) {
			let type = index;
			this.deviceData.splice(0, this.deviceData.length);

			// devices是源数据，deviceData是显示的数据
			for (let i = 0; i < this.devices.length; i++) {
				if (this.devices[i].type === type) {
					this.deviceData.push(this.devices[i]);
				}
			}
		},
		// 删除数据
		deleteData(scope) {
			let index = scope.$index;
			let id = this.deviceData[index].id;

			fetch(this.URL + "api/resources/" + id, {
				method: 'DELETE',
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
			}).then(res => res.json()).then(res => {
				if (res.success) {
					this.getDevices();
					this.deviceData.splice(index, 1);
					this.$message({
						message: "删除成功",
						type: 'success'
					})
				} else {
					if (res.status === 402) {
						this.$message({
							message: "登录已过期",
							type: 'error'
						})
						this.$router.push("/login");
					} else if (res.status === 401) {
						this.$message({
							message: "没有相关权限",
							type: 'error'
						})
					} else {
						this.$message({
							message: "未知错误" + res.status,
							type: 'error'
						})
						console.log(res);
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
		// 释放某个设备的操作权
		releaseDevice(scope) {
			let index = scope.$index;
			let id = this.deviceData[index].id;

			fetch(this.URL + "api/resources/release_token/" + id, {
				method: "PUT",
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token"),
					'Content-Type': 'application/json'
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					this.$message({
						message: "释放成功",
						type: 'success'
					})
				}else{
					this.$message({
					message: "释放失败，" + err,
					type: 'error'
					})
				}
			}).catch(err => {
				this.$message({
					message: "加载失败，服务器出错" + err,
					type: 'error'
				})
				return false;
			});
		},
		// 初始化某个设备
		initDevice(scope) {
			let index = scope.$index;
			let id = this.deviceData[index].id;

			fetch(this.URL + "api/resources/init_param/" + id, {
				method: "PUT",
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token"),
					'Content-Type': 'application/json'
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					this.$message({
						message: "已经设置为初始状态",
						type: 'success'
					})
				}else{
					this.$message({
						message: "设置失败",
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
		// 关闭某个设备
		closeDevice(scope) {
			let index = scope.$index;
			let id = this.deviceData[index].id;

			fetch(this.URL + "api/resources/close_param/" + id, {
				method: "PUT",
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token"),
					'Content-Type': 'application/json'
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					this.$message({
						message: "已经设置为关闭状态",
						type: 'success'
					})
				}else{
					this.$message({
						message: "设置失败",
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
		addCam(formName){
			this[formName].urls.push("");
		},
		deleteCam(formName, index){
			this[formName].urls.splice(index, 1);
		},
		// 提交增加表单
		addSubmit(formName) {
			let data = this.addForm;

			//判断合法输入
			this.$refs[formName].validate((valid) => {
				if (valid) { //验证通过
					this.isLoading = true;

					// 修改数据格式
					let newUrls = [];
					for (let u of data.urls){
						newUrls.push({
							"url": u
						})
					}
					data.urls = newUrls;


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
						if (res.success) {
							this.getDevices();

							//关闭表单
							this.addFormVisible = false;
							//还原
							this.addForm = {
								name: "",
								type: "",
								urls: []
							}

							this.$message({
								message: "添加成功",
								type: 'success'
							})
						} else {
							if (res.status === 402) {
								this.$message({
									message: "登录已过期",
									type: 'error'
								})
								this.$router.push("/login");
							} else if (res.status === 401) {
								this.$message({
									message: "没有相关权限",
									type: 'error'
								})
							} else {
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
					console.log(123)
					return false;
				}
			});
		},
		// 取消提交增加表单
		addCancel() {
			this.addFormVisible = false;
			this.$refs["addForm"].resetFields();
			//还原
			this.addForm = {
				name: "",
				type: "",
				urls: []
			}
		},
		// 向编辑表单中填充数据
		openEdit(scope) {
			//填充数据
			let that = this;
			let index = scope.$index;
			let data =  JSON.parse(JSON.stringify(this.deviceData[index]));

			// 修改数据格式
			let newUrl = [];
			for (let u of data.urls){
				newUrl.push(u.url);
			}
			data.urls = newUrl;
			this.editForm = data; 

			// 显示类型文字
			this.editForm.typeShow = this.types.find(function (e) {
				return e.value === that.editForm.type;
			}).label;
			this.updateIndex = index;
			this.editFormVisible = true;
		},
		// 提交编辑表单
		editSubmit(formName) {
			let data = this.editForm;

			//判断合法输入
			this.$refs[formName].validate((valid) => {
				if (valid) { //验证通过
					this.isLoading = true;

					// 修改数据格式
					let newUrls = [];
					for (let u of data.urls){
						newUrls.push({
							"url": u
						})
					}
					data.urls = newUrls;

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

						if (res.success) {
							this.getDevices();

							//关闭表单
							this.editFormVisible = false;

							this.$message({
								message: "修改成功",
								type: 'success'
							})
						} else {
							if (res.status === 402) {
								this.$message({
									message: "登录已过期",
									type: 'error'
								})
								this.$router.push("/login");
							} else if (res.status === 401) {
								this.$message({
									message: "没有相关权限",
									type: 'error'
								})
							} else {
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
		editCancel() {
			this.editFormVisible = false;
		},
		// 获取设备列表
		getDevices() {
			fetch(this.URL + "api/resources/", {
				method: 'GET',
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
			}).then(res => res.json()).then(res => {
				if (res.success) {
					let result = res.data;
					console.log(result);
					for (let i = 0; i < result.length; i++) {
						result[i].typeShow = this.types.find(function (e) {
							return e.value === result[i].type
						}).label;
					}
					this.devices = result;
					if (this.nowType !== "") {
						this.changeType(this.nowType);
					}
				} else {
					if (res.status === 402) {
						this.$message({
							message: "登录已过期",
							type: 'error'
						})
						this.$router.push("/login");
					} else if (res.status === 401) {
						this.$message({
							message: "没有相关权限",
							type: 'error'
						})
					} else {
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
		// 初始化所有设备状态
		initAll() {
			fetch(this.URL + "api/resources/init_all_param", {
				method: 'PUT',
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					this.$message({
						message: "所有设备已经设置为初始状态",
						type: 'success'
					})
				}else{
					this.$message({
						message: "设置失败",
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
		// 关闭所有设备
		closeAll() {
			fetch(this.URL + "api/resources/close_all_param", {
				method: 'PUT',
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					this.$message({
						message: "所有设备已经设置为关闭状态",
						type: 'success'
					})
				}else{
					this.$message({
						message: "设置失败",
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
		// 刷新摄像头的token
		refreshCamera(){
			fetch(this.URL + "api/resources/refresh_appToken", {
				method: "POST",
				headers: {
					Authorization: 'Bearer  ' + localStorage.getItem("token")
				}
			}).then(res => res.json()).then(res => {
				if (res.success){
					this.$message({
						message: "摄像头Token已更新",
						type: 'success'
					})
				}else{
					this.$message({
						message: "更新失败",
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
		}
	},
	// 初始化数据
	mounted() {
		this.getDevices();
	}
}
</script>

<style>
.el-table .cell {
	white-space: pre-line;
}
</style>

<style scoped>
div {
	box-sizing: border-box;
}

#device {
	padding: 10px 30px 10px 30px;
	height: 100%;
}

.title_block,
.option_block {
	width: 100%;
	display: flex;
	align-items: center;
	height: 10%;
	padding-bottom: 20px;
}

.title {
	font-size: 25px;
}

#add_button,
#import_button,
#init_button,
#close_button,
#refresh_button {
	padding-left: 20px;
}

.search_block {
	display: flex;
}

.el-icon-circle-plus-outline, .el-icon-remove-outline{
	cursor: pointer;
	font-size: 20px;
	font-weight: bold;
}

.cam_block{
	width: 100%;
}

.cam_block .el-input{
	width: 90%;
	margin-bottom: 10px;
}

.table_block {
	height: 70%;
}</style>

