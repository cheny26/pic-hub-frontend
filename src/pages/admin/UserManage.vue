<template>
  <div id="main">
    <!-- Search Form -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="账号">
          <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
            <a-button @click="resetSearch">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- Data Table -->
    <a-card class="table-card" :bordered="false">
      <template #title>
        <a-space>
          <UserOutlined />
          <span>用户列表</span>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        @change="doTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userAvatar'">
            <a-avatar :size="56" :src="record.userAvatar">
              {{ record.userName?.charAt(0)?.toUpperCase() }}
            </a-avatar>
          </template>
          <template v-else-if="column.dataIndex === 'userRole'">
            <a-tag :color="record.userRole === 'admin' ? 'red' : 'green'">
              {{ record.userRole }}
            </a-tag>
          </template>
          <template
            v-else-if="column.dataIndex === 'createTime' || column.dataIndex === 'updateTime'"
          >
            {{ formatDate(record[column.dataIndex]) }}
          </template>
          <template v-else-if="column.dataIndex === 'operation'">
            <a-space>
              <a-button type="primary" size="small" @click="showEditModal(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个用户吗？"
                @confirm="doDelete(record.id)"
                ok-text="确定"
                cancel-text="取消"
              >
                <a-button type="primary" danger size="small">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="editModalVisible"
      :title="editingRecord ? '编辑用户' : '新增用户'"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
      :confirmLoading="editSubmitting"
    >
      <a-form ref="editFormRef" :model="editForm" :rules="editFormRules" layout="vertical">
        <a-form-item label="账号" name="userAccount">
          <a-input v-model:value="editForm.userAccount" placeholder="请输入账号" />
        </a-form-item>
        <a-form-item label="用户名" name="userName">
          <a-input v-model:value="editForm.userName" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="简介" name="userProfile">
          <a-textarea v-model:value="editForm.userProfile" placeholder="请输入用户简介" :rows="4" />
        </a-form-item>
        <a-form-item label="用户角色" name="userRole">
          <a-select v-model:value="editForm.userRole">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import {
  deleteUserUsingPost,
  listUserVoByPageUsingPost,
  updateUserUsingPost,
} from '@/api/userController'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'

const loading = ref(false)
const editModalVisible = ref(false)
const editSubmitting = ref(false)
const editingRecord = ref<API.UserVO | null>(null)
const editFormRef = ref<FormInstance>()

const columns = [
  {
    title: '账号',
    dataIndex: 'userAccount',
    width: 120,
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    width: 120,
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    width: 80,
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    ellipsis: true,
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 160,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 160,
    fixed: 'right',
  },
]

const dataList = ref<API.UserVO[]>([])
const total = ref(0)

const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
})

const editForm = reactive({
  id: undefined,
  userAccount: '',
  userName: '',
  userProfile: '',
  userRole: 'user',
})

const editFormRules = {
  userAccount: [{ required: true, message: '请输入账号' }],
  userName: [{ required: true, message: '请输入用户名' }],
  userRole: [{ required: true, message: '请选择用户角色' }],
}

const formatDate = (date: string | number) => {
  return new Date(date).toLocaleString()
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await listUserVoByPageUsingPost(searchParams)
    if (res.data.data) {
      total.value = Number(res.data.data.total ?? 0)
      dataList.value = res.data.data.records ?? []
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } finally {
    loading.value = false
  }
}

const pagination = computed(() => ({
  current: searchParams.current ?? 1,
  pageSize: searchParams.pageSize ?? 10,
  total: total.value,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
}))

const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const resetSearch = () => {
  searchParams.userAccount = undefined
  searchParams.userName = undefined
  searchParams.current = 1
  fetchData()
}

const showEditModal = (record?: API.UserVO) => {
  editingRecord.value = record as API.UserVO
  if (record) {
    Object.assign(editForm, record)
  } else {
    Object.assign(editForm, {
      id: undefined,
      userAccount: '',
      userName: '',
      userProfile: '',
      userRole: 'user',
    })
  }
  editModalVisible.value = true
}

const handleEditSubmit = async () => {
  try {
    await editFormRef.value?.validate()
    editSubmitting.value = true

    const res = await updateUserUsingPost(editForm)
    if (res.data.code === 0) {
      message.success('保存成功')
      editModalVisible.value = false
      fetchData()
    } else {
      message.error('保存失败：' + res.data.message)
    }
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    editSubmitting.value = false
  }
}

const handleEditCancel = () => {
  editModalVisible.value = false
  editFormRef.value?.resetFields()
}

const doDelete = async (id: number) => {
  if (!id) return

  try {
    const res = await deleteUserUsingPost({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败：' + error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#main {
  width: 90%;
  margin: 0 auto;
  padding: 24px;
}

.search-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}
</style>
