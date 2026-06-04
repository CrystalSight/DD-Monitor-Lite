# DD Monitor Lite

Bilibili 主播实时开播监控桌面应用

## 功能特性

- 📺 直播间管理: 支持添加和移除监控的直播间
- 🔔 实时通知: 开播/下播时发送系统通知
- 📊 状态监控: 实时显示直播标题、封面、观看人数、直播时长等信息
- 💾 数据持久化: 自动保存直播间列表,重启后恢复
- 🎨 简洁界面: 现代化 UI 设计,支持响应式布局

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS
- **桌面框架**: Tauri 2.0
- **后端**: Rust (reqwest + tokio)
- **状态管理**: Zustand

## 安装依赖

确保已安装 Node.js 和 Rust 环境。

```bash
# 安装前端依赖
npm install

# 安装 Rust 工具链(如果未安装)
# Windows: winget install Rustlang.Rustup
# macOS/Linux: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## 开发模式

```bash
npm run tauri dev
```

这将启动开发服务器并打开应用窗口。

## 构建生产版本

```bash
npm run tauri build
```

构建完成后,安装包位于 `src-tauri/target/release/bundle/` 目录下。

## 使用说明

1. **添加直播间**: 点击右上角 "+ 添加直播间" 按钮,输入房间号或直播间链接
2. **查看状态**: 直播间卡片会实时显示主播名称、直播状态、观看人数等信息
3. **接收通知**: 当主播开播或下播时,会收到系统通知
4. **移除直播间**: 点击卡片右上角的 ✕ 按钮移除监控

## 注意事项

- 首次使用时需要授予通知权限
- 直播间状态每 30 秒自动刷新一次
- 图片加载失败时会显示默认占位图
- 请遵守 Bilibili API 使用规范,仅用于学习测试

## 项目结构

```
dd-monitor-lite/
├── src/                    # React 前端源码
│   ├── components/         # UI 组件
│   ├── stores/             # 状态管理
│   ├── types/              # TypeScript 类型
│   └── utils/              # 工具函数
├── src-tauri/              # Tauri Rust 后端
│   ├── src/
│   │   ├── api/            # Bilibili API 封装
│   │   ├── commands.rs     # Tauri 命令
│   │   └── monitor.rs      # 监控服务
│   └── Cargo.toml          # Rust 依赖配置
└── package.json
```

## 许可证

本项目仅供学习测试使用,请遵守相关法律法规和 Bilibili 使用条款。
