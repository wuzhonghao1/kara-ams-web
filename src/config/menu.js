// link 除了链接外 还用于 匹配菜单高亮
// path 用户匹配菜单展开（刷新高亮的子菜单上级自动展开） 匹配原理是 link 的一级文件夹名称等于path的值

export default [
  {
    name: '首页',
    icon: 'ams-home',
    link: '/',
  },
  {
    name: '业务申请',
    icon: 'ams-apply',
    path:'apply',
    key:'apply',
    subMenu: [
      // 转移类
      {
        name: '资产转移申请',
        link: '/apply/transfer',
      },
      {
        hidden: true,
        name: '资产转移申请审批',
        link: '/apply/transfer/:id',
      },
      {
        hidden: true,
        name: '资产转移申请详情',
        link: '/apply/transferDetail/:id',
      },
      // 赔偿类
      {
        name: '资产赔偿申请',
        link: '/apply/compensate',
      },
      {
        hidden: true,
        name: '资产赔偿申请审批',
        link: '/apply/compensate/:id',
      },
      {
        hidden: true,
        name: '资产赔偿申请详情',
        link: '/apply/compensateDetail/:id',
      },
      // 报废类
      {
        name: '资产报废申请',
        link: '/apply/invalidate',
      },
      {
        hidden: true,
        name: '资产报废申请审批',
        link: '/apply/invalidate/:id',
      },
      {
        hidden: true,
        name: '资产报废申请详情',
        link: '/apply/invalidateDetail/:id',
      },
    ],
  },
  {
    name: '申请审批',
    icon: 'ams-approve',
    path:'businessApproval',
    key:'businessApproval',
    subMenu: [
      {
        name: '我的待办任务',
        link: '/businessApproval/search',
      },
      {
        name: '设置审批代理人',
        link: '/businessApproval/agent'
      },
    ],
  },
  {
    name: '申请查询',
    icon: 'ams-search',
    path:'applicationSearch',
    key:'applicationSearch',
    subMenu: [
      {
        name: '申请单查询',
        link: '/applicationSearch/search',
      },
    ],
  },
  {
    name: '财务审核',
    icon: 'ams-finance',
    path:'financialAudit',
    key:'financialAudit',
    subMenu: [
      {
        name: '财务审核平台',
        link: '/financialAudit/platform',
      },
    ],
  },
  {
    name: '资产变更',
    icon: 'ams-modify-asset',
    path:'transfer',
    key:'transfer',
    subMenu: [
      {
        name: 'CCOwner确认',
        link: '/transfer/ccOwnerConfirm',
      },
    ],
  },
  {
      name: '资产盘点',
      icon: 'ams-check-asset',
      path:'assetsCheck',
      key:'assetsCheck',
      subMenu: [
          {
              name: '资产Owner确认',
              link: '/assetsCheck/ownerConfirm',
          },
          {
            hidden: true,
            name: '资产Owner确认详情',
            link: '/assetsCheck/ownerConfirmDetail/:id',
          },
          {
              name: 'CCOwner确认',
              link: '/assetsCheck/ccOwnerConfirm',
          },
          {
            hidden: true,
            name: 'CCOwner确认详情',
            link: '/assetsCheck/ccOwnerConfirm/:id',
          },
          {
              name: '盘点任务查询',
              link: '/assetsCheck/taskQuery',
          },
          {
              name: '盘点任务设置',
              link: '/assetsCheck/taskSetting',
          },
      ],
  },
  {
    name: '资产查询',
    icon: 'ams-search-asset',
    path:'assetInquiry',
    key:'assetInquiry',
    subMenu: [
      {
        name: '我的资产查询',
        link: '/assetInquiry/myAsset',
      },
      {
        name: 'CCOwner查询',
        link: '/assetInquiry/ccManage',
      },
      {
        name: '资产信息查询',
        link: '/assetInquiry/manager',
      },
      {
        name: '直接下属资产查询',
        link: '/assetInquiry/managerSbu',
      },
      {
        name: 'BU内资产查询',
        link: '/assetInquiry/buAsset',
      },
    ],
  },
  {
    name: '系统管理',
    icon: 'ams-system',
    path:'system',
    key:'system',
    subMenu: [
      {
        name: '汇款账号维护',
        link: '/system/remittanceAccount',
      },
      {
        name: '角色管理',
        link: '/system/role',
      },
      {
        name: '用户管理',
        link: '/system/user',
      },
    ],
  },
]
