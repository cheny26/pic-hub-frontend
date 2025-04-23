// @ts-ignore
/* eslint-disable */
import request from '../utils/request'

/** deQRcode POST /api/qrcode */
export async function deQRcodeUsingPost(body: {}, upFile?: File, options?: { [key: string]: any }) {
  const formData = new FormData()

  if (upFile) {
    formData.append('upFile', upFile)
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele]

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''))
        } else {
          formData.append(ele, JSON.stringify(item))
        }
      } else {
        formData.append(ele, item)
      }
    }
  })

  return request<API.BaseResponseString_>('/api/qrcode', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  })
}
