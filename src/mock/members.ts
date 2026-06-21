export interface DemoMemberProfile {
  id: string
  name: string
  shortName: string
  category: string
  organizationType: string
  workgroups: string[]
  summary: string
}

export const demoMemberProfiles: DemoMemberProfile[] = [
  {
    id: 'aurora-lab',
    name: '星河视研院',
    shortName: '星河视研',
    category: '主任委员单位',
    organizationType: '科研院所',
    workgroups: ['技术标准组', '测试验证组', '架构与内核组'],
    summary: '承担架构研究、测试方案共建与标准文本统稿工作。',
  },
  {
    id: 'huayu-network',
    name: '华域视联',
    shortName: '华域视联',
    category: '副主任委员单位',
    organizationType: '运营商',
    workgroups: ['技术标准组', '产业推进组'],
    summary: '参与终端能力需求整理、场景试点反馈和产业推进协同。',
  },
  {
    id: 'cloudframe-research',
    name: '云帧研究院',
    shortName: '云帧研究',
    category: '委员单位',
    organizationType: '科研院所',
    workgroups: ['AI与智能体组', '接口规范组'],
    summary: '负责能力接口研究、智能服务场景设计和多端协同验证。',
  },
  {
    id: 'smartchip',
    name: '智芯微电子',
    shortName: '智芯微电',
    category: '委员单位',
    organizationType: '芯片企业',
    workgroups: ['安全可信组', '终端产品组'],
    summary: '提供终端芯片适配、可信执行能力和底层性能优化建议。',
  },
  {
    id: 'glowlink',
    name: '鸿光智联',
    shortName: '鸿光智联',
    category: '委员单位',
    organizationType: '终端厂商',
    workgroups: ['终端产品组', '测试验证组'],
    summary: '配合演示终端接入、兼容验证与终端差异性测试。',
  },
  {
    id: 'nova-digital',
    name: '新曜数字',
    shortName: '新曜数字',
    category: '委员单位',
    organizationType: '操作系统企业',
    workgroups: ['终端产品组', '应用生态组'],
    summary: '提供终端系统集成支持和样机适配演示能力。',
  },
  {
    id: 'lingjing-ai',
    name: '灵境智能',
    shortName: '灵境智能',
    category: '合作单位',
    organizationType: 'AI 技术企业',
    workgroups: ['AI与智能体组', '媒体框架组'],
    summary: '参与智能体编排、内容理解和交互体验方案演示。',
  },
  {
    id: 'xuandun-lab',
    name: '玄盾测评',
    shortName: '玄盾测评',
    category: '合作单位',
    organizationType: '测试认证机构',
    workgroups: ['测试验证组', '安全可信组'],
    summary: '负责演示环境中的测试流程编排和测评报告模板设计。',
  },
]

export const demoOrganizationNames = demoMemberProfiles.map((item) => item.name)
