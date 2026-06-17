<template>
  <div class="dashboard">
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon bg-blue">
          <i class="el-icon-document"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overview.totalArchives }}</div>
          <div class="stat-label">档案总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-green">
          <i class="el-icon-check"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overview.availableArchives }}</div>
          <div class="stat-label">在库档案</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-orange">
          <i class="el-icon-share"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overview.borrowedArchives }}</div>
          <div class="stat-label">已借阅</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-red">
          <i class="el-icon-alert"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overview.pendingBorrows }}</div>
          <div class="stat-label">待审批借阅</div>
        </div>
      </div>
    </div>
    
    <div class="charts-row">
      <div class="chart-card">
        <h3>年度归档趋势</h3>
        <div ref="yearlyChart" class="chart"></div>
      </div>
      <div class="chart-card">
        <h3>分类占比</h3>
        <div ref="categoryChart" class="chart"></div>
      </div>
    </div>
    
    <div class="charts-row">
      <div class="chart-card full-width">
        <h3>月度借阅趋势</h3>
        <div ref="borrowChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import request from '@/utils/request'

const overview = ref({
  totalArchives: 0,
  borrowedArchives: 0,
  availableArchives: 0,
  totalCategories: 0,
  pendingBorrows: 0
})

const yearlyChart = ref(null)
const categoryChart = ref(null)
const borrowChart = ref(null)

const loadOverview = async () => {
  try {
    const res = await request.get('/statistics/overview')
    if (res.code === 200) {
      overview.value = res.data
    }
  } catch (err) {
    console.error('加载概览数据失败')
  }
}

const drawYearlyChart = async () => {
  try {
    const res = await request.get('/statistics/yearly-archive')
    if (res.code === 200) {
      const data = res.data
      const labels = data.map(d => `${d.month}月`)
      const values = data.map(d => d.count)
      
      const canvas = document.createElement('canvas')
      yearlyChart.value.innerHTML = ''
      yearlyChart.value.appendChild(canvas)
      
      const ctx = canvas.getContext('2d')
      canvas.width = 400
      canvas.height = 250
      
      const maxValue = Math.max(...values, 1)
      const barWidth = 30
      const gap = 20
      const padding = 40
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.strokeStyle = '#e4e7ed'
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = padding + (canvas.height - padding * 2) * i / 5
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(canvas.width - padding, y)
        ctx.stroke()
        ctx.fillStyle = '#999'
        ctx.font = '12px Arial'
        ctx.textAlign = 'right'
        ctx.fillText(Math.round(maxValue * (5 - i) / 5), padding - 10, y + 4)
      }
      
      const colors = ['#409eff', '#67c23a', '#f5a623', '#e74c3c', '#9b59b6']
      data.forEach((d, i) => {
        const x = padding + i * (barWidth + gap)
        const height = (d.count / maxValue) * (canvas.height - padding * 2)
        const y = canvas.height - padding - height
        
        ctx.fillStyle = colors[i % colors.length]
        ctx.fillRect(x, y, barWidth, height)
        
        ctx.fillStyle = '#666'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(labels[i], x + barWidth / 2, canvas.height - 10)
      })
    }
  } catch (err) {
    console.error('加载年度归档数据失败')
  }
}

const drawCategoryChart = async () => {
  try {
    const res = await request.get('/statistics/category-stats')
    if (res.code === 200) {
      const data = res.data
      const total = data.reduce((sum, d) => sum + d.count, 0)
      
      const canvas = document.createElement('canvas')
      categoryChart.value.innerHTML = ''
      categoryChart.value.appendChild(canvas)
      
      const ctx = canvas.getContext('2d')
      canvas.width = 400
      canvas.height = 250
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = 100
      
      let startAngle = -Math.PI / 2
      const colors = ['#409eff', '#67c23a', '#f5a623', '#e74c3c', '#9b59b6', '#3498db', '#1abc9c', '#e67e22']
      
      data.forEach((d, i) => {
        const angle = (d.count / total) * 2 * Math.PI
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle)
        ctx.closePath()
        ctx.fillStyle = colors[i % colors.length]
        ctx.fill()
        
        const midAngle = startAngle + angle / 2
        const labelX = centerX + Math.cos(midAngle) * (radius + 25)
        const labelY = centerY + Math.sin(midAngle) * (radius + 25)
        
        ctx.fillStyle = '#333'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(d.category_name, labelX, labelY - 5)
        ctx.fillText(d.count, labelX, labelY + 12)
        
        startAngle += angle
      })
      
      if (data.length === 0) {
        ctx.fillStyle = '#999'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('暂无数据', centerX, centerY)
      }
    }
  } catch (err) {
    console.error('加载分类数据失败')
  }
}

const drawBorrowChart = async () => {
  try {
    const res = await request.get('/statistics/borrow-trend')
    if (res.code === 200) {
      const data = res.data
      const labels = data.map(d => `${d.month}月`)
      const values = data.map(d => d.count)
      
      const canvas = document.createElement('canvas')
      borrowChart.value.innerHTML = ''
      borrowChart.value.appendChild(canvas)
      
      const ctx = canvas.getContext('2d')
      canvas.width = 800
      canvas.height = 250
      
      const maxValue = Math.max(...values, 1)
      const padding = 40
      const stepX = (canvas.width - padding * 2) / (data.length - 1)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.strokeStyle = '#e4e7ed'
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = padding + (canvas.height - padding * 2) * i / 5
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(canvas.width - padding, y)
        ctx.stroke()
        ctx.fillStyle = '#999'
        ctx.font = '12px Arial'
        ctx.textAlign = 'right'
        ctx.fillText(Math.round(maxValue * (5 - i) / 5), padding - 10, y + 4)
      }
      
      ctx.beginPath()
      ctx.strokeStyle = '#409eff'
      ctx.lineWidth = 2
      ctx.shadowColor = 'rgba(64, 158, 255, 0.3)'
      ctx.shadowBlur = 10
      
      data.forEach((d, i) => {
        const x = padding + i * stepX
        const y = canvas.height - padding - (d.count / maxValue) * (canvas.height - padding * 2)
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#409eff'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
      })
      
      ctx.stroke()
      ctx.shadowBlur = 0
      
      ctx.fillStyle = '#666'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      data.forEach((d, i) => {
        const x = padding + i * stepX
        ctx.fillText(labels[i], x, canvas.height - 10)
      })
    }
  } catch (err) {
    console.error('加载借阅趋势数据失败')
  }
}

onMounted(() => {
  loadOverview()
  drawYearlyChart()
  drawCategoryChart()
  drawBorrowChart()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.bg-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.bg-green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.bg-orange {
  background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
}

.stat-icon.bg-red {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #999;
  font-size: 14px;
}

.charts-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-card.full-width {
  flex: 2;
}

.chart-card h3 {
  margin: 0 0 20px;
  font-size: 16px;
  color: #333;
}

.chart {
  height: 250px;
}
</style>
