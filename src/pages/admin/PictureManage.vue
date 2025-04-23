<template>
  <div id="main">
    <!-- Search Form -->
    <a-card class="search-card" :bordered="false">
      <div >
        <a-space style="margin-left: auto;">
          <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
          <a-button type="primary" href="/add_picture/batch" target="_blank" ghost
            >+ 批量创建图片</a-button
          >
        </a-space>
      </div>

      <a-form :model="searchParams" @finish="doSearch" layout="inline">
        <a-form-item label="关键词" name="searchText">
          <a-input
            v-model:value="searchParams.searchText"
            placeholder="从名称和简介搜索"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="分类" name="category">
          <a-auto-complete
            v-model:value="searchParams.category"
            :options="categoryOptions"
            placeholder="请输入分类"
          />
        </a-form-item>
        <a-form-item label="标签" name="tags" style="width: 150px">
          <a-select
            v-model:value="searchParams.tags"
            :options="tagOptions"
            mode="tags"
            placeholder="请输入标签"
          />
        </a-form-item>
        <a-form-item label="审核状态" name="reviewStatus">
          <a-select
            v-model:value="searchParams.reviewStatus"
            :options="PIC_REVIEW_STATUS_OPTIONS"
            placeholder="请输入审核状态"
            style="min-width: 180px"
            allow-clear
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button @click="resetSearch" style="margin-left: 10px">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- Data Table -->
    <a-card class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :loading="loading"
        @change="doTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'url'">
            <a-image :src="record.url" :width="120" />
          </template>
          <!-- 标签 -->
          <template v-if="column.dataIndex === 'tags'">
            <a-space wrap>
              <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
            </a-space>
          </template>
          <!-- 图片信息 -->
          <template v-if="column.dataIndex === 'picInfo'">
            <div>格式：{{ record.picFormat }}</div>
            <div>宽度：{{ record.picWidth }}</div>
            <div>高度：{{ record.picHeight }}</div>
            <div>宽高比：{{ getAspectRatio(record.picWidth, record.picHeight) }}</div>
            <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ new Date(record.createTime).toLocaleString() }}
          </template>
          <!-- 审核信息 -->
          <template v-if="column.dataIndex === 'reviewMessage'">
            <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
            <div>审核信息：{{ record.reviewMessage }}</div>
            <div>审核人：{{ record.reviewerId }}</div>
          </template>

          <template v-else-if="column.dataIndex === 'editTime'">
            {{ new Date(record.editTime).toLocaleString() }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank"
              >编辑</a-button
            >
            <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
            <a-button
              v-if="record.reviewStatus === PIC_REVIEW_STATUS_ENUM.REVIEWING"
              type="link"
              @click="openReviewModal(record)"
            >
              审核
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 审核模态框 -->
    <a-modal
      v-model:visible="reviewModalVisible"
      title="图片审核"
      @ok="submitReview"
      :confirmLoading="reviewLoading"
    >
      <a-form :model="reviewForm" layout="vertical">
        <a-form-item label="审核状态" name="reviewStatus">
          <a-radio-group v-model:value="reviewForm.reviewStatus">
            <a-radio :value="PIC_REVIEW_STATUS_ENUM.PASS">通过</a-radio>
            <a-radio :value="PIC_REVIEW_STATUS_ENUM.REJECT">不通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="reviewForm.reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT"
          label="审核理由"
          name="reviewMessage"
          :rules="[
            {
              required: reviewForm.reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT,
              message: '拒绝时必须填写理由',
            },
          ]"
        >
          <a-textarea
            v-model:value="reviewForm.reviewMessage"
            placeholder="请输入审核理由"
            :rows="4"
            :disabled="reviewForm.reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  listPictureByPageUsingPost,
  listPictureTagCategoryUsingGet,
  reviewPictureUsingPost,
} from '@/api/pictureController'
import { ReloadOutlined } from '@ant-design/icons-vue'
import {
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
  PIC_REVIEW_STATUS_ENUM,
} from '@/constants/picture.ts'

const loading = ref(false)

const columns = [
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  reviewStatus: undefined,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }
})

// 获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
    reviewStatus: searchParams.reviewStatus,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

const getAspectRatio = (width: number, height: number) => {
  if (height === 0) {
    throw new Error('Height cannot be zero.')
  }
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }
  const divisor = gcd(width, height)
  return `${width / divisor}:${height / divisor}`
}

// 审核模态框相关状态
const reviewModalVisible = ref(false)
const reviewLoading = ref(false)
const currentRecord = ref<API.Picture>()
const reviewForm = reactive({
  reviewStatus: PIC_REVIEW_STATUS_ENUM.PASS,
  reviewMessage: '',
  id: 0,
})

// 打开审核模态框
const openReviewModal = (record: API.Picture) => {
  currentRecord.value = record
  reviewForm.id = record.id
  reviewForm.reviewStatus = PIC_REVIEW_STATUS_ENUM.PASS
  reviewForm.reviewMessage = ''
  reviewModalVisible.value = true
}

// 提交审核
const submitReview = async () => {
  // 如果是拒绝状态但没有填写理由，提示错误
  if (reviewForm.reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT && !reviewForm.reviewMessage) {
    message.error('拒绝时必须填写理由')
    return
  }

  reviewLoading.value = true
  try {
    const res = await reviewPictureUsingPost({
      id: reviewForm.id,
      reviewStatus: reviewForm.reviewStatus,
      reviewMessage:
        reviewForm.reviewMessage ||
        (reviewForm.reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS
          ? '管理员审核通过'
          : '管理员审核拒绝'),
    })

    if (res.data.code === 0) {
      message.success('审核操作成功')
      reviewModalVisible.value = false
      // 重新获取列表
      fetchData()
    } else {
      message.error('审核操作失败，' + res.data.message)
    }
  } catch (error) {
    message.error('审核操作失败：' + error)
  } finally {
    reviewLoading.value = false
  }
}

// 获取数据
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const resetSearch = () => {
  searchParams.category = ''
  searchParams.tags = []
  searchParams.current = 1
  searchParams.reviewStatus = undefined
  fetchData()
}

const doDelete = async (id: number) => {
  if (!id) return
  try {
    const res = await deletePictureUsingPost({ id })
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
// 获取标签和分类选项
interface Option {
  value: string
  label: string
}
const categoryOptions = ref<Option[]>([])
const tagOptions = ref<Option[]>([{ label: '1', value: '2' }])

const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}
onMounted(() => {
  fetchData()
  getTagCategoryOptions()
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
